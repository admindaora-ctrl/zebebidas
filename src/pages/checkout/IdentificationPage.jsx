import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { CustomerForm } from '../../components/checkout/CustomerForm'
import { AddressForm } from '../../components/checkout/AddressForm'
import { CheckoutNoticeCard } from '../../components/checkout/CheckoutNoticeCard'
import { PrimaryButton } from '../../components/common/PrimaryButton'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../constants/routes'
import {
  useCartCount,
  useCheckoutData,
  useLocation,
  useShopActions,
  useTotals,
} from '../../hooks/useShopSelectors'
import { DEFAULT_LOCATION } from '../../config/locations'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'

function validate(customer, address) {
  const ce = {}
  const ae = {}
  if (!customer.name?.trim())    ce.name    = 'Nome obrigatório'
  if (!customer.phone?.trim())   ce.phone   = 'Telefone obrigatório'
  if (!address.street?.trim())   ae.street  = 'Rua obrigatória'
  if (!address.district?.trim()) ae.district = 'Bairro obrigatório'
  if (!address.cityUf?.trim())   ae.cityUf  = 'Cidade/UF obrigatória'
  return { customer: ce, address: ae }
}

function hasErrors(e) {
  return Object.keys(e.customer).length > 0 || Object.keys(e.address).length > 0
}

export function IdentificationPage() {
  const navigate = useNavigate()
  const count    = useCartCount()
  const totals   = useTotals()
  const { customer, address } = useCheckoutData()
  const { setCustomer, setAddress, assignDriver } = useShopActions()
  const location = useLocation() || DEFAULT_LOCATION
  const [errors, setErrors]   = useState({ customer: {}, address: {} })
  const [touched, setTouched] = useState(false)

  if (count === 0) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Identificação" total={0} />
        <div className="checkout-content">
          <CheckoutNoticeCard
            title="Carrinho vazio"
            message="Adicione produtos ao carrinho antes de prosseguir com o pedido."
            actionLabel="Ver produtos"
            onAction={() => navigate(ROUTES.HOME)}
          />
        </div>
      </div>
    )
  }

  if (!totals.minOrderMet) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Identificação" total={totals.total} />
        <div className="checkout-content">
          <CheckoutNoticeCard
            title="Pedido mínimo não atingido"
            message={`O valor mínimo do pedido é ${formatCurrency(totals.minOrder)}. Adicione mais itens para continuar.`}
            actionLabel="Adicionar mais itens"
            onAction={() => navigate(ROUTES.HOME)}
          />
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    setTouched(true)
    const errs = validate(customer, address)
    setErrors(errs)
    if (hasErrors(errs)) return
    assignDriver()
    navigate(ROUTES.CHECKOUT_ENTREGADOR)
  }

  const handleCustomer = (data) => {
    setCustomer(data)
    if (touched) {
      const errs = validate({ ...customer, ...data }, address)
      setErrors(p => ({ ...p, customer: errs.customer }))
    }
  }

  const handleAddress = (data) => {
    setAddress(data)
    if (touched) {
      const errs = validate(customer, { ...address, ...data })
      setErrors(p => ({ ...p, address: errs.address }))
    }
  }

  return (
    <div className="checkout-page">
      <CheckoutHeader title="Identificação" total={totals.total} />
      <div className="checkout-content">
        <CheckoutStepper currentStep={1} />
        <div className="checkout-banner">
          <span><Zap size={13} /> ENTREGA RÁPIDA</span>
          <p>Preencha seus dados para confirmar o pedido. Entrega em até {location.etaMin} minutos.</p>
        </div>
        <CustomerForm form={customer} onChange={handleCustomer} errors={errors.customer} />
        <AddressForm  form={address}  onChange={handleAddress}  errors={errors.address} />
      </div>
      <div className="checkout-sticky">
        <div className="checkout-sticky__total">
          <small>Total do pedido</small>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
        <div className="checkout-sticky__button">
          <PrimaryButton variant="green" onClick={handleSubmit} style={{ width: '100%' }}>
            Continuar →
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
