import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await api.getProfile()
      setProfile(data)
      setError('')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function uploadImage(file) {
    setError('')

    try {
      const updated = await api.uploadProfileImage(file)
      setProfile(updated)
      return true
    } catch (uploadError) {
      setError(uploadError.message)
      return false
    }
  }

  async function updateName(name) {
    setError('')

    try {
      const updated = await api.updateProfile(name)
      setProfile(updated)
      return true
    } catch (updateError) {
      setError(updateError.message)
      return false
    }
  }

  return { profile, isLoading, error, refresh, uploadImage, updateName }
}
