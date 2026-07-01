export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

export function formatItemCount(count) {
  if (count === 1) return '1 item'
  return `${count} itens`
}
