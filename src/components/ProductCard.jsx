import { Plus } from 'lucide-react'
import { PriceBlock } from './common/PriceBlock'
import { FallbackImage } from './common/FallbackImage'
import { useShopActions } from '../hooks/useShopSelectors'

export function ProductCard({ product }) {
  const { addToCart } = useShopActions()
  const handleAdd = () => {
    addToCart(product)
    window.dispatchEvent(
      new CustomEvent('shop:item-added', {
        detail: { name: product.name },
      }),
    )
  }

  return (
    <article className="product-card">
      <figure className="product-image">
        <FallbackImage src={product.image} alt={product.name} category={product.category} loading="lazy" />
        {product.discount > 0 && <span className="discount-chip">-{product.discount}%</span>}
      </figure>
      <div className="product-content">
        <h3>{product.name}</h3>
        <div className="product-footer">
          <PriceBlock originalPrice={product.originalPrice} salePrice={product.salePrice} />
          <button className="add-circle" onClick={handleAdd} aria-label={`Adicionar ${product.name}`}>
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
