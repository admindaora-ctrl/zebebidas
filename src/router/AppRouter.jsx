import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { HomePage } from '../pages/HomePage'
import { CategoryPage } from '../pages/CategoryPage'
import { IdentificationPage } from '../pages/checkout/IdentificationPage'
import { DriverPage } from '../pages/checkout/DriverPage'
import { ReviewPage } from '../pages/checkout/ReviewPage'
import { PaymentPage } from '../pages/checkout/PaymentPage'
import { CpfPage } from '../pages/checkout/CpfPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ROUTES } from '../constants/routes'

export const appRouter = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.CATEGORY, element: <CategoryPage /> },
      { path: ROUTES.CHECKOUT_IDENTIFICACAO, element: <IdentificationPage /> },
      { path: ROUTES.CHECKOUT_ENTREGADOR, element: <DriverPage /> },
      { path: ROUTES.CHECKOUT_REVISAO, element: <ReviewPage /> },
      { path: ROUTES.CHECKOUT_CPF, element: <CpfPage /> },
      { path: ROUTES.CHECKOUT_PAGAMENTO, element: <PaymentPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
