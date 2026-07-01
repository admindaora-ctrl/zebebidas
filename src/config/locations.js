// Localização do cliente.
//
// A lista de estados e cidades é buscada dinamicamente da API pública do IBGE
// (https://servicodados.ibge.gov.br/api/v1/localidades) — sem chave, sem custo,
// sempre atualizada. Ver `fetchStates()` e `fetchCities()` abaixo.
//
// A distância e o tempo de entrega são FICTÍCIOS: gerados aleatoriamente ao
// confirmar a localização, apenas para preencher a UI (esta versão do app
// não tem cálculo real de rotas).

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades'

// GET /estados?orderBy=nome → [{ id, sigla, nome }, ...]
export async function fetchStates() {
  const res = await fetch(`${IBGE_BASE}/estados?orderBy=nome`)
  if (!res.ok) throw new Error('Falha ao carregar estados')
  return res.json()
}

// GET /estados/{UF}/municipios?orderBy=nome → [{ id, nome }, ...]
export async function fetchCities(uf) {
  const res = await fetch(`${IBGE_BASE}/estados/${uf}/municipios?orderBy=nome`)
  if (!res.ok) throw new Error('Falha ao carregar cidades')
  return res.json()
}

// Gera valores fictícios "razoáveis" para distância/ETA,
// só para a UI ter algo que mostrar.
export function fakeDeliveryEstimate() {
  const distanceKm = +(4 + Math.random() * 2.9).toFixed(1)  // 4.0 – 6.9 km
  const etaMin     = Math.round(20 + Math.random() * 18)    // 20 – 38 min
  return { distanceKm, etaMin }
}

// Monta o payload de location a partir de estado + cidade.
// O bairro fica opcional — o cliente preenche depois no checkout.
export function buildLocation({ uf, stateName, cityName }) {
  const { distanceKm, etaMin } = fakeDeliveryEstimate()
  return {
    uf,
    stateName,
    cityName,
    districtName: '',
    districtId:   '',
    cityId:       '',
    distanceKm,
    etaMin,
  }
}

// Fallback neutro caso o usuário fique sem location por algum motivo.
// Sem cidade/estado fixos — a localização real é escolhida no modal.
export const DEFAULT_LOCATION = {
  uf:           '',
  stateName:    '',
  cityName:     'sua região',
  districtName: '',
  districtId:   '',
  cityId:       '',
  distanceKm:   5.2,
  etaMin:       28,
}
