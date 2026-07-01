import { formatCurrency, formatItemCount } from '../../utils/format'
import { FallbackImage } from '../common/FallbackImage'

export function OrderSummary({ items, totals }) {
  return (
    <section className="checkout-card">
      <div className="order-title-row">
        <h3>Itens do Pedido</h3>
        <span>{formatItemCount(items.length)}</span>
      </div>
      <div className="order-list">
        {items.map((item) => (
          <article key={item.id} className="order-row">
            <FallbackImage src={item.image} alt={item.name} category={item.category} />
            <div>
              <p>{item.name}</p>
              <small>
                <b>{item.qty}x</b> {formatCurrency(item.salePrice)} cada
              </small>
            </div>
            <strong>{formatCurrency(item.qty * item.salePrice)}</strong>
          </article>
        ))}
      </div>

      <div className="totals-box">
        <div><span>Subtotal</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
        {totals.discount > 0 && (
          <div>
            <span>Desconto ({totals.appliedPercent}%)</span>
            <strong className="success">- {formatCurrency(totals.discount)}</strong>
          </div>
        )}
        <div>
          <span>Taxa de entrega</span>
          <strong className={totals.deliveryFee === 0 ? 'success' : ''}>
            {totals.deliveryFee === 0 ? 'GRÁTIS' : formatCurrency(totals.deliveryFee)}
          </strong>
        </div>
        <div className="total">
          <span>Total</span>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
      </div>
      {(totals.savings > 0 || totals.discount > 0) && (
        <div className="save-box">
          <span>Você economizou</span>
          <strong>{formatCurrency(totals.savings + totals.discount)}</strong>
        </div>
      )}
    </section>
  )
}
