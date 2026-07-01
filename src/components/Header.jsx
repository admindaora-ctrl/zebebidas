import { Link } from 'react-router-dom'
import { Clock3, MapPin, ShoppingCart } from 'lucide-react'
import { SITE_CONFIG } from '../config/site'
import { DEFAULT_LOCATION } from '../config/locations'
import { ROUTES } from '../constants/routes'
import { useCartCount, useLocation, useShopActions } from '../hooks/useShopSelectors'

export function Header() {
  const count = useCartCount()
  const { openCart } = useShopActions()
  const location = useLocation() || DEFAULT_LOCATION

  return (
    <>
      <div className="top-strip">Ofertas ativas • Entrega rápida • Bebidas geladas</div>
      <header className="main-header">
        <div className="main-header__inner">
          <Link to={ROUTES.HOME} className="brand" aria-label={`${SITE_CONFIG.appName} — ir para o início`}>
            {SITE_CONFIG.appName}
          </Link>
          <button className="icon-btn" onClick={openCart} aria-label="Abrir carrinho">
            <ShoppingCart size={22} />
            {count > 0 && <span className="cart-counter">{count}</span>}
          </button>
        </div>
        <div className="location-strip">
          <p>
            <MapPin size={14} /> Entrega em {location.cityName}{location.uf ? `/${location.uf}` : ''}
          </p>
          <span>
            <Clock3 size={14} /> até {location.etaMin} min
          </span>
        </div>
      </header>
    </>
  )
}
