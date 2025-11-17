import './App.css'
import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { IcarusLayout } from '@/components/layout/IcarusLayout'
import { ModulePlaceholder } from '@/components/modules/ModulePlaceholder'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { SupabaseConnectionTest } from '@/components/dev-tools/SupabaseConnectionTest'
import { HardGateBanner } from '@/components/dev-tools/HardGateBanner'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { getAllRoutes } from '@/lib/data/navigation'
import { queryClient } from '@/lib/query/queryClient'
import { getModuleComponent } from '@/lib/routes/moduleRoutes'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'

function App() {
  const allRoutes = getAllRoutes()

  return (
    <ErrorBoundary>
      {/* Hard Gate Validator - OraclusX DS */}
      <HardGateBanner />
      
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Landing & Login */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - Module Routes */}
            <Route
              path="/*"
              element={
                <IcarusLayout>
                  <Suspense fallback={<ModuleLoadingSkeleton />}>
                    <Routes>
                      {/* Generate routes for all modules */}
                      {allRoutes.map((route) => {
                        // Get the module component if implemented
                        const ModuleComponent = getModuleComponent(route.id)

                        // Use actual component if implemented, otherwise use placeholder
                        const element = ModuleComponent ? (
                          <ModuleComponent />
                        ) : (
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
                  </Suspense>
                </IcarusLayout>
              }
            />
          </Routes>
        </BrowserRouter>

        {/* React Query DevTools (only in development) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>

      {/* Vercel Speed Insights (only in production) */}
      <SpeedInsights />
    </ErrorBoundary>
  )
}

export default App
