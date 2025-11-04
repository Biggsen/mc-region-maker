import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import MainApp from './components/MainApp'
import ErrorBoundary from './components/ErrorBoundary'
import { StyleGuide } from './components/StyleGuide'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/regions" element={<MainApp />} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
    </ErrorBoundary>
  )
}

export default App
