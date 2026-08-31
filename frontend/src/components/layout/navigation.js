import {
  Apple,
  Beef,
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  Coins,
  Dumbbell,
  Gauge,
  Home,
  ListChecks,
  Moon,
  Scale,
  Sunrise,
  Trophy,
  UtensilsCrossed
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'My Diet', href: '/my-diet', icon: UtensilsCrossed },
  { label: 'Diet Library', href: '/diet', icon: Apple },
  { label: 'Protein', href: '/protein', icon: Beef },
  { label: 'Workout', href: '/workout', icon: Dumbbell },
  { label: 'Daily Routine', href: '/routine', icon: Sunrise },
  { label: 'Daily Checklist', href: '/checklist', icon: ListChecks },
  { label: 'Challenges', href: '/challenges', icon: Trophy },
  { label: '100 Days Challenge', href: '/100-days', icon: CalendarRange },
  { label: 'Weight', href: '/weight', icon: Scale },
  { label: 'Progress', href: '/progress', icon: ChartNoAxesCombined },
  { label: 'History', href: '/history', icon: CalendarDays },
  { label: 'Night Summary', href: '/night-summary', icon: Moon },
  { label: 'Coins', href: '/coins', icon: Coins }
]

export const dashboardIcon = Gauge
