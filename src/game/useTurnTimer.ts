import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from '../lib/sound'
import { useUI } from './GameContext'

/**
 * Reloj del turno. Cuenta con performance.now() (no se desfasa si el navegador
 * frena los intervalos), respeta la pausa del profesor y avisa al llegar a cero.
 */
export function useTurnTimer(limit: number | null, running: boolean, onExpire: () => void) {
  const { paused } = useUI()
  const [elapsed, setElapsed] = useState(0)
  const acc = useRef(0)
  const start = useRef<number | null>(null)
  const expired = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire
  const active = running && !paused

  useEffect(() => {
    if (!active) return
    start.current = performance.now()
    const id = window.setInterval(() => {
      const e = acc.current + (performance.now() - (start.current ?? performance.now())) / 1000
      setElapsed(e)
      if (limit !== null && e >= limit && !expired.current) {
        expired.current = true
        onExpireRef.current()
      }
    }, 100)
    return () => {
      window.clearInterval(id)
      if (start.current !== null) acc.current += (performance.now() - start.current) / 1000
      start.current = null
    }
  }, [active, limit])

  const getElapsed = useCallback(() => acc.current + (start.current !== null ? (performance.now() - start.current) / 1000 : 0), [])

  const left = limit === null ? null : Math.max(0, limit - elapsed)

  const lastTick = useRef(-1)
  useEffect(() => {
    if (left === null || !active || left <= 0 || left > 5) return
    const s = Math.ceil(left)
    if (s !== lastTick.current) {
      lastTick.current = s
      sfx.tick()
    }
  }, [left, active])

  return { elapsed, left, getElapsed, paused }
}
