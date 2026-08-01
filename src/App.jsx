import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Console from './pages/Console'
import Players from './pages/Players'
import Configs from './pages/Configs'
import Addons from './pages/Addons'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Console />} />
        <Route path="/players" element={<Players />} />
        <Route path="/configs" element={<Configs />} />
        <Route path="/addons" element={<Addons />} />
      </Routes>
    </Layout>
  )
}
