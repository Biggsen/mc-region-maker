import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
    </ErrorBoundary>
  )
}

export default App
