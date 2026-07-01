import { Search } from 'lucide-react'

export function SearchBar({ value, onChange }) {
  return (
    <label className="search-wrap">
      <Search size={18} />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar bebidas, combos, snacks..."
      />
    </label>
  )
}
