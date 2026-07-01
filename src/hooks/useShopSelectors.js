import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useShopStore, shopSelectors } from '../store/useShopStore'
import { computeTotals } from '../config/shop'

// ── Primitivos (referência estável) ───────────────────────────
export function useCartOpen() {
  return useShopStore(shopSelectors.cartOpen)
}

export function useCartCount() {
  return useShopStore(shopSelectors.cartCount)
}

export function useLocation() {
  return useShopStore(shopSelectors.location)
}

export function useCurrentDriver() {
  return useShopStore(shopSelectors.currentDriver)
}

export function useCoupon() {
  return useShopStore(shopSelectors.coupon)
}

export function useAccount() {
  return useShopStore(shopSelectors.account)
}

export function useAgeConfirmed() {
  return useShopStore(shopSelectors.ageConfirmed)
}

// ── Derivados (precisam de memo para não quebrar o store) ─────
// Seleciona `items` direto do store (referência estável) e derive
// o array no componente via useMemo. Evita loop infinito do
// useSyncExternalStore quando o selector retorna um novo array.
export function useCartItems() {
  const items = useShopStore((s) => s.items)
  return useMemo(() => Object.values(items), [items])
}

export function useTotals() {
  const items = useShopStore((s) => s.items)
  const coupon = useShopStore((s) => s.coupon)
  return useMemo(() => computeTotals(items, coupon), [items, coupon])
}

// ── Objetos do store (useShallow para comparar por chave) ─────
export function useCheckoutReadiness() {
  return useShopStore(
    useShallow((s) => ({
      canStartCheckout: Object.keys(s.items).length > 0,
      canReviewCheckout: !!(
        s.customer.name &&
        s.customer.phone &&
        s.address.street &&
        s.address.district &&
        s.address.cityUf
      ),
    })),
  )
}

export function useCheckoutData() {
  return useShopStore(
    useShallow((s) => ({ customer: s.customer, address: s.address })),
  )
}

// ── Actions (bundle estável via useShallow) ──────────────────
export function useShopActions() {
  return useShopStore(
    useShallow((s) => ({
      openCart: s.openCart,
      closeCart: s.closeCart,
      toggleCart: s.toggleCart,
      addToCart: s.addToCart,
      decreaseQty: s.decreaseQty,
      removeFromCart: s.removeFromCart,
      clearCart: s.clearCart,
      setCustomer: s.setCustomer,
      setAddress: s.setAddress,
      resetCheckout: s.resetCheckout,
      setLocation: s.setLocation,
      assignDriver: s.assignDriver,
      applyCoupon: s.applyCoupon,
      clearCoupon: s.clearCoupon,
      register: s.register,
      confirmAge: s.confirmAge,
    })),
  )
}
