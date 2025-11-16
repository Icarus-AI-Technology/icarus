import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { IcarusLayout } from '@/components/layout/IcarusLayout'
import { Dashboard } from '@/components/modules/Dashboard'
import { ModulePlaceholder } from '@/components/modules/ModulePlaceholder'
import { SupabaseConnectionTest } from '@/components/dev-tools/SupabaseConnectionTest'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { getAllRoutes } from '@/lib/data/navigation'

function App() {
  const allRoutes = getAllRoutes()

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
