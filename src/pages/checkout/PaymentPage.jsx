import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Smartphone, Copy, Clock3, Lock, AlertTriangle } from 'lucide-react'
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { CheckoutNoticeCard } from '../../components/checkout/CheckoutNoticeCard'
import { PrimaryButton } from '../../components/common/PrimaryButton'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../constants/routes'
import {
  useAccount,
  useCartCount,
  useCartItems,
  useCheckoutData,
  useLocation,
  useShopActions,
  useTotals,
} from '../../hooks/useShopSelectors'
import { AuthGate } from '../../components/auth/AuthGate'
import { DEFAULT_LOCATION } from '../../config/locations'
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper'
import { createPixCharge, checkPixStatus } from '../../config/api'
import { QRCodeSVG } from 'qrcode.react'

const PIX_TIMEOUT_SECONDS = 1800 // 30 minutos (mesmo prazo de expiração do QR na WinnerPay)

// Status que indicam pagamento concluído (ver doc WinnerPay).
const PAID_STATUSES = ['paid', 'completed']

function PixScreen({ pixData, secondsLeft, onCopy, copied, onCancel }) {
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="pix-screen">
      <div className="pix-header">
        <Smartphone size={28} color="var(--green)" />
        <h2>Pagamento via PIX</h2>
        <p>Copie o código abaixo e pague no app do seu banco.</p>
      </div>

      <div className="pix-timer">
        <Clock3 size={16} />
        <span>
          Expira em <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
        </span>
      </div>

      {pixData.pix_copia_e_cola && (
        <div className="pix-qr">
          <QRCodeSVG
            value={pixData.pix_copia_e_cola}
            size={176}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
      )}

      <div className="pix-code-box">
        <label>PIX Copia e Cola</label>
        <div className="pix-code-row">
          <input
            type="text"
            value={pixData.pix_copia_e_cola}
            readOnly
            onClick={onCopy}
          />
          <button type="button" className="pix-copy-btn" onClick={onCopy}>
            <Copy size={16} />
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="pix-waiting">
        <div className="pix-waiting-spinner" />
        <span>Aguardando pagamento...</span>
      </div>

      <button type="button" className="pix-cancel" onClick={onCancel}>
        Cancelar e voltar
      </button>
    </div>
  )
}

function SuccessScreen({ totals, customer, etaMin, onNewOrder }) {
  return (
    <div className="checkout-page">
      <div className="checkout-content" style={{ paddingTop: 60, textAlign: 'center' }}>
        <CheckCircle2 size={72} color="#00a85a" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Pedido confirmado!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 4 }}>
          Olá, <strong>{customer.name?.split(' ')[0]}</strong>! Seu pedido foi recebido.
        </p>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 13 }}>
          Entrega em até {etaMin} minutos no seu endereço.
        </p>
        <div className="checkout-card" style={{ maxWidth: 'min(340px, 100%)', margin: '0 auto 24px', textAlign: 'left' }}>
          <div className="totals-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div className="totals-row">
            <span>Entrega</span>
            <strong className={totals.deliveryFee === 0 ? 'success' : ''}>
              {totals.deliveryFee === 0 ? 'Grátis' : formatCurrency(totals.deliveryFee)}
            </strong>
          </div>
          <div className="totals-row total" style={{ marginTop: 8 }}>
            <span>Total pago</span>
            <strong>{formatCurrency(totals.total)}</strong>
          </div>
        </div>
        <PrimaryButton variant="green" onClick={onNewOrder} style={{ width: '100%', maxWidth: 280 }}>
          Fazer novo pedido
        </PrimaryButton>
      </div>
    </div>
  )
}

