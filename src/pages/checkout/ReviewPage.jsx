import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { OrderSummary } from '../../components/checkout/OrderSummary'
import { DeliveryInfoCard } from '../../components/checkout/DeliveryInfoCard'
import { CheckoutNoticeCard } from '../../components/checkout/CheckoutNoticeCard'
import { PrimaryButton } from '../../components/common/PrimaryButton'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../constants/routes'
import {
  useCartItems,
  useCartCount,
  useCheckoutData,
  useCheckoutReadiness,
  useTotals,
} from '../../hooks/useShopSelectors'

export function ReviewPage() {
  const navigate = useNavigate()
  const count    = useCartCount()
  const items    = useCartItems()
  const totals   = useTotals()
  const { customer, address } = useCheckoutData()
  const { canReviewCheckout }  = useCheckoutReadiness()

  if (count === 0) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Revisão do Pedido" total={0} />
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
        <CheckoutHeader title="Revisão do Pedido" total={totals.total} />
        <div className="checkout-content">
          <CheckoutNoticeCard
            title="Dados incompletos"
            message="Preencha seus dados de entrega antes de revisar o pedido."
            actionLabel="Preencher dados"
            onAction={() => navigate(ROUTES.CHECKOUT_IDENTIFICACAO)}
          />
        </div>
      </div>
    )
  }

  const handleConfirm = () => {
    navigate(ROUTES.CHECKOUT_CPF)
  }

  return (
    <div className="checkout-page">
      <CheckoutHeader title="Revisão do Pedido" total={totals.total} />
      <div className="checkout-content">
        <div className="checkout-banner">
          <span><CheckCircle2 size={13} /> QUASE LÁ</span>
          <p>Confira os itens e seus dados antes de confirmar o pedido.</p>
        </div>
        <DeliveryInfoCard
          customer={customer}
          address={address}
          onEdit={() => navigate(ROUTES.CHECKOUT_IDENTIFICACAO)}
        />
        <OrderSummary items={items} totals={totals} />
      </div>
      <div className="checkout-sticky">
        <div className="checkout-sticky__total">
          <small>Total a pagar</small>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
        <div className="checkout-sticky__button">
          <PrimaryButton variant="green" onClick={handleConfirm} style={{ width: '100%' }}>
            Confirmar Pedido →
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
