import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../components/common/PrimaryButton'
import { ROUTES } from '../constants/routes'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="page-center">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ fontSize: 48, marginBottom: 8 }}>404</p>
        <h2 style={{ marginBottom: 4 }}>Página não encontrada</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>
          A página que você procura não existe ou foi removida.
        </p>
        <PrimaryButton variant="green" onClick={() => navigate(ROUTES.HOME)}>
          Voltar ao início
        </PrimaryButton>
      </div>
    </div>
  )
}
