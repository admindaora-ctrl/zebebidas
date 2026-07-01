<?php
/**
 * POST /backend/api/webhook.php
 *
 * Recebe notificacoes da WinnerPay quando o status de um pagamento muda.
 * Atualiza o arquivo local de status para que o frontend possa consultar.
 *
 * A WinnerPay envia:
 * {
 *   "event": "transaction.status.updated",
 *   "transaction_id": "TXN_...",
 *   "status": "paid",
 *   ...
 * }
 */

require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Metodo nao permitido'], 405);
}

$rawBody = file_get_contents('php://input');
$input   = json_decode($rawBody, true) ?? [];

// ── Validacao da assinatura HMAC (se secret configurado) ────────────────
$secret = $GLOBALS['config']['webhook_secret'] ?? '';
if ($secret !== '') {
    $signature = $_SERVER['HTTP_X_WINNERPAY_SIGNATURE'] ?? '';
    // Usa o body cru (não re-encoded) para validar a assinatura
    $expected  = 'sha256=' . hash_hmac('sha256', $rawBody, $secret);

    if (!hash_equals($expected, $signature)) {
        json_response(['success' => false, 'error' => 'Assinatura invalida'], 401);
    }
}

// ── Extrai dados do webhook ─────────────────────────────────────────────
$txId   = $input['transaction_id'] ?? '';
$status = $input['status'] ?? '';
$event  = $input['event'] ?? '';

if (empty($txId) || empty($status)) {
    json_response(['success' => false, 'error' => 'Dados incompletos'], 400);
}

// ── Atualiza o status local ─────────────────────────────────────────────
$existing = tx_load($txId);

$data = [
    'transaction_id' => $txId,
    'status'         => $status,
    'event'          => $event,
    'amount'         => $input['amount'] ?? ($existing['amount'] ?? 0),
    'order_ref'      => $existing['order_ref'] ?? '',
    'payer'          => $input['payer'] ?? null,
    'created_at'     => $existing['created_at'] ?? date('c'),
    'updated_at'     => date('c'),
];

tx_save($txId, $data);

// ── Log simples para debug ──────────────────────────────────────────────
$logDir = __DIR__ . '/../data';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
$logFile = $logDir . '/webhook.log';
$logEntry = date('c') . " | $event | $txId | $status\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// ── Responde 200 para a WinnerPay (obrigatorio) ─────────────────────────
json_response(['success' => true, 'received' => true]);
