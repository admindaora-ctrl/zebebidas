import { Clock3, MapPin, Phone, User } from 'lucide-react'
import { useLocation } from '../../hooks/useShopSelectors'
import { DEFAULT_LOCATION } from '../../config/locations'

export function DeliveryInfoCard({ customer, address, onEdit }) {
  const location = useLocation() || DEFAULT_LOCATION
  return (
    <section className="checkout-card delivery-card">
      <div className="delivery-head">
        <h3>Dados da Entrega</h3>
        <button onClick={onEdit}>Editar</button>
      </div>
      <p><User size={14} /> {customer.name}</p>
      <p><Phone size={14} /> {customer.phone}</p>
      <p>
        <MapPin size={14} /> {address.street}, {address.number} - {address.district}, {address.cityUf}
      </p>
      <p className="delivery-time"><Clock3 size={14} /> Entrega em até {location.etaMin} minutos</p>
    </section>
  )
}
