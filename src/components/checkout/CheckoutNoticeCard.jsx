import { PrimaryButton } from '../common/PrimaryButton'

export function CheckoutNoticeCard({ title, message, actionLabel, onAction }) {
  return (
    <section className="checkout-card checkout-notice-card">
      <h3>{title}</h3>
      <p>{message}</p>
      <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
    </section>
  )
}
