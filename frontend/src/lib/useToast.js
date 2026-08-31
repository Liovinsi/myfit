import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const timeoutRef = useRef(null)

  const showToast = useCallback((text) => {
    setMessage(text)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setMessage(''), 3000)
  }, [])

  return { toastMessage: message, showToast }
}
