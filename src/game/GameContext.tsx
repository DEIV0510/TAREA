import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { setSoundEnabled } from '../lib/sound'
import type { GameState } from '../types'
import { loadState, reducer, saveState, type Action } from './engine'

interface GameCtx {
  state: GameState
  dispatch: Dispatch<Action>
}

const Ctx = createContext<GameCtx | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  // Se hidrata de forma síncrona: el primer render ya trae la partida guardada,
  // así el efecto de guardado nunca pisa lo guardado con un estado vacío.
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useGame(): GameCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGame fuera de GameProvider')
  return v
}

/* ───────── Preferencias (sonido, animaciones) ───────── */

export interface Prefs {
  sound: boolean
  calm: boolean
}

const PREFS_KEY = 'adbattle:prefs:v1'

function loadPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as Partial<Prefs>
    return { sound: p.sound ?? true, calm: p.calm ?? false }
  } catch {
    return { sound: true, calm: false }
  }
}

interface UICtx {
  prefs: Prefs
  setPrefs: (p: Partial<Prefs>) => void
  paused: boolean
  setPaused: (v: boolean) => void
  teacherOpen: boolean
  setTeacherOpen: (v: boolean) => void
}

const UI = createContext<UICtx | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs)
  const [paused, setPaused] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)

  useEffect(() => {
    setSoundEnabled(prefs.sound)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      /* sin almacenamiento */
    }
  }, [prefs])

  const value = useMemo<UICtx>(
    () => ({
      prefs,
      setPrefs: (p) => setPrefsState((old) => ({ ...old, ...p })),
      paused,
      setPaused,
      teacherOpen,
      setTeacherOpen,
    }),
    [prefs, paused, teacherOpen],
  )
  return <UI.Provider value={value}>{children}</UI.Provider>
}

export function useUI(): UICtx {
  const v = useContext(UI)
  if (!v) throw new Error('useUI fuera de UIProvider')
  return v
}

/* ───────── Reloj de la partida (duración máxima) ───────── */

interface ClockCtx {
  left: number
  total: number
  running: boolean
}

const Clock = createContext<ClockCtx>({ left: 600, total: 600, running: false })
const CLOCK_KEY = 'adbattle:clock:v1'

function loadClock(gameId: string): number {
  try {
    const c = JSON.parse(localStorage.getItem(CLOCK_KEY) ?? '{}') as { gameId?: string; elapsed?: number }
    return c.gameId === gameId && typeof c.elapsed === 'number' ? c.elapsed : 0
  } catch {
    return 0
  }
}

function saveClock(gameId: string, elapsed: number) {
  try {
    localStorage.setItem(CLOCK_KEY, JSON.stringify({ gameId, elapsed }))
  } catch {
    /* sin almacenamiento */
  }
}

/**
 * Cuenta el tiempo total de la partida. Se detiene con la pausa del profesor
 * y, al llegar a cero, avisa al motor para cerrar con la Gran Final.
 */
export function ClockProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame()
  const { paused } = useUI()
  const total = state.settings.duration * 60
  const [clock, setClock] = useState(() => ({ gameId: state.gameId, elapsed: loadClock(state.gameId) }))
  const elapsed = clock.gameId === state.gameId ? clock.elapsed : loadClock(state.gameId)
  const running = state.status === 'playing' && state.stage !== 'final' && !paused && !state.timeUp

  useEffect(() => {
    if (!running) return
    const gameId = state.gameId
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      setClock((c) => {
        const base = c.gameId === gameId ? c.elapsed : loadClock(gameId)
        const next = base + dt
        saveClock(gameId, next)
        return { gameId, elapsed: next }
      })
    }, 500)
    return () => window.clearInterval(id)
  }, [running, state.gameId])

  const left = Math.max(0, total - elapsed)

  useEffect(() => {
    if (running && left <= 0) dispatch({ type: 'timeUp' })
  }, [running, left, dispatch])

  const value = useMemo(() => ({ left, total, running }), [left, total, running])
  return <Clock.Provider value={value}>{children}</Clock.Provider>
}

export function useClock(): ClockCtx {
  return useContext(Clock)
}
