import { useLocation as useRouterLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatCurrency, formatItemCount } from '../../utils/format'
import { useCartCount, useShopActions, useTotals } from '../../hooks/useShopSelectors'

export function BottomCartBar() {
  const { openCart } = useShopActions()
  const count = useCartCount()
  const totals = useTotals()
  const { pathname } = useRouterLocation()

  // Hide on checkout pages (they have their own sticky footer)
  if (!count || pathname.startsWith('/checkout')) return null

  return (
    <button className="bottom-cart" onClick={openCart}>
      <span>
        Ver carrinho
        <small>{formatItemCount(count)}</small>
      </span>
      <strong>{formatCurrency(totals.total)}</strong>
      <ChevronRight size={18} />
    </button>
  )
}
