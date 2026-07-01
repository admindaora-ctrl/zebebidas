import { useEffect, useRef, useState } from 'react'

export function CartFeedbackToast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const onAdded = (event) => {
      setMessage(`"${event.detail.name}" adicionado ao carrinho`)
      setVisible(true)
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => setVisible(false), 1600)
    }

    window.addEventListener('shop:item-added', onAdded)
    return () => {
      window.removeEventListener('shop:item-added', onAdded)
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  return <div className={`cart-toast ${visible ? 'show' : ''}`}>{message}</div>
}