export function PaymentPage() {
  const navigate    = useNavigate()
  const count       = useCartCount()
  const items       = useCartItems()
  const totals      = useTotals()
  const { customer } = useCheckoutData()
  const location = useLocation() || DEFAULT_LOCATION
  const account = useAccount()
  const { clearCart, resetCheckout } = useShopActions()

  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [savedTotals, setSavedTotals] = useState(null)

  // PIX-specific state
  const [pixData, setPixData]       = useState(null)
  const [pixError, setPixError]     = useState(null)
  const [copied, setCopied]         = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(PIX_TIMEOUT_SECONDS)

  const pollingRef  = useRef(null)
  const timerRef    = useRef(null)
  const clearCartRef = useRef(clearCart)
  const totalsRef    = useRef(totals)

  useEffect(() => {
    clearCartRef.current = clearCart
  }, [clearCart])

  useEffect(() => {
    totalsRef.current = totals
  }, [totals])

  // Cleanup polling & timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current)   clearInterval(timerRef.current)
    }
  }, [])

  // Start polling when pixData is set
  const startPolling = useCallback((txId) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkPixStatus(txId)
        if (res.success && PAID_STATUSES.includes(res.status)) {
          clearInterval(pollingRef.current)
          clearInterval(timerRef.current)
          pollingRef.current = null
          timerRef.current = null

          const conversionValue = Number(res.amount) > 0
            ? Number(res.amount)
            : (totalsRef.current?.total ?? 0)

          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'conversion', {
              send_to: 'AW-18096929893/epPKCN7txp0cEOX4pLVD',
              value: conversionValue,
              currency: 'BRL',
              transaction_id: txId,
            })
          }

          clearCartRef.current()
          setPixData(null)
          setDone(true)
        }
      } catch {
        // Silently retry on network errors
      }
    }, 4000)

    setSecondsLeft(PIX_TIMEOUT_SECONDS)
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(pollingRef.current)
          clearInterval(timerRef.current)
          pollingRef.current = null
          timerRef.current = null
          setPixData(null)
          setPixError('O tempo para pagamento expirou. Tente novamente.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleCopyPix = useCallback(() => {
    if (!pixData?.pix_copia_e_cola) return
    navigator.clipboard.writeText(pixData.pix_copia_e_cola).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }, [pixData])

  const handleCancelPix = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (timerRef.current)   clearInterval(timerRef.current)
    pollingRef.current = null
    timerRef.current = null
    setPixData(null)
    setPixError(null)
    setLoading(false)
  }, [])

  if (count === 0 && !done && !pixData) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Pagamento" total={0} />
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

  if (done) {
    return (
      <SuccessScreen
        totals={savedTotals}
        customer={customer}
        etaMin={location.etaMin}
        onNewOrder={() => { resetCheckout(); navigate(ROUTES.HOME) }}
      />
    )
  }

  // Conta é exigida apenas aqui, para finalizar o pagamento — como mais uma
  // etapa do funil (header + stepper), e não um overlay solto.
  if (!account) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Pagamento" total={totals.total} />
        <div className="checkout-content">
          <CheckoutStepper currentStep={3} />
          <div className="checkout-banner">
            <span><Lock size={13} /> QUASE LÁ</span>
            <p>Crie sua conta para concluir o pagamento.</p>
          </div>
          <AuthGate embedded />
        </div>
      </div>
    )
  }

  const handleGeneratePix = async () => {
    setLoading(true)
    setPixError(null)

    try {
      const orderRef = `GELADA_${Date.now()}`
      const result = await createPixCharge({
        amount: totals.total,
        customer: {
          name: customer.name,
          phone: customer.phone,
          cpf: customer.cpf || '',
        },
        items: items.map(i => ({
          name: i.name,
          qty: i.qty,
          price: i.salePrice,
        })),
        orderRef,
      })

      setPixData({
        pix_copia_e_cola: result.pix_copia_e_cola,
        qr_code_data: result.qr_code_data,
        transaction_id: result.transaction_id,
      })
      setSavedTotals({ ...totals })
      setLoading(false)
      startPolling(result.transaction_id)
    } catch (err) {
      setPixError(err.message || 'Erro ao gerar PIX. Tente novamente.')
      setLoading(false)
    }
  }

  // Show PIX waiting screen
  if (pixData) {
    return (
      <div className="checkout-page">
        <CheckoutHeader title="Pagamento PIX" total={savedTotals?.total || totals.total} />
        <div className="checkout-content">
          <PixScreen
            pixData={pixData}
            secondsLeft={secondsLeft}
            onCopy={handleCopyPix}
            copied={copied}
            onCancel={handleCancelPix}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <CheckoutHeader title="Pagamento" total={totals.total} />
      <div className="checkout-content">
        <CheckoutStepper currentStep={3} />
        <div className="checkout-banner">
          <span><Lock size={13} /> PAGAMENTO SEGURO</span>
          <p>Confirme seu pedido e pague via PIX.</p>
        </div>

        {pixError && (
          <div className="pix-error-banner">
            <span><AlertTriangle size={14} /> {pixError}</span>
          </div>
        )}

        <section className="checkout-card">
          <div className="pix-method-selected">
            <Smartphone size={20} color="var(--green)" />
            <div>
              <strong>PIX</strong>
              <small>Aprovação instantânea</small>
            </div>
          </div>
        </section>

        <section className="checkout-card">
          <h3>Resumo</h3>
          <div className="totals-box">
            <div>
              <span>Subtotal ({items.reduce((n,i)=>n+i.qty,0)} itens)</span>
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
          {totals.savings > 0 && (
            <div className="save-box" style={{ marginTop: 10 }}>
              <span>Você economizou</span>
              <strong>{formatCurrency(totals.savings)}</strong>
            </div>
          )}
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
            onClick={handleGeneratePix}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Gerando PIX...' : 'Gerar PIX e Pagar'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
