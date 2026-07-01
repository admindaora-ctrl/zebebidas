// Indicador visual das 3 etapas do checkout.
// currentStep: 1 = Identificação, 2 = Endereço (DriverPage), 3 = Pagamento.
// A ReviewPage fica sem step numerado (como no modelo de referência).

import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Endereço' },
  { id: 3, label: 'Pagamento' },
]

export function CheckoutStepper({ currentStep = 1 }) {
  return (
    <div className="checkout-stepper" role="list">
      {STEPS.map((step, idx) => {
        const isDone    = currentStep > step.id
        const isActive  = currentStep === step.id
        const state     = isDone ? 'done' : isActive ? 'active' : 'pending'
        return (
          <div key={step.id} className="checkout-stepper__item" role="listitem">
            <div className={`checkout-stepper__circle checkout-stepper__circle--${state}`}>
              {isDone ? <Check size={14} strokeWidth={3} /> : step.id}
            </div>
            <span className={`checkout-stepper__label checkout-stepper__label--${state}`}>
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <span className={`checkout-stepper__sep checkout-stepper__sep--${isDone ? 'done' : 'pending'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
