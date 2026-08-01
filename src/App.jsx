import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Console from './pages/Console'
import Players from './pages/Players'
import Configs from './pages/Configs'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Console />} />
        <Route path="/players" element={<Players />} />
        <Route path="/configs" element={<Configs />} />
      </Routes>
    </Layout>
  )
}
