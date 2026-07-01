// Regras comerciais centralizadas (preço, frete, pedido mínimo e cupons).
// Fonte única de verdade — usado pelo store e pelos seletores.

export const SHOP = {
  // Taxa de entrega fixa, em reais.
  DELIVERY_FEE: 8,
  // Frete grátis a partir deste subtotal (antes de descontos).
  FREE_DELIVERY_THRESHOLD: 25,
  // Valor mínimo do pedido para fechar a compra.
  MIN_ORDER: 15,
  // Desconto automático a partir deste subtotal.
  AUTO_DISCOUNT_THRESHOLD: 80,
  AUTO_DISCOUNT_PERCENT: 15,
}

// Cupons válidos. A chave é o código (sempre em MAIÚSCULAS).
export const COUPONS = {
  PRIMEIRA10: {
    code: 'PRIMEIRA10',
    percent: 10,
    label: '10% de desconto na primeira compra',
  },
}

// Retorna o cupom correspondente ao código informado, ou null.
export function validateCoupon(code) {
  if (!code) return null
  const key = String(code).trim().toUpperCase()
  return COUPONS[key] || null
}

// Calcula todos os totais do carrinho de forma consistente.
// Regras de desconto NÃO acumulam: aplica-se o maior percentual disponível
// (automático de 15% acima de R$80 OU o cupom informado).
export function computeTotals(items, coupon) {
  const arr = Object.values(items || {})
  const subtotal = arr.reduce((n, i) => n + i.salePrice * i.qty, 0)
  const originalTotal = arr.reduce((n, i) => n + i.originalPrice * i.qty, 0)
  const itemSavings = +(originalTotal - subtotal).toFixed(2)

  const autoPercent =
    subtotal >= SHOP.AUTO_DISCOUNT_THRESHOLD ? SHOP.AUTO_DISCOUNT_PERCENT : 0
  const couponPercent = coupon?.percent ?? 0
  const appliedPercent = Math.max(autoPercent, couponPercent)
  const discount = +((subtotal * appliedPercent) / 100).toFixed(2)
  const discountSource =
    appliedPercent === 0 ? null : autoPercent >= couponPercent ? 'auto' : 'coupon'

  const subtotalAfterDiscount = +(subtotal - discount).toFixed(2)
  const freeDelivery = subtotal >= SHOP.FREE_DELIVERY_THRESHOLD
  const deliveryFee = freeDelivery ? 0 : SHOP.DELIVERY_FEE
  const total = +(subtotalAfterDiscount + deliveryFee).toFixed(2)
  const minOrderMet = subtotal >= SHOP.MIN_ORDER

  return {
    subtotal,
    savings: itemSavings,
    discount,
    appliedPercent,
    discountSource,
    deliveryFee,
    freeDelivery,
    total,
    minOrderMet,
    minOrder: SHOP.MIN_ORDER,
    freeDeliveryThreshold: SHOP.FREE_DELIVERY_THRESHOLD,
  }
}
