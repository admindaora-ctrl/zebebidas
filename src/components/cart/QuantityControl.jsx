import { Minus, Plus } from 'lucide-react'

export function QuantityControl({ qty, onIncrease, onDecrease }) {
  return (
    <div className="qty-control">
      <button onClick={onDecrease} aria-label="Diminuir">
        <Minus size={14} />
      </button>
      <span>{qty}</span>
      <button onClick={onIncrease} aria-label="Aumentar">
        <Plus size={14} />
      </button>
    </div>
  )
}
