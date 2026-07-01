<?php
/**
 * POST /backend/api/pix.php
 *
 * Recebe dados do pedido do frontend React e gera uma cobranca PIX
 * via API WinnerPay. Retorna o QR Code e o pix_copia_e_cola.
 *
 * Body esperado:
 * {
 *   "amount": 150.00,
 *   "customer": { "name": "...", "phone": "...", "cpf": "..." },
 *   "items": [{ "name": "...", "qty": 1, "price": 10.00 }],
 *   "order_ref": "pedido-1234"
 * }
 */

require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Metodo nao permitido'], 405);
}

$input = json_input();

// ── Validacao basica ────────────────────────────────────────────────────
$amount = floatval($input['amount'] ?? 0);
if ($amount < 0.01) {
    json_response(['success' => false, 'error' => 'Valor minimo: R$ 0,01'], 400);
}

$customer    = $input['customer'] ?? [];
$items       = $input['items'] ?? [];
$orderRef    = $input['order_ref'] ?? ('ORD-' . time());

// ── Monta descricao a partir dos itens ──────────────────────────────────
$description = 'Pedido Gelada Ja';
if (count($items) > 0) {
    $names = array_map(fn($i) => ($i['qty'] ?? 1) . 'x ' . ($i['name'] ?? ''), $items);
    $description = implode(', ', array_slice($names, 0, 5));
    if (count($items) > 5) {
        $description .= ' (+' . (count($items) - 5) . ' itens)';
    }
}

// ── Monta body para a WinnerPay ─────────────────────────────────────────
$body = [
    'amount'      => $amount,
    'description' => $description,
    'postbackUrl' => $GLOBALS['config']['webhook_url'],
    // external_id garante idempotencia em caso de retry (mesmo pedido = mesma referencia).
    'external_id' => $orderRef,
    'product_name' => 'Gelada Ja - Delivery',
    'metadata'    => [
        'order_id' => $orderRef,
        'product'  => ['name' => 'Gelada Ja - Delivery'],
    ],
];

// Customer (opcional mas recomendado)
if (!empty($customer['name'])) {
    $doc = null;
    if (!empty($customer['cpf'])) {
        $cpf = preg_replace('/\D/', '', $customer['cpf']);
        $doc = ['type' => 'CPF', 'number' => $cpf];
    }

    $body['customer'] = array_filter([
        'name'     => $customer['name'],
        'email'    => $customer['email'] ?? null,
        'phone'    => $customer['phone'] ?? null,
        'document' => $doc,
    ]);
}

// Items (opcional)
if (count($items) > 0) {
    $body['items'] = array_map(fn($i) => [
        'title'     => $i['name'] ?? 'Produto',
        'quantity'   => intval($i['qty'] ?? 1),
        'unit_price' => floatval($i['price'] ?? 0),
    ], $items);
}

// ── Chama a WinnerPay ───────────────────────────────────────────────────
$result = winnerpay_request('POST', 'financial/receber-pix', $body);

if (empty($result['success'])) {
    $errorMsg = $result['message'] ?? $result['error'] ?? 'Erro ao gerar PIX';
    $httpCode = $result['http_code'] ?? 500;
    json_response([
        'success' => false,
        'error'   => $errorMsg,
    ], $httpCode >= 400 ? $httpCode : 500);
}

// ── Extrai dados da resposta (suporta ambas as estruturas) ──────────────
// WinnerPay pode retornar transaction_id no root ou dentro de "transaction"
$tx = $result['transaction'] ?? [];
$txId   = $tx['transaction_id'] ?? $result['transaction_id'] ?? '';
$status = $tx['status']         ?? $result['status']         ?? 'pending';

// PIX data — pode estar no root ou dentro de "transaction"
$pixCopiaECola = $result['pix_copia_e_cola'] ?? $tx['pix_copia_e_cola'] ?? '';
$qrCodeData    = $result['qr_code_data']     ?? $tx['qr_code_data']     ?? '';
$pixKey        = $result['pix_key']          ?? $tx['pix_key']          ?? '';

// Valida que recebemos um transaction_id valido
if (empty($txId)) {
    json_response([
        'success' => false,
        'error'   => 'WinnerPay nao retornou transaction_id',
    ], 502);
}

// Valida que temos pelo menos o pix_copia_e_cola
if (empty($pixCopiaECola)) {
    json_response([
        'success' => false,
        'error'   => 'WinnerPay nao retornou dados do PIX',
    ], 502);
}

// ── Salva status local (file-based) para polling ────────────────────────
tx_save($txId, [
    'transaction_id' => $txId,
    'status'         => $status,
    'amount'         => $amount,
    'order_ref'      => $orderRef,
    'created_at'     => date('c'),
]);

// ── Retorna para o frontend ─────────────────────────────────────────────
json_response([
    'success'          => true,
    'transaction_id'   => $txId,
    'status'           => $status,
    'amount'           => $amount,
    'pix_copia_e_cola' => $pixCopiaECola,
    'qr_code_data'     => $qrCodeData,
    'pix_key'          => $pixKey,
]);
