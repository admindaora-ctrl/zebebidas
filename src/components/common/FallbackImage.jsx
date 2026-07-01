import { useState } from 'react'
import { getFallbackImage } from '../../config/images'

export function FallbackImage({ src, alt, category, className = '', ...props }) {
  const fallback = getFallbackImage(category)
  const [currentSrc, setCurrentSrc] = useState(src || fallback)

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={props.loading || 'lazy'}
      decoding="async"
      onError={() => { if (currentSrc !== fallback) setCurrentSrc(fallback) }}
      {...props}
    />
  )
}
