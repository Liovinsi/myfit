import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Challenges from './pages/Challenges.jsx'
import Coins from './pages/Coins.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DietFood from './pages/DietFood.jsx'
import ProteinFood from './pages/ProteinFood.jsx'
import History from './pages/History.jsx'
import Progress from './pages/Progress.jsx'
import Weight from './pages/Weight.jsx'
import Workout from './pages/Workout.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diet" element={<DietFood />} />
        <Route path="/protein" element={<ProteinFood />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/history" element={<History />} />
        <Route path="/coins" element={<Coins />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
