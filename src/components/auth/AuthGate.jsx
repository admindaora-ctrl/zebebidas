import { useState } from 'react'
import { Beer, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { SITE_CONFIG } from '../../config/site'
import { useShopActions } from '../../hooks/useShopSelectors'
import { PrimaryButton } from '../common/PrimaryButton'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthGate({
  title = 'Crie sua conta para finalizar',
  subtitle = 'Use seu e-mail para concluir o pedido e acompanhar a entrega. Leva menos de 30 segundos.',
  embedded = false,
}) {
  const { register } = useShopActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const mail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(mail)) {
      setError('Informe um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setError('')
    register({ email: mail })
  }

  const formContent = (
    <>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-sub">{subtitle}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-field">
          <span><Mail size={14} /> E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="voce@email.com"
            autoFocus
          />
        </label>

        <label className="auth-field">
          <span><Lock size={14} /> Senha</span>
          <div className="auth-pass">
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && <div className="auth-error">{error}</div>}

        <PrimaryButton type="submit" variant="green" style={{ width: '100%', marginTop: 4 }}>
          Criar conta e continuar
        </PrimaryButton>
      </form>

      <small className="auth-foot">
        Seus dados ficam apenas neste navegador. Não compartilhamos com terceiros.
      </small>
    </>
  )

  // Modo embutido: vira mais um card dentro do funil de checkout.
  if (embedded) {
    return <section className="checkout-card auth-embedded">{formContent}</section>
  }

  return (
    <div className="auth-gate">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__logo"><Beer size={26} /></span>
          <strong>{SITE_CONFIG.appName}</strong>
        </div>
        {formContent}
      </div>
    </div>
  )
}
