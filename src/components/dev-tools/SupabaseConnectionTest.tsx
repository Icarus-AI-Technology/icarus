import { useState } from 'react'
import { Database, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase, supabaseConfig } from '@/lib/config/supabase-client'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'running'
  message: string
  details?: string
}

export function SupabaseConnectionTest() {
  const [isOpen, setIsOpen] = useState(false)
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'Config Validation',
      status: 'pending',
      message: 'Checking environment variables...'
    },
    {
      name: 'Connectivity',
      status: 'pending',
      message: 'Testing connection to Supabase...'
    },
    {
      name: 'Auth System',
      status: 'pending',
      message: 'Verifying authentication system...'
    },
    {
      name: 'Database Access',
      status: 'pending',
      message: 'Testing database queries...'
    }
  ])

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test))
  }

  const runTests = async () => {
    // Reset tests
    setTests(tests.map(t => ({ ...t, status: 'pending' as const })))

    // Test 1: Config Validation
    updateTest(0, { status: 'running' })
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!supabaseConfig.hasCredentials) {
      updateTest(0, {
        status: 'error',
        message: 'Missing credentials',
        details: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not found in .env'
      })
      return
    }

    if (!supabaseConfig.isConfigured) {
      updateTest(0, {
        status: 'error',
        message: 'Using placeholder values',
        details: 'Please configure your Supabase credentials in .env file'
      })
      return
    }

    updateTest(0, {
      status: 'success',
      message: 'Credentials found',
      details: `URL: ${supabaseConfig.url}`
    })

    // Test 2: Connectivity
    updateTest(1, { status: 'running' })
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      const { error } = await supabase.from('companies').select('count').limit(1)

      if (error) {
        updateTest(1, {
          status: 'error',
          message: 'Connection failed',
          details: error.message
        })
        return
      }

      updateTest(1, {
        status: 'success',
        message: 'Connected successfully',
        details: 'Supabase server is reachable'
      })
    } catch (error) {
      updateTest(1, {
        status: 'error',
        message: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return
    }

    // Test 3: Auth System
    updateTest(2, { status: 'running' })
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      const { data: session } = await supabase.auth.getSession()

      updateTest(2, {
        status: 'success',
        message: session.session ? 'User authenticated' : 'Auth system working',
        details: session.session ? `User: ${session.session.user.email}` : 'No active session'
      })
    } catch (error) {
      updateTest(2, {
        status: 'error',
        message: 'Auth system error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Database Access
    updateTest(3, { status: 'running' })
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1)

      if (error) {
        updateTest(3, {
          status: 'error',
          message: 'Query failed',
          details: error.message
        })
        return
      }

      updateTest(3, {
        status: 'success',
        message: 'Database accessible',
        details: data && data.length > 0
          ? `Found company: ${data[0].name}`
          : 'No data found (run migrations first)'
      })
    } catch (error) {
      updateTest(3, {
        status: 'error',
        message: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const allSuccess = tests.every(t => t.status === 'success')
  const hasErrors = tests.some(t => t.status === 'error')

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        size="lg"
        variant={allSuccess ? 'default' : hasErrors ? 'destructive' : 'secondary'}
      >
        <Database className="mr-2 h-5 w-5" />
        Database
      </Button>

      {/* Test Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-96 z-50 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Supabase Connection</span>
              <Button onClick={runTests} size="sm" variant="outline">
                Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{test.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {test.message}
                    </div>
                    {test.details && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {test.details}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t text-xs text-muted-foreground">
              <strong>Quick Start:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Configure .env with your Supabase credentials</li>
                <li>Run migrations: <code className="text-xs">npm run db:migrate</code></li>
                <li>Click "Test" button above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
