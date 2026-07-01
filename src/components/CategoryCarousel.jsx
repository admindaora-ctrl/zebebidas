import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { getCategoryIcon } from '../config/categoryIcons'

export function CategoryCarousel({ categories }) {
  return (
    <div className="categories-scroll">
      {categories.map((cat) => {
        const Icon = getCategoryIcon(cat.slug)
        return (
          <Link
            key={cat.slug}
            to={ROUTES.CATEGORY.replace(':slug', cat.slug)}
            className="category-pill"
          >
            <span className="category-pill__icon" style={{ color: cat.color }}>
              <Icon size={20} strokeWidth={2.2} />
            </span>
            <small className="category-pill__label">{cat.name}</small>
          </Link>
        )
      })}
    </div>
  )
}
