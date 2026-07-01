import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, X, Tag, Check, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { QuantityControl } from './QuantityControl'
import { PrimaryButton } from '../common/PrimaryButton'
import { FallbackImage } from '../common/FallbackImage'
import { ROUTES } from '../../constants/routes'
import {
  useCartCount,
  useCartItems,
  useCartOpen,
  useCheckoutReadiness,
  useCoupon,
  useShopActions,
  useTotals,
} from '../../hooks/useShopSelectors'

export function CartDrawer() {
  const navigate = useNavigate()
  const cartOpen = useCartOpen()
  const count = useCartCount()
  const items = useCartItems()
  const totals = useTotals()
  const coupon = useCoupon()
  const { canStartCheckout } = useCheckoutReadiness()
  const { closeCart, addToCart, decreaseQty, removeFromCart, applyCoupon, clearCoupon } = useShopActions()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  const canCheckout = canStartCheckout && totals.minOrderMet

  const handleApplyCoupon = () => {
    const ok = applyCoupon(couponInput)
    if (ok) {
      setCouponError('')
      setCouponInput('')
    } else {
      setCouponError('Cupom inválido ou expirado.')
    }
  }

  const handleCheckout = () => {
    if (!canCheckout) return
    closeCart()
    navigate(ROUTES.CHECKOUT_IDENTIFICACAO)
  }

  return (
    <>
      <button
        className={`drawer-overlay ${cartOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-label="Fechar carrinho"
      />
      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Carrinho ({count})</h3>
          <button className="icon-btn muted" onClick={closeCart} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 && (
            <div className="empty-state">
              <ShoppingBag size={34} />
              <p>Seu carrinho está vazio.</p>
              <small>Adicione itens para avançar no pedido.</small>
            </div>
          )}
          {items.map((item) => (
            <article key={item.id} className="drawer-item">
              <FallbackImage src={item.image} alt={item.name} category={item.category} />
              <div className="drawer-item__content">
                <h4>{item.name}</h4>
                <strong>{formatCurrency(item.salePrice)}</strong>
                <div className="drawer-item__actions">
                  <QuantityControl
                    qty={item.qty}
                    onDecrease={() => decreaseQty(item.id)}
                    onIncrease={() => addToCart(item)}
                  />
                  <button
                    className="remove-item-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            {/* Cupom */}
            <div className="coupon-block">
              {coupon ? (
                <div className="coupon-applied">
                  <span><Check size={14} /> Cupom <strong>{coupon.code}</strong> aplicado</span>
                  <button onClick={clearCoupon} aria-label="Remover cupom">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-row">
                    <span className="coupon-row__icon"><Tag size={15} /></span>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError('') }}
                      placeholder="Cupom de desconto"
                    />
                    <button type="button" onClick={handleApplyCoupon} disabled={!couponInput.trim()}>
                      Aplicar
                    </button>
                  </div>
                  {couponError && <small className="coupon-error">{couponError}</small>}
                </>
              )}
            </div>

            <div className="totals-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>
            {totals.discount > 0 && (
              <div className="totals-row">
                <span>Desconto ({totals.appliedPercent}%)</span>
                <strong className="success">- {formatCurrency(totals.discount)}</strong>
              </div>
            )}
            <div className="totals-row">
              <span>Frete</span>
              <strong className={totals.deliveryFee === 0 ? 'success' : ''}>
                {totals.deliveryFee === 0 ? 'Grátis' : formatCurrency(totals.deliveryFee)}
              </strong>
            </div>
            <div className="totals-row total">
              <span>Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>

            {!totals.minOrderMet && (
              <div className="cart-min-order">
                <AlertCircle size={14} />
                <span>Pedido mínimo de {formatCurrency(totals.minOrder)} para finalizar.</span>
              </div>
            )}

            <PrimaryButton onClick={handleCheckout} disabled={!canCheckout}>
              Finalizar Pedido
            </PrimaryButton>
          </div>
        )}
      </aside>
    </>
  )
}
