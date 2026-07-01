<?php
// Bootstrap compartilhado por todos os endpoints da API.
// Carrega config, seta CORS e fornece helpers.

$config = require __DIR__ . '/../config.php';

// ── Ambiente ───────────────────────────────────────────────────────────
$isDev = ($config['environment'] ?? 'production') === 'development';

// ── Erros PHP ──────────────────────────────────────────────────────────
error_reporting(E_ALL);
ini_set('display_errors', $isDev ? '1' : '0');
ini_set('log_errors', '1');
$logDir = __DIR__ . '/../data';
if (!is_dir($logDir)) mkdir($logDir, 0755, true);
ini_set('error_log', $logDir . '/php-errors.log');

// ── CORS ────────────────────────────────────────────────────────────────
$origin = $config['frontend_url'] ?? '';
if ($origin === '' || $origin === '*') {
    // Em producao, rejeita requests sem origin valido
    if (!$isDev) {
        $origin = 'https://localhost';
    } else {
        $origin = '*';
    }
}
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Envia requisicao para a API WinnerPay.
 */
function winnerpay_request(string $method, string $endpoint, array $body = null): array
{
    global $config, $isDev;

    $url = rtrim($config['api_url'], '/') . '/' . ltrim($endpoint, '/');

    $auth = base64_encode($config['client_id'] . ':' . $config['client_secret']);

    $headers = [
        'Authorization: Basic ' . $auth,
        'Content-Type: application/json',
        'Accept: application/json',
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_CUSTOMREQUEST  => strtoupper($method),
        // SSL: habilitado em producao, desabilitado em dev local
        CURLOPT_SSL_VERIFYPEER => !$isDev,
        CURLOPT_SSL_VERIFYHOST => $isDev ? 0 : 2,
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['success' => false, 'error' => $error, 'http_code' => 0];
    }

    $data = json_decode($response, true) ?? [];
    $data['http_code'] = $httpCode;

    return $data;
}

/**
 * Retorna JSON e encerra.
 */
function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Le o body JSON da requisicao.
 */
function json_input(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Caminho do arquivo de status de uma transacao (file-based, sem DB).
 */
function tx_status_path(string $transactionId): string
{
    $dir = __DIR__ . '/../data';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    // Sanitiza o ID para evitar path traversal
    $safe = preg_replace('/[^A-Za-z0-9_\-]/', '', $transactionId);
    return $dir . '/' . $safe . '.json';
}

/**
 * Salva o status de uma transacao em arquivo JSON.
 */
function tx_save(string $transactionId, array $data): void
{
    $path = tx_status_path($transactionId);
    file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE));
}

/**
 * Le o status de uma transacao.
 */
function tx_load(string $transactionId): ?array
{
    $path = tx_status_path($transactionId);
    if (!file_exists($path)) {
        return null;
    }
    return json_decode(file_get_contents($path), true);
}
