import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SeedInputPage } from './components/SeedInputPage'
import MainApp from './components/MainApp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/regions" element={<MainApp />} />
        <Route path="/seed-input" element={<SeedInputPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
