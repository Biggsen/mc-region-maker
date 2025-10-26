import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainApp from './components/MainApp'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/regions" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
