import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { CartDrawer } from '../components/cart/CartDrawer'
import { BottomCartBar } from '../components/cart/BottomCartBar'
import { CartFeedbackToast } from '../components/common/CartFeedbackToast'
import { LocationModal } from '../components/common/LocationModal'
import { AgeGate } from '../components/common/AgeGate'
import { useLocation, useAgeConfirmed } from '../hooks/useShopSelectors'

export function MainLayout() {
  const location = useLocation()
  const ageConfirmed = useAgeConfirmed()

  return (
    <div className="app-shell">
      <Header />
      <Outlet />
      <CartDrawer />
      <BottomCartBar />
      <CartFeedbackToast />
      {/* 1º maioridade, depois localização. Conta só na finalização do pagamento. */}
      {!ageConfirmed && <AgeGate />}
      {ageConfirmed && !location && <LocationModal />}
    </div>
  )
}
