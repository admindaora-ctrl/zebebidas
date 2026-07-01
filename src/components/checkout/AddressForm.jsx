export function AddressForm({ form, onChange, errors = {} }) {
  return (
    <section className="checkout-card">
      <h3>Confirme seu endereço</h3>
      <label className="form-field">
        Rua
        <input
          className={errors.street ? 'input-error' : ''}
          value={form.street}
          onChange={(event) => onChange({ street: event.target.value })}
          placeholder="Digite sua rua"
        />
        {errors.street && <small className="field-error">{errors.street}</small>}
      </label>

      <div className="split-2">
        <label className="form-field">
          Número
          <input
            value={form.number}
            disabled={form.noNumber}
            onChange={(event) => onChange({ number: event.target.value })}
            placeholder="Número"
          />
        </label>
        <label className="form-field">
          Complemento
          <input
            value={form.complement}
            onChange={(event) => onChange({ complement: event.target.value })}
            placeholder="Apto, bloco, etc."
          />
        </label>
      </div>

      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={form.noNumber}
          onChange={(event) => onChange({ noNumber: event.target.checked, number: event.target.checked ? 'S/N' : '' })}
        />
        Sem número
      </label>

      <div className="split-2">
        <label className="form-field">
          Bairro
          <input
            className={errors.district ? 'input-error' : ''}
            value={form.district}
            onChange={(event) => onChange({ district: event.target.value })}
            placeholder="Seu bairro"
          />
          {errors.district && <small className="field-error">{errors.district}</small>}
        </label>
        <label className="form-field">
          Cidade/UF
          <input
            className={errors.cityUf ? 'input-error' : ''}
            value={form.cityUf}
            onChange={(event) => onChange({ cityUf: event.target.value })}
            placeholder="Cidade - UF"
          />
          {errors.cityUf && <small className="field-error">{errors.cityUf}</small>}
        </label>
      </div>

      <label className="form-field">
        Referência
        <input
          value={form.reference}
          onChange={(event) => onChange({ reference: event.target.value })}
          placeholder="Ex.: Próximo ao mercado"
        />
      </label>
    </section>
  )
}
