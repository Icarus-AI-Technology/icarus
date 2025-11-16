import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { IcarusLayout } from '@/components/layout/IcarusLayout'
import { Dashboard } from '@/components/modules/Dashboard'
import { ModulePlaceholder } from '@/components/modules/ModulePlaceholder'
import { SupabaseConnectionTest } from '@/components/dev-tools/SupabaseConnectionTest'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { getAllRoutes } from '@/lib/data/navigation'
import { queryClient } from '@/lib/query/queryClient'

function App() {
  const allRoutes = getAllRoutes()

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <IcarusLayout>
            <Routes>
              {/* Dashboard - Implemented */}
              <Route path="/" element={<Dashboard />} />

              {/* Generate routes for all modules */}
              {allRoutes.map((route) => {
                // Skip dashboard (already handled)
                if (route.path === '/') return null

                // Use placeholder for all modules
                const element = (
                  <ModulePlaceholder
                    title={route.name}
                    description={route.description || `Módulo ${route.name}`}
                    icon={route.icon}
                    category={route.category}
                  />
                )

                return <Route key={route.id} path={route.path} element={element} />
              })}

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-muted-foreground">Página não encontrada</p>
                  </div>
                }
              />
            </Routes>

            {/* Dev Tools */}
            <SupabaseConnectionTest />
          </IcarusLayout>
        </BrowserRouter>

        {/* React Query DevTools (only in development) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
