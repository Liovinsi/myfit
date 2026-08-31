import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Challenges from './pages/Challenges.jsx'
import Coins from './pages/Coins.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DailyChecklist from './pages/DailyChecklist.jsx'
import DailyRoutine from './pages/DailyRoutine.jsx'
import DietFood from './pages/DietFood.jsx'
import HundredDaysChallenge from './pages/HundredDaysChallenge.jsx'
import MyDiet from './pages/MyDiet.jsx'
import NightSummary from './pages/NightSummary.jsx'
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
        <Route path="/my-diet" element={<MyDiet />} />
        <Route path="/diet" element={<DietFood />} />
        <Route path="/protein" element={<ProteinFood />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/routine" element={<DailyRoutine />} />
        <Route path="/checklist" element={<DailyChecklist />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/100-days" element={<HundredDaysChallenge />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/history" element={<History />} />
        <Route path="/night-summary" element={<NightSummary />} />
        <Route path="/coins" element={<Coins />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
