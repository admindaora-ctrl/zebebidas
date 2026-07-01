export function CustomerForm({ form, onChange, errors = {} }) {
  return (
    <section className="checkout-card">
      <h3>Identificação</h3>
      <label className="form-field">
        Nome Completo
        <input
          className={errors.name ? 'input-error' : ''}
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Digite seu nome completo"
        />
        {errors.name && <small className="field-error">{errors.name}</small>}
      </label>
      <label className="form-field">
        Telefone/WhatsApp
        <input
          className={errors.phone ? 'input-error' : ''}
          value={form.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          placeholder="(00) 00000-0000"
        />
        {errors.phone && <small className="field-error">{errors.phone}</small>}
      </label>
    </section>
  )
}
