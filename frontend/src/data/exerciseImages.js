function svgThumb(label, bg, fg, path) {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="${bg}"/>
      <path d="${path}" fill="none" stroke="${fg}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="32" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="${fg}">${label}</text>
    </svg>
  `)}`
}

const leg = svgThumb('LEGS', '#ecfeff', '#0e7490', 'M20 18h24M24 18l7 14-8 15M40 18l-5 17 9 12M18 47h12M38 47h10')
const back = svgThumb('BACK', '#eef2ff', '#3730a3', 'M20 20c5-7 19-7 24 0M22 24l5 20M42 24l-5 20M27 35h10M20 44h24')
const chest = svgThumb('PUSH', '#fff1f2', '#be123c', 'M18 30h28M46 24v12M54 24v12M24 22l8 8-8 8M14 24v12')
const arms = svgThumb('ARMS', '#f0fdf4', '#15803d', 'M19 39c8 0 9-16 17-16M36 23c8 0 7 16 12 16M18 40h12M41 40h8M27 30h10')
const shoulders = svgThumb('DELTS', '#fffbeb', '#b45309', 'M20 32l12-14 12 14M24 36h16M18 44h28M32 18v26')
const cardio = svgThumb('30 MIN', '#fdf2f8', '#be185d', 'M18 35c6-15 13 4 14 4s8-19 14-4M20 44h24M22 24h20')

export const exerciseImages = {
  'Leg Press': leg,
  Lunges: leg,
  'Goblet Squat': leg,
  'Leg Extension': leg,
  'Standing Calf Raise': leg,
  'Lat Pulldown': back,
  'Seated Machine Row': back,
  'Straight Arm Pulldown': back,
  'Rope Hammer Curl': arms,
  'DB Curl': arms,
  'Incline Dumbbell Press': chest,
  'Flat DB Press': chest,
  'Pec Deck': chest,
  'Rope Pushdown': arms,
  'Overhead Rope Extension': arms,
  'Romanian Deadlift': leg,
  'Glute Bridge': leg,
  'Seated Leg Curl': leg,
  'Step-ups': leg,
  'Calf Raise': leg,
  'Dumbbell Shoulder Press': shoulders,
  'Lateral Raise': shoulders,
  'Front Raise': shoulders,
  'Rear Delt Fly': shoulders,
  'Incline Curl': arms,
  'Preacher Curl': arms,
  'Cable Curl': arms,
  'Close Grip Bench Press': chest,
  'Cable Pushdown': arms,
  'One Arm Extension': arms
}

export const cardioImage = cardio
export const fallbackExerciseImage = svgThumb('MOVE', '#f8fafc', '#334155', 'M20 44l12-24 12 24M26 35h12')
