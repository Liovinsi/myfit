import {
  Apple,
  Beef,
  CalendarDays,
  ChartNoAxesCombined,
  Coins,
  Dumbbell,
  Gauge,
  Home,
  Scale,
  Trophy
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Diet Food', href: '/diet', icon: Apple },
  { label: 'Protein', href: '/protein', icon: Beef },
  { label: 'Workout', href: '/workout', icon: Dumbbell },
  { label: 'Challenges', href: '/challenges', icon: Trophy },
  { label: 'Weight', href: '/weight', icon: Scale },
  { label: 'Progress', href: '/progress', icon: ChartNoAxesCombined },
  { label: 'History', href: '/history', icon: CalendarDays },
  { label: 'Coins', href: '/coins', icon: Coins }
]

export const dashboardIcon = Gauge
