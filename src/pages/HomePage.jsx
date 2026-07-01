import { useState, useMemo } from 'react'
import { MapPin, Clock3, Flame, Zap, Truck, Snowflake, ShieldCheck, Search, AlertTriangle, Car } from 'lucide-react'
import { categories, getProductsByCategory } from '../mocks/catalog'
import { getCategoryIcon } from '../config/categoryIcons'
import { CategoryCarousel } from '../components/CategoryCarousel'
import { ProductCarousel } from '../components/ProductCarousel'
import { SectionHeader } from '../components/SectionHeader'
import { SearchBar } from '../components/SearchBar'
import { ProductGrid } from '../components/ProductGrid'
import { useLocation } from '../hooks/useShopSelectors'
import { DEFAULT_LOCATION } from '../config/locations'
import { SITE_CONFIG } from '../config/site'
import { SHOP } from '../config/shop'

const PROMO_ITEMS = [
  { icon: Truck, text: 'FRETE GRÁTIS ACIMA DE R$ 25' },
  { icon: Zap, text: 'ENTREGA EXPRESSA NA SUA REGIÃO' },
  { icon: Snowflake, text: 'BEBIDA GELADA NA SUA PORTA' },
  { icon: Flame, text: 'OFERTAS EXCLUSIVAS TODO DIA' },
  { icon: ShieldCheck, text: 'PAGAMENTO SEGURO VIA PIX' },
]

// Ordem de exibição das vitrines na home.
const HOME_SECTIONS = [
  'ofertas', 'cervejas', 'destilados', 'vinhos', 'energeticos', 'churrasco',
  'refrigerantes', 'drinks-prontos', 'chopp', 'aguas-e-gelo', 'nao-alcoolicos',
  'sobremesas', 'conveniencia', 'cigarros',
]

function PromoStrip() {
  const doubled = [...PROMO_ITEMS, ...PROMO_ITEMS]
  return (
    <div className="promo-strip">
      <div className="promo-strip__track">
        {doubled.map((item, i) => {
          const Icon = item.icon
          return (
            <span key={i} className="promo-strip__item">
              <Icon size={13} strokeWidth={2.4} /> {item.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function Hero({ searchQuery, onSearch, loc }) {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero-kicker">
          <span className="hero-live-dot" />
          <small>Aberto agora • Entrega ativa — {loc.cityName}{loc.uf ? `/${loc.uf}` : ''}</small>
        </div>

        <h1>Bebidas & Conveniência<br />na sua porta</h1>
        <p>Cerveja gelada, destilados, vinhos, combos e muito mais. Entrega expressa na sua região.</p>

        <div className="hero-tags">
          <span><MapPin size={11} /> Distribuidora a {loc.distanceKm.toString().replace('.', ',')}km</span>
          <span><Clock3 size={11} /> Entrega em até {loc.etaMin} min</span>
          <span><Flame size={11} /> Frete grátis acima de R${SHOP.FREE_DELIVERY_THRESHOLD}</span>
        </div>

        <div style={{ marginTop: 20, maxWidth: 520 }}>
          <SearchBar value={searchQuery} onChange={onSearch} />
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation() || DEFAULT_LOCATION

  const allProducts = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return categories.flatMap(c => getProductsByCategory(c.slug)).filter(p =>
      p.name.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const isSearching = searchQuery.trim().length > 0

  return (
    <main className="page-main">
      <Hero searchQuery={searchQuery} onSearch={setSearchQuery} loc={location} />
      <PromoStrip />

      <div className="content-wrap content-top-gap">
        <CategoryCarousel categories={categories} />

        {isSearching ? (
          <section className="catalog-section">
            <div className="section-header">
              <h2>Resultados para "{searchQuery}"</h2>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {allProducts.length} produto{allProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
            {allProducts.length > 0
              ? <ProductGrid products={allProducts} />
              : (
                <div className="empty-search">
                  <Search size={36} />
                  <p style={{ fontWeight: 700 }}>Nenhum produto encontrado</p>
                  <p style={{ fontSize: 13 }}>Tente outro termo de busca</p>
                </div>
              )
            }
          </section>
        ) : (
          <>
            {/* Destaque: Frete Grátis Banner */}
            <div className="free-delivery-banner">
              <Truck size={16} />
              <span>Frete grátis em pedidos acima de <strong>R$ {SHOP.FREE_DELIVERY_THRESHOLD},00</strong></span>
            </div>

            {HOME_SECTIONS.map((slug) => {
              const cat = categories.find(c => c.slug === slug)
              if (!cat) return null
              const products = getProductsByCategory(slug).slice(0, 8)
              if (products.length === 0) return null
              return (
                <section key={slug} className="catalog-section">
                  <SectionHeader
                    title={cat.name}
                    slug={slug}
                    accent={cat.color}
                    icon={getCategoryIcon(slug)}
                  />
                  <ProductCarousel products={products} slug={slug} />
                </section>
              )
            })}

            {/* Footer legal */}
            <footer className="site-footer">
              <div className="footer-legal">
                <span><AlertTriangle size={12} /> VENDA PROIBIDA PARA MENORES DE 18 ANOS</span>
                <span><Car size={12} /> SE BEBER, NÃO DIRIJA</span>
              </div>
              <p>© 2026 {SITE_CONFIG.appName} · Delivery de Bebidas e Conveniência</p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
