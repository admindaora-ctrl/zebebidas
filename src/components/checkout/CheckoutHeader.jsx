import { ChevronDown, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'

export function CheckoutHeader({ title, total }) {
  const navigate = useNavigate()

  return (
    <header className="checkout-header">
      <button className="checkout-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
        <ChevronLeft size={18} />
      </button>
      <strong className="checkout-title">{title}</strong>
      <span className="checkout-total-top">
        {formatCurrency(total)} <ChevronDown size={14} />
      </span>
    </header>
  )
}
