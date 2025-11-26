import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry/config'
import { initWebVitals } from './lib/performance/web-vitals'

// Initialize Sentry before rendering the app
initSentry()

// Initialize Web Vitals monitoring for Core Web Vitals (LCP, INP, CLS, FCP, TTFB)
initWebVitals()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
