import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '../constants/routes'

export function SectionHeader({ title, slug, accent, icon: Icon }) {
  return (
    <div className="section-header">
      <h2>
        {Icon ? (
          <span className="section-header__icon" style={{ color: accent }}>
            <Icon size={18} strokeWidth={2.2} />
          </span>
        ) : (
          accent && (
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 20,
                borderRadius: 4,
                background: accent,
                marginRight: 8,
                verticalAlign: 'middle',
              }}
            />
          )
        )}
        {title}
      </h2>
      <Link to={ROUTES.CATEGORY.replace(':slug', slug)} className="section-more">
        Ver mais <ChevronRight size={14} />
      </Link>
    </div>
  )
}
