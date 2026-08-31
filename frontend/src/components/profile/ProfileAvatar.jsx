import { Camera, User } from 'lucide-react'
import { useRef, useState } from 'react'
import { resolveAssetUrl } from '../../lib/api.js'
import { useProfile } from '../../lib/useProfile.js'

export default function ProfileAvatar({ compact = false }) {
  const { profile, uploadImage } = useProfile()
  const fileInputRef = useRef(null)
  const [isUploading, setUploading] = useState(false)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setUploading(true)
    await uploadImage(file)
    setUploading(false)
  }

  const imageUrl = profile?.imageUrl ? resolveAssetUrl(profile.imageUrl) : ''
  const name = profile?.name || 'Vidya'
  const sizeClasses = compact ? 'h-10 w-10' : 'h-14 w-14'

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'rounded-2xl bg-slate-50 p-3'}`}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`group relative shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm ring-2 ring-slate-200 ${sizeClasses}`}
        aria-label="Update profile photo"
        title="Update profile photo"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-navy text-white">
            <User className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/50 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
      </button>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-navy">{name}</p>
          <p className="text-xs font-semibold text-slate-500">{isUploading ? 'Uploading...' : 'Tap photo to change'}</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
