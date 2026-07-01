// Imagens de fallback POR CATEGORIA.
//
// Cerca de 24% das imagens de produtos vinham de CDNs de terceiros que estão
// fora do ar/bloqueados (ex.: zeeseudistribuidor.com). Antes, todas caíam em
// UMA única imagem global — por isso vários produtos apareciam "iguais".
// Agora, quando a imagem original falha, mostramos uma foto relevante da
// categoria (todas verificadas e estáveis no Unsplash), reduzindo a repetição
// até que a foto exata de cada produto seja cadastrada.

export const GLOBAL_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60'

export const CATEGORY_IMAGE_FALLBACK = {
  ofertas: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=600&auto=format&fit=crop&q=60',
  cervejas: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60',
  destilados: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&auto=format&fit=crop&q=60',
  vinhos: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=60',
  churrasco: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=60',
  chopp: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=60',
  'aguas-e-gelo': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&auto=format&fit=crop&q=60',
  'nao-alcoolicos': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=600&auto=format&fit=crop&q=60',
  'drinks-prontos': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop&q=60',
  sobremesas: 'https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?w=600&auto=format&fit=crop&q=60',
  conveniencia: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=60',
  cigarros: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=60',
  refrigerantes: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=60',
  energeticos: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&auto=format&fit=crop&q=60',
}

export function getFallbackImage(category) {
  return CATEGORY_IMAGE_FALLBACK[category] || GLOBAL_IMAGE_FALLBACK
}
