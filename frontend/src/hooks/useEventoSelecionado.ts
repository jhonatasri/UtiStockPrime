import { useState, useEffect } from 'react'

export function useEventoSelecionado() {
  const [eventoId, setEventoId] = useState<number | undefined>(undefined)
  const [nomeEvento, setNomeEvento] = useState<string>('Evento')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = Number(localStorage.getItem('selected-team-id')) || undefined
    const nome = localStorage.getItem('selected-team-name') ?? 'Evento'
    setEventoId(id)
    setNomeEvento(nome)
    setMounted(true)
  }, [])

  return { eventoId, nomeEvento, mounted }
}
