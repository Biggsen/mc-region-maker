import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainApp from './components/MainApp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/regions" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
