import { formatCurrency } from '../../utils/format'

export function PriceBlock({ originalPrice, salePrice, size = 'md' }) {
  return (
    <div className={`price-block ${size}`}>
      {originalPrice > salePrice && <span className="price-original">{formatCurrency(originalPrice)}</span>}
      <strong className="price-sale">{formatCurrency(salePrice)}</strong>
    </div>
  )
}
