// Pool fictício de entregadores. Usado para exibir na DriverPage após o
// cliente confirmar o endereço. Nenhum dado aqui é real.

export const DRIVERS_POOL = [
  {
    id: 1,
    name: 'LEANDRO BATISTA MOREIRA',
    photoInitials: 'LM',
    photoBg: '#f7b825',
    rating: 4.8,
    vehicle: 'Honda Bros 160',
    plate: 'WGD-6E80',
    cnpj: '39.xxx.xxx/0001-07',
  },
  {
    id: 2,
    name: 'RAFAEL SOUZA LIMA',
    photoInitials: 'RL',
    photoBg: '#00a85a',
    rating: 4.9,
    vehicle: 'Yamaha Fazer 250',
    plate: 'RKT-4A21',
    cnpj: '39.xxx.xxx/0001-07',
  },
  {
    id: 3,
    name: 'JOÃO VITOR DA SILVA',
    photoInitials: 'JS',
    photoBg: '#3b82f6',
    rating: 4.7,
    vehicle: 'Honda CG 160',
    plate: 'BWX-8C54',
    cnpj: '39.xxx.xxx/0001-07',
  },
  {
    id: 4,
    name: 'ANDERSON OLIVEIRA',
    photoInitials: 'AO',
    photoBg: '#ef4444',
    rating: 4.8,
    vehicle: 'Yamaha Factor 150',
    plate: 'NHQ-2E77',
    cnpj: '39.xxx.xxx/0001-07',
  },
]

export function pickDriver() {
  return DRIVERS_POOL[Math.floor(Math.random() * DRIVERS_POOL.length)]
}
