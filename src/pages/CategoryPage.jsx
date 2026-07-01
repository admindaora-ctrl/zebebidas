import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ArrowUpDown, Search, PackageX } from 'lucide-react'
import { categories, getProductsByCategory } from '../mocks/catalog'
import { CategoryGlyph } from '../config/categoryIcons'
import { ProductGrid } from '../components/ProductGrid'
import { SearchBar } from '../components/SearchBar'
import { ROUTES } from '../constants/routes'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Destaques' },
  { value: 'price_asc',  label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'discount',   label: 'Maior desconto' },
]

function sortProducts(products, sort) {
  const arr = [...products]
  switch (sort) {
    case 'price_asc':  return arr.sort((a, b) => a.salePrice - b.salePrice)
    case 'price_desc': return arr.sort((a, b) => b.salePrice - a.salePrice)
    case 'discount':   return arr.sort((a, b) => b.discount - a.discount)
    default:           return arr
  }
}

export function CategoryPage() {
  const { slug } = useParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [showSort, setShowSort] = useState(false)

  const category = categories.find(c => c.slug === slug)
  const raw = getProductsByCategory(slug)

  const products = useMemo(() => {
    let list = raw
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    return sortProducts(list, sort)
  }, [raw, search, sort])

  if (!category && raw.length === 0) {
    return (
      <main className="page-main content-wrap">
        <section className="checkout-card" style={{ marginTop: 24, textAlign: 'center' }}>
          <div className="empty-icon"><PackageX size={40} /></div>
          <h3>Categoria não encontrada</h3>
          <p style={{ color: 'var(--muted)', margin: '8px 0 16px' }}>
            Selecione outra categoria para continuar navegando.
          </p>
          <Link to={ROUTES.HOME} className="back-link">← Ir para início</Link>
        </section>
      </main>
    )
  }

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label

  return (
    <main className="page-main content-wrap">
      <div className="category-head">
        <Link to={ROUTES.HOME} className="back-link">
          <ChevronLeft size={16} /> Início
        </Link>
        <div className="category-head__row">
          <h1>
            <span className="category-head__icon" style={{ color: category?.color }}>
              <CategoryGlyph slug={slug} size={22} strokeWidth={2.2} />
            </span>
            {category?.name || 'Categoria'}
          </h1>
          <span className="category-count">{raw.length} produto{raw.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="category-toolbar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="sort-wrapper">
          <button className="sort-btn" onClick={() => setShowSort(s => !s)}>
            <ArrowUpDown size={15} />
            <span>{currentSortLabel}</span>
          </button>
          {showSort && (
            <div className="sort-dropdown">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`sort-option ${sort === opt.value ? 'active' : ''}`}
                  onClick={() => { setSort(opt.value); setShowSort(false) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <>
          {search.trim() && (
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              {products.length} resultado{products.length !== 1 ? 's' : ''} para &ldquo;{search}&rdquo;
            </p>
          )}
          <ProductGrid products={products} />
        </>
      ) : (
        <div className="empty-search">
          <Search size={36} />
          <p style={{ fontWeight: 700, color: 'var(--text)' }}>Nenhum produto encontrado</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Tente outro termo de busca</p>
          <button
            style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--green)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            onClick={() => setSearch('')}
          >
            Limpar busca
          </button>
        </div>
      )}
    </main>
  )
}
