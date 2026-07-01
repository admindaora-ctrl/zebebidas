export function PrimaryButton({ children, className = '', variant = 'gold', ...props }) {
  const variantClass = variant === 'green' ? 'btn-green' : 'btn-gold'
  return (
    <button className={`btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
