<?php
/**
 * GET /backend/api/status.php?id=TXN_...
 *
 * O frontend faz polling neste endpoint para saber se o PIX foi pago.
 * Lê o status local (gravado pelo webhook.php) e, se ainda estiver pendente,
 * consulta a WinnerPay diretamente como fallback (caso o webhook atrase/falhe).
 *
 * Response:
 * { "success": true, "transaction_id": "TXN_...", "status": "paid", ... }
 */

require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'error' => 'Metodo nao permitido'], 405);
}

$txId = $_GET['id'] ?? '';

if (empty($txId)) {
    json_response(['success' => false, 'error' => 'Parametro id obrigatorio'], 400);
}

// Status finais — uma vez nesses estados, não precisamos mais consultar a WinnerPay.
$TERMINAL = ['paid', 'completed', 'refunded', 'cancelled', 'failed', 'refused'];

$data = tx_load($txId);

// Caminho rápido: o webhook já gravou um status final localmente.
if ($data !== null && in_array($data['status'] ?? '', $TERMINAL, true)) {
    json_response([
        'success'        => true,
        'transaction_id' => $data['transaction_id'],
        'status'         => $data['status'],
        'amount'         => $data['amount'] ?? 0,
        'order_ref'      => $data['order_ref'] ?? '',
        'updated_at'     => $data['updated_at'] ?? $data['created_at'] ?? null,
        'source'         => 'local',
    ]);
}

// Throttle: o polling do front roda a cada ~4s, mas só consultamos a WinnerPay
// no máximo a cada 10s por transação (o webhook segue como caminho instantâneo).
$REMOTE_INTERVAL = 10;
$lastChecked = isset($data['checked_at']) ? strtotime($data['checked_at']) : 0;
if ($data !== null && (time() - $lastChecked) < $REMOTE_INTERVAL) {
    json_response([
        'success'        => true,
        'transaction_id' => $data['transaction_id'],
        'status'         => $data['status'],
        'amount'         => $data['amount'] ?? 0,
        'order_ref'      => $data['order_ref'] ?? '',
        'updated_at'     => $data['updated_at'] ?? $data['created_at'] ?? null,
        'source'         => 'local',
    ]);
}

// Fallback: webhook ainda não confirmou (ou pode ter falhado). Consulta a
// WinnerPay diretamente — a transação recém-criada está entre as mais recentes.
$remote = winnerpay_request('GET', 'financial/transactions?page=1&per_page=100');

if (!empty($remote['success']) && !empty($remote['transactions']['data'])) {
    foreach ($remote['transactions']['data'] as $tx) {
        if (($tx['transaction_id'] ?? '') !== $txId) {
            continue;
        }

        $status = $tx['status'] ?? ($data['status'] ?? 'pending');

        // Atualiza o arquivo local com o status ao vivo (mantém dados de criação).
        $merged = [
            'transaction_id' => $txId,
            'status'         => $status,
            'amount'         => $tx['amount'] ?? ($data['amount'] ?? 0),
            'order_ref'      => $data['order_ref'] ?? ($tx['metadata']['order_id'] ?? ''),
            'created_at'     => $data['created_at'] ?? ($tx['created_at'] ?? date('c')),
            'updated_at'     => $tx['updated_at'] ?? date('c'),
            'checked_at'     => date('c'),
        ];
        tx_save($txId, $merged);

        json_response([
            'success'        => true,
            'transaction_id' => $txId,
            'status'         => $status,
            'amount'         => $merged['amount'],
            'order_ref'      => $merged['order_ref'],
            'updated_at'     => $merged['updated_at'],
            'source'         => 'winnerpay',
        ]);
    }
}

// Não achou na WinnerPay — devolve o que tiver localmente (ainda pendente),
// registrando o momento da consulta para respeitar o throttle.
if ($data !== null) {
    $data['checked_at'] = date('c');
    tx_save($txId, $data);
    json_response([
        'success'        => true,
        'transaction_id' => $data['transaction_id'],
        'status'         => $data['status'],
        'amount'         => $data['amount'] ?? 0,
        'order_ref'      => $data['order_ref'] ?? '',
        'updated_at'     => $data['updated_at'] ?? $data['created_at'] ?? null,
        'source'         => 'local',
    ]);
}

json_response(['success' => false, 'error' => 'Transacao nao encontrada'], 404);
