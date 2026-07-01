import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { pickDriver } from '../config/drivers'
import { validateCoupon } from '../config/shop'
import { fakeDeliveryEstimate } from '../config/locations'

const initialCart = { items: {}, open: false }
const initialCheckout = {
  // cpf fica apenas em memória (não é persistido) — ver `partialize`.
  customer: { name: '', phone: '', cpf: '' },
  address: { street: '', number: '', complement: '', noNumber: false, district: '', cityUf: '', reference: '' },
}
const initialExtras = {
  location: null,       // { uf, stateName, cityName, distanceKm, etaMin }
  currentDriver: null,  // Entregador atribuído ao pedido atual (persistido)
  coupon: null,         // { code, percent, label } | null
  account: null,        // { email, createdAt } | null — conta temporária no navegador
  ageConfirmed: false,  // confirmação de maioridade (18+)
}

export const useShopStore = create(
  persist(
    (set, get) => ({
      ...initialCart,
      ...initialCheckout,
      ...initialExtras,

      // Cart actions
      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      toggleCart: () => set((s) => ({ open: !s.open })),

      addToCart: (product) =>
        set((s) => {
          const existing = s.items[product.id]
          return {
            items: {
              ...s.items,
              [product.id]: existing
                ? { ...existing, qty: existing.qty + 1 }
                : { ...product, qty: 1 },
            },
          }
        }),

      decreaseQty: (id) =>
        set((s) => {
          const item = s.items[id]
          if (!item) return s
          if (item.qty <= 1) {
            const { [id]: _, ...rest } = s.items
            return { items: rest }
          }
          return { items: { ...s.items, [id]: { ...item, qty: item.qty - 1 } } }
        }),

      removeFromCart: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.items
          return { items: rest }
        }),

      clearCart: () => set({ items: {} }),

      // Coupon actions
      applyCoupon: (code) => {
        const coupon = validateCoupon(code)
        if (!coupon) return false
        set({ coupon })
        return true
      },
      clearCoupon: () => set({ coupon: null }),

      // Account (conta rápida — só no navegador)
      register: ({ email }) => set({ account: { email, createdAt: Date.now() } }),

      // Confirmação de maioridade
      confirmAge: () => set({ ageConfirmed: true }),

      // Checkout actions
      setCustomer: (data) => set((s) => ({ customer: { ...s.customer, ...data } })),
      setAddress: (data) => set((s) => ({ address: { ...s.address, ...data } })),
      resetCheckout: () =>
        set({ ...initialCheckout, items: {}, currentDriver: null, coupon: null }),

      // Location
      setLocation: (location) =>
        set((s) => {
          const addressPatch =
            location && (!s.address.cityUf || s.address.cityUf.trim() === '')
              ? { ...s.address, cityUf: `${location.cityName} - ${location.uf}` }
              : s.address
          return { location, address: addressPatch }
        }),

      // Driver
      assignDriver: () => {
        if (get().currentDriver) return
        set({ currentDriver: pickDriver() })
      },
    }),
    {
      name: STORAGE_KEYS.SHOP_STATE,
      // v2: recalcula a estimativa de entrega (distância/tempo) salva por versões
      // antigas, garantindo os novos intervalos (4–6,9 km e 20–38 min).
      version: 2,
      migrate: (persisted) => {
        if (persisted?.location) {
          const { distanceKm, etaMin } = fakeDeliveryEstimate()
          persisted.location = { ...persisted.location, distanceKm, etaMin }
        }
        return persisted
      },
      partialize: (s) => ({
        items: s.items,
        // Não persistimos CPF nem CEP (CPF some ao recarregar a página).
        customer: { name: s.customer.name, phone: s.customer.phone },
        address: s.address,
        location: s.location,
        currentDriver: s.currentDriver,
        coupon: s.coupon,
        account: s.account,
        ageConfirmed: s.ageConfirmed,
      }),
    },
  ),
)

// ── Selectors atômicos (referência estável para useSyncExternalStore) ────
// Seletores que retornam objetos/arrays derivados vivem em useShopSelectors.js
// e usam useMemo ou useShallow para não quebrar o store.
export const shopSelectors = {
  cartOpen: (s) => s.open,
  cartCount: (s) => Object.values(s.items).reduce((n, i) => n + i.qty, 0),
  location: (s) => s.location,
  currentDriver: (s) => s.currentDriver,
  coupon: (s) => s.coupon,
  account: (s) => s.account,
  ageConfirmed: (s) => s.ageConfirmed,
}
