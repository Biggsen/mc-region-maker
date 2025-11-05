import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import MainApp from './components/MainApp'
import ErrorBoundary from './components/ErrorBoundary'
import { StyleGuide } from './components/StyleGuide'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  )
}

export default App
