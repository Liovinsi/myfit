export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/myfit.png"
        alt="MyFit logo"
        className={compact ? 'h-11 w-11 rounded-xl object-contain' : 'h-14 w-14 rounded-2xl object-contain'}
      />
      <div className={compact ? 'min-w-0' : ''}>
        <p className="text-lg font-extrabold tracking-normal text-navy">MyFit</p>
        {!compact && (
          <p className="text-sm font-medium leading-snug text-slate-500">
            Your Daily Fitness Journey
          </p>
        )}
      </div>
    </div>
  )
}
