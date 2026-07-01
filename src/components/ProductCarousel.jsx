import { ProductCard } from './ProductCard'

export function ProductCarousel({ products }) {
  return (
    <div className="product-carousel">
      {products.map((product) => (
        <div key={product.id} className="product-carousel__item">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
