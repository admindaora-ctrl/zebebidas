import { useState } from 'react'
import { ShieldAlert, Beer } from 'lucide-react'
import { SITE_CONFIG } from '../../config/site'
import { useShopActions } from '../../hooks/useShopSelectors'
import { PrimaryButton } from './PrimaryButton'

export function AgeGate() {
  const { confirmAge } = useShopActions()
  const [denied, setDenied] = useState(false)

  return (
    <div className="age-gate-overlay" role="dialog" aria-modal="true">
      <div className="age-gate-card">
        <div className="age-gate-brand">
          <span className="age-gate-brand__logo"><Beer size={22} /></span>
          <strong>{SITE_CONFIG.appName}</strong>
        </div>

        {denied ? (
          <>
            <div className="age-gate-icon age-gate-icon--block"><ShieldAlert size={30} /></div>
            <h2>Acesso não permitido</h2>
            <p>
              A venda de bebidas alcoólicas é proibida para menores de 18 anos.
              Volte quando completar a maioridade.
            </p>
          </>
        ) : (
          <>
            <div className="age-gate-icon"><ShieldAlert size={30} /></div>
            <h2>Você é maior de 18 anos?</h2>
            <p>
              Este site vende bebidas alcoólicas. Para continuar, confirme que você
              tem 18 anos ou mais.
            </p>

            <div className="age-gate-actions">
              <PrimaryButton variant="green" onClick={confirmAge} style={{ width: '100%' }}>
                Sim, sou maior de 18
              </PrimaryButton>
              <button type="button" className="age-gate-deny" onClick={() => setDenied(true)}>
                Não
              </button>
            </div>

            <small className="age-gate-foot">
              Beba com moderação. Se beber, não dirija.
            </small>
          </>
        )}
      </div>
    </div>
  )
}
