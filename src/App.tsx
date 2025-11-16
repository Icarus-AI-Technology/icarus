import './App.css'
import { Dashboard } from '@/components/modules/Dashboard'
import { SupabaseConnectionTest } from '@/components/dev-tools/SupabaseConnectionTest'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard />
      <SupabaseConnectionTest />
    </div>
  )
}

export default App
