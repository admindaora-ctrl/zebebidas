import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from './router/AppRouter'
import { SITE_CONFIG } from './config/site'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  useEffect(() => {
    document.title = SITE_CONFIG.pageTitle
  }, [])

  return (
    <ErrorBoundary>
      <RouterProvider router={appRouter} />
    </ErrorBoundary>
  )
}

export default App
