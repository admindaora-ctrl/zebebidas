import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react'
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { CheckoutNoticeCard } from '../../components/checkout/CheckoutNoticeCard'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'
import { PrimaryButton } from '../../components/common/PrimaryButton'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../constants/routes'
import {
  useCartCount,
  useCartItems,
  useCheckoutData,
  useShopActions,
  useTotals,
} from '../../hooks/useShopSelectors'

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function isValidCpf(cpf) {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10) rest = 0
  if (rest !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10) rest = 0
  return rest === parseInt(digits[10])
}

export function CpfPage() {
  const navigate = useNavigate()
  const count = useCartCount()
  const items = useCartItems()
  const totals = useTotals()
  const { customer } = useCheckoutData()
  const { setCustomer } = useShopActions()

  const [cpf, setCpf] = useState(customer.cpf || '')
  const [error, setError] = useState('')

  if (count === 0) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="CPF" total={0} />
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

  const handleSubmit = () => {
    const digits = cpf.replace(/\D/g, '')
    if (!digits) {
      setError('Informe seu CPF para continuar.')
      return
    }
    if (!isValidCpf(digits)) {
      setError('CPF inválido. Verifique e tente novamente.')
      return
    }
    setError('')
    setCustomer({ cpf: digits })
    navigate(ROUTES.CHECKOUT_PAGAMENTO)
  }

  return (
    <div className="checkout-page">
      <CheckoutHeader title="Dados para pagamento" total={totals.total} />
      <div className="checkout-content">
        <CheckoutStepper currentStep={3} />

        <div className="checkout-banner">
          <span><Lock size={13} /> PAGAMENTO SEGURO</span>
          <p>Informe seu CPF para gerar o pagamento via PIX.</p>
        </div>

        <section className="checkout-card">
          <div className="cpf-icon-row">
            <ShieldCheck size={32} color="var(--green)" />
          </div>
          <h3>CPF do pagador</h3>
          <p className="cpf-info">
            Seu CPF é necessário para emitir a cobrança PIX. Ele não será armazenado.
          </p>

          <label className="form-field">
            CPF
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={e => { setCpf(formatCpf(e.target.value)); setError('') }}
              placeholder="000.000.000-00"
              maxLength={14}
              autoFocus
            />
          </label>

          {error && (
            <div className="pix-error-banner" style={{ marginTop: 8 }}>
              <span><AlertTriangle size={14} /> {error}</span>
            </div>
          )}
        </section>

        <section className="checkout-card">
          <h3>Resumo</h3>
          <div className="totals-box">
            <div>
              <span>Subtotal ({items.reduce((n, i) => n + i.qty, 0)} itens)</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>
            {totals.discount > 0 && (
              <div>
                <span>Desconto ({totals.appliedPercent}%)</span>
                <strong className="success">- {formatCurrency(totals.discount)}</strong>
              </div>
            )}
            <div>
              <span>Entrega</span>
              <strong className={totals.deliveryFee === 0 ? 'success' : ''}>
                {totals.deliveryFee === 0 ? 'GRÁTIS' : formatCurrency(totals.deliveryFee)}
              </strong>
            </div>
            <div className="total">
              <span>Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="checkout-sticky">
        <div className="checkout-sticky__total">
          <small>Total</small>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
        <div className="checkout-sticky__button">
          <PrimaryButton
            variant="green"
            onClick={handleSubmit}
            style={{ width: '100%' }}
          >
            Continuar para pagamento
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
