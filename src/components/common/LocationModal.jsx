import { useState, useEffect } from 'react'
import { MapPin, Clock3, Loader2 } from 'lucide-react'
import { fetchStates, fetchCities, buildLocation } from '../../config/locations'
import { useShopActions } from '../../hooks/useShopSelectors'
import { PrimaryButton } from './PrimaryButton'

// Estado simples para requests assíncronos: 'loading' | 'ready' | 'error'.
const STATUS = { LOADING: 'loading', READY: 'ready', ERROR: 'error' }

export function LocationModal() {
  const { setLocation } = useShopActions()

  const [states,  setStates]  = useState([])
  const [statesStatus, setStatesStatus] = useState(STATUS.LOADING)

  const [uf, setUf] = useState('')
  const [cityName, setCityName] = useState('')

  const [cities, setCities] = useState([])
  const [citiesStatus, setCitiesStatus] = useState(STATUS.READY)

  // Carrega estados ao montar.
  useEffect(() => {
    const controller = new AbortController()
    fetchStates()
      .then((data) => {
        if (controller.signal.aborted) return
        setStates(data)
        setStatesStatus(STATUS.READY)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setStatesStatus(STATUS.ERROR)
      })
    return () => controller.abort()
  }, [])

  // Carrega cidades sempre que o estado (uf) mudar.
  // Nota: o reset de estado local (cities/cityName/status) é feito no onChange
  // do select de estado para evitar setState síncrono dentro do efeito.
  useEffect(() => {
    if (!uf) return
    const controller = new AbortController()
    fetchCities(uf)
      .then((data) => {
        if (controller.signal.aborted) return
        setCities(data)
        setCitiesStatus(STATUS.READY)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setCitiesStatus(STATUS.ERROR)
      })
    return () => controller.abort()
  }, [uf])

  const handleUfChange = (newUf) => {
    setUf(newUf)
    setCityName('')
    setCities([])
    setCitiesStatus(newUf ? STATUS.LOADING : STATUS.READY)
  }

  const selectedState = states.find((s) => s.sigla === uf)

  const handleConfirm = () => {
    if (!uf || !cityName) return
    const location = buildLocation({
      uf,
      stateName: selectedState?.nome || '',
      cityName,
    })
    setLocation(location)
  }

  const hasError = statesStatus === STATUS.ERROR || citiesStatus === STATUS.ERROR
  const loadingStates = statesStatus === STATUS.LOADING
  const loadingCities = citiesStatus === STATUS.LOADING

  return (
    <div className="location-modal-overlay" role="dialog" aria-modal="true">
      <div className="location-modal-card">
        <div className="location-modal-icon">
          <MapPin size={28} />
        </div>

        <h2>Onde você está?</h2>
        <p className="location-modal-sub">
          Informe seu estado e cidade para continuarmos. O endereço completo você preenche depois.
        </p>

        {hasError && (
          <div className="location-modal-error">
            Não foi possível carregar a lista. Verifique sua conexão e tente novamente.
          </div>
        )}

        <label className="location-field">
          <span>Estado</span>
          <select
            value={uf}
            onChange={(e) => handleUfChange(e.target.value)}
            disabled={loadingStates}
          >
            <option value="">
              {loadingStates ? 'Carregando estados…' : 'Selecione seu estado…'}
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.sigla}>
                {s.nome} ({s.sigla})
              </option>
            ))}
          </select>
        </label>

        <label className="location-field">
          <span>Cidade</span>
          <select
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            disabled={!uf || loadingCities}
          >
            <option value="">
              {!uf
                ? 'Selecione um estado primeiro'
                : loadingCities
                  ? 'Carregando cidades…'
                  : 'Selecione sua cidade…'}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
          {loadingCities && (
            <span className="location-field-spinner">
              <Loader2 size={14} className="spin" />
            </span>
          )}
        </label>

        <PrimaryButton
          variant="gold"
          onClick={handleConfirm}
          disabled={!uf || !cityName}
          style={{ width: '100%', marginTop: 16 }}
        >
          Confirmar localização
        </PrimaryButton>

        <small className="location-modal-foot">
          <Clock3 size={12} /> Entrega estimada conforme a sua região.
        </small>
      </div>
    </div>
  )
}
