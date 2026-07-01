// Mapeia cada categoria a um ícone Lucide (substitui os emojis antigos).
import { createElement } from 'react'
import {
  Tag,
  Beer,
  Martini,
  Wine,
  Flame,
  Droplets,
  CupSoda,
  IceCreamCone,
  ShoppingBag,
  Cigarette,
  Zap,
  GlassWater,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  ofertas: Tag,
  cervejas: Beer,
  destilados: Martini,
  vinhos: Wine,
  churrasco: Flame,
  chopp: GlassWater,
  'aguas-e-gelo': Droplets,
  'nao-alcoolicos': CupSoda,
  'drinks-prontos': Martini,
  sobremesas: IceCreamCone,
  conveniencia: ShoppingBag,
  cigarros: Cigarette,
  refrigerantes: CupSoda,
  energeticos: Zap,
}

export function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] || ShoppingBag
}

// Componente estável que renderiza o ícone da categoria (evita criar
// componentes durante o render — ver react-hooks/static-components).
export function CategoryGlyph({ slug, ...props }) {
  return createElement(getCategoryIcon(slug), props)
}
