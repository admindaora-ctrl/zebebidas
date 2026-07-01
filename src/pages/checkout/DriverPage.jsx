import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, AlertTriangle, Check, MapPin } from 'lucide-react'
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'
import { CheckoutNoticeCard } from '../../components/checkout/CheckoutNoticeCard'
import { PrimaryButton } from '../../components/common/PrimaryButton'
import { ROUTES } from '../../constants/routes'
import { DEFAULT_LOCATION } from '../../config/locations'
import { DRIVERS_POOL } from '../../config/drivers'
import {
  useCartCount,
  useCheckoutData,
  useCheckoutReadiness,
  useCurrentDriver,
  useLocation,
  useShopActions,
  useTotals,
} from '../../hooks/useShopSelectors'

// Monta o embed do OpenStreetMap (renderiza em iframe sem chave de API)
// centrado nas coordenadas da cidade.
function buildOsmEmbed(lat, lon) {
  const d = 0.03
  const bbox = [
    (lon - d).toFixed(5), (lat - d).toFixed(5),
    (lon + d).toFixed(5), (lat + d).toFixed(5),
  ].join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)}%2C${lon.toFixed(5)}`
}

export function DriverPage() {
  const navigate = useNavigate()
  const count    = useCartCount()
  const totals   = useTotals()
  const { address } = useCheckoutData()
  const { canReviewCheckout } = useCheckoutReadiness()
  const { assignDriver } = useShopActions()
  const location = useLocation() || DEFAULT_LOCATION
  const driver   = useCurrentDriver() || DRIVERS_POOL[0]

  const [mapSrc, setMapSrc] = useState(null)

  // Se o usuário cair direto nesta rota sem ter driver atribuído, atribui agora.
  useEffect(() => {
    assignDriver()
  }, [assignDriver])

  // Geocodifica a cidade escolhida e centraliza o mapa nela (gratuito, sem chave).
  useEffect(() => {
    if (!location.cityName || !location.uf) return
    let active = true
    const controller = new AbortController()
    const q = encodeURIComponent(`${location.cityName}, ${location.uf}, Brasil`)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        if (Array.isArray(data) && data[0]) {
          setMapSrc(buildOsmEmbed(parseFloat(data[0].lat), parseFloat(data[0].lon)))
        } else {
          setMapSrc(null)
        }
      })
      .catch(() => { if (active) setMapSrc(null) })
    return () => { active = false; controller.abort() }
  }, [location.cityName, location.uf])

  if (count === 0) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Endereço" total={0} />
        <div className="checkout-content">
          <CheckoutNoticeCard
            title="Carrinho vazio"
            message="Volte ao início e adicione produtos ao carrinho."
            actionLabel="Ir para início"
            onAction={() => navigate(ROUTES.HOME)}
          />
        </div>
      </div>
    )
  }

  if (!canReviewCheckout) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Endereço" total={totals.total} />
        <div className="checkout-content">
          <CheckoutNoticeCard
            title="Dados incompletos"
            message="Preencha seus dados de entrega antes de continuar."
            actionLabel="Preencher dados"
            onAction={() => navigate(ROUTES.CHECKOUT_IDENTIFICACAO)}
          />
        </div>
      </div>
    )
  }

  const initials = driver.photoInitials || driver.name.split(' ').map(p => p[0]).slice(0, 2).join('')

  return (
    <div className="checkout-page">
      <CheckoutHeader title="Endereço" total={totals.total} />
      <div className="checkout-content">
        <CheckoutStepper currentStep={2} />

        <section className="driver-card">
          <h2 className="driver-title">Entregador disponível!</h2>
          <p className="driver-sub">
            Nosso parceiro está aguardando a confirmação do pagamento.
          </p>

          <div className="driver-map">
            {mapSrc ? (
              <iframe
                title="Mapa da sua região"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="driver-map-fallback">
                <MapPin size={26} />
                <span>{location.cityName}{location.uf ? `/${location.uf}` : ''}</span>
              </div>
            )}
          </div>
          <p className="driver-map-caption">
            Mapa ilustrativo da sua região ({location.cityName}{location.uf ? `/${location.uf}` : ''}).
          </p>

          <div className="driver-avatar-wrap">
            <div
              className="driver-avatar"
              style={{ backgroundColor: driver.photoBg }}
              aria-label={driver.name}
            >
              {initials}
            </div>
            <span className="driver-check"><Check size={14} strokeWidth={3} /></span>
          </div>

          <h3 className="driver-name">{driver.name}</h3>
          <div className="driver-rating">
            <Star size={14} fill="#f7b825" stroke="#f7b825" />
            <strong>{driver.rating}</strong>
          </div>

          <div className="driver-stats">
            <div>
              <small>Distância</small>
              <strong>{location.distanceKm.toString().replace('.', ',')} km</strong>
            </div>
            <div>
              <small>Tempo Estimado</small>
              <strong>~{location.etaMin} min</strong>
            </div>
            <div>
              <small>Veículo</small>
              <strong>{driver.vehicle}</strong>
            </div>
          </div>

          <div className="driver-plate-row">
            <div className="plate-badge">
              <span className="plate-badge__country">BRASIL</span>
              <span className="plate-badge__code">{driver.plate}</span>
            </div>
            <div className="driver-verified">
              <ShieldCheck size={14} />
              <div>
                <strong>Distribuidor Verificado</strong>
                <small>CNPJ {driver.cnpj}</small>
              </div>
            </div>
          </div>

          <div className="driver-address">
            <strong>Entregar em:</strong>
            <p>
              {address.street}, {address.number} - {address.district}, {location.cityName}{location.uf ? `/${location.uf}` : ''}
            </p>
          </div>

          <div className="driver-warning">
            <AlertTriangle size={16} />
            <span>
              Fique tranquilo: nosso entregador receberá seu endereço completo com o número assim que o pagamento for confirmado.
            </span>
          </div>
        </section>
      </div>

      <div className="checkout-sticky">
        <div className="checkout-sticky__button">
          <PrimaryButton
            variant="gold"
            onClick={() => navigate(ROUTES.CHECKOUT_REVISAO)}
            style={{ width: '100%' }}
          >
            Continuar
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
