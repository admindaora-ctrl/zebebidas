// URL base do backend PHP.
// Em desenvolvimento local com PHP built-in server: php -S localhost:8080 -t backend
// Em producao: apontar para o dominio real.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Lê a resposta como JSON com segurança. Se o servidor devolver HTML
// (ex.: página 404 do nginx) o res.json() quebraria com "Unexpected token '<'";
// aqui transformamos isso numa mensagem clara.
async function parseJsonResponse(res, fallbackMsg) {
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(
      `${fallbackMsg} (HTTP ${res.status}). O servidor de pagamento não respondeu corretamente. Tente novamente em instantes.`,
    )
  }
  return data
}

/**
 * Gera uma cobranca PIX via backend PHP → WinnerPay.
 */
export async function createPixCharge({ amount, customer, items, orderRef }) {
  const res = await fetch(`${API_URL}/pix.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      customer,
      items,
      order_ref: orderRef,
    }),
  })

  const data = await parseJsonResponse(res, 'Erro ao gerar PIX')
  if (!data.success) {
    throw new Error(data.error || 'Erro ao gerar PIX')
  }
  return data
}

/**
 * Consulta o status de um pagamento PIX.
 */
export async function checkPixStatus(transactionId) {
  const res = await fetch(`${API_URL}/status.php?id=${encodeURIComponent(transactionId)}`)
  const data = await parseJsonResponse(res, 'Erro ao consultar status do PIX')
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Erro ao consultar status do PIX')
  }
  return data
}
