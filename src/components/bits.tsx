import { animate, AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { POWERS } from '../data/powers'
import { PHOTO_BY_ID, TEAM_COLORS } from '../data/teams'
import type { PowerId, Team } from '../types'

export const fmt = (n: number) => Math.round(n).toLocaleString('es-CO')

/* ───────── Avatar de equipo ───────── */

export function TeamAvatar({ team, size = 3, ring = false, className = '' }: { team: Pick<Team, 'emoji' | 'color' | 'photo'>; size?: number; ring?: boolean; className?: string }) {
  const c = TEAM_COLORS[team.color]
  const photo = team.photo ? PHOTO_BY_ID[team.photo] : null
  if (photo) {
    return (
      <span
        className={`inline-block shrink-0 overflow-hidden rounded-[32%] ${className}`}
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          padding: `${Math.max(0.12, size * 0.045)}rem`,
          background: `linear-gradient(160deg, ${c.a}, ${c.b})`,
          boxShadow: `0 ${size * 0.07}rem 0 ${c.lip}${ring ? `, 0 0 0 ${size * 0.06}rem #fff` : ''}`,
        }}
      >
        <img src={photo} alt="" draggable={false} className="block size-full rounded-[28%] object-cover" />
      </span>
    )
  }
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-[32%] ${className}`}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        fontSize: `${size * 0.56}rem`,
        background: `linear-gradient(160deg, ${c.a}, ${c.b})`,
        boxShadow: `0 ${size * 0.07}rem 0 ${c.lip}, inset 0 2px 0 rgb(255 255 255 / .45)${ring ? `, 0 0 0 ${size * 0.06}rem #fff` : ''}`,
      }}
    >
      <span aria-hidden style={{ lineHeight: 1 }}>
        {team.emoji}
      </span>
    </span>
  )
}

/* ───────── Número que cuenta hacia arriba ───────── */

export function AnimatedNumber({ value, className = '', duration = 0.9 }: { value: number; className?: string; duration?: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const ctrl = animate(from.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setShown(v),
    })
    from.current = value
    // Si la animación no puede correr (pestaña oculta), el número final igual queda puesto.
    const t = window.setTimeout(() => setShown(value), duration * 1000 + 250)
    return () => {
      ctrl.stop()
      window.clearTimeout(t)
    }
  }, [value, duration])
  return <span className={`tabular ${className}`}>{fmt(shown)}</span>
}

/* ───────── Carta de poder ───────── */

export function PowerCard({
  id,
  size = 'md',
  footer,
  dim = false,
  active = false,
  className = '',
}: {
  id: PowerId
  size?: 'xs' | 'sm' | 'md' | 'lg'
  footer?: ReactNode
  dim?: boolean
  active?: boolean
  className?: string
}) {
  const p = POWERS[id]
  const w = size === 'lg' ? 13 : size === 'md' ? 9.5 : size === 'sm' ? 6.4 : 3.6
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden text-center ${dim ? 'opacity-45 grayscale' : ''} ${className}`}
      style={{
        width: `${w}rem`,
        minHeight: `${w * 1.32}rem`,
        borderRadius: `${w * 0.1}rem`,
        padding: `${w * 0.07}rem`,
        background: `linear-gradient(165deg, ${p.a}, ${p.b})`,
        boxShadow: `0 ${w * 0.04}rem 0 ${p.lip}, 0 ${w * 0.08}rem ${w * 0.16}rem rgb(0 0 0 / .35), inset 0 0 0 ${w * 0.03}rem rgb(255 255 255 / .55)${
          active ? `, 0 0 0 ${w * 0.035}rem #fff, 0 0 ${w * 0.2}rem ${p.a}` : ''
        }`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-white/25"
        style={{ width: `${w * 0.52}rem`, height: `${w * 0.52}rem`, fontSize: `${w * 0.3}rem`, marginTop: `${w * 0.04}rem` }}
      >
        <span aria-hidden>{p.emoji}</span>
      </div>
      {size !== 'xs' && (
        <div className="font-display mt-[0.4em] text-white drop-shadow-[0_2px_0_rgb(0_0_0/0.25)]" style={{ fontSize: `${w * 0.105}rem`, lineHeight: 1.05 }}>
          {p.name}
        </div>
      )}
      {(size === 'md' || size === 'lg') && (
        <p className="mt-[0.35em] font-bold text-white/95" style={{ fontSize: `${w * 0.075}rem`, lineHeight: 1.25 }}>
          {p.desc}
        </p>
      )}
      {footer && <div className="mt-auto w-full pt-[0.4em]">{footer}</div>}
      <span className="shine pointer-events-none absolute inset-0" aria-hidden />
    </div>
  )
}

/* ───────── Modal ───────── */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  wide?: boolean
  labelledBy?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button aria-label="Cerrar" className="absolute inset-0 cursor-default bg-[#0b0520]/70 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`card-white relative flex max-h-[92dvh] w-full flex-col overflow-hidden ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {title && (
              <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-grape to-bubble px-6 py-4 text-white">
                <h2 id={labelledBy} className="font-display text-[1.7rem] leading-none">
                  {title}
                </h2>
                <button onClick={onClose} aria-label="Cerrar" className="grid size-11 place-items-center rounded-full bg-white/20 transition hover:bg-white/35">
                  <X className="size-6" strokeWidth={3} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───────── Barra de tiempo ───────── */

export function TimerBar({ left, limit, className = '', style }: { left: number | null; limit: number | null; className?: string; style?: CSSProperties }) {
  if (left === null || limit === null) {
    return (
      <div className={`chip bg-white/15 text-white ${className}`} style={style}>
        ⏱️ Sin límite de tiempo
      </div>
    )
  }
  const pct = Math.max(0, Math.min(1, left / limit))
  const color = pct > 0.5 ? '#2ee59d' : pct > 0.25 ? '#ffd23f' : '#ff4f6d'
  const urgent = left <= 5
  return (
    <div className={`flex items-center gap-3 ${className}`} style={style} role="timer" aria-label={`Quedan ${Math.ceil(left)} segundos`}>
      <motion.div
        className="font-display tabular grid min-w-[3.4rem] place-items-center rounded-2xl px-2 py-1 text-[1.7rem] leading-none"
        style={{ background: color, color: '#1b1036', boxShadow: '0 .2rem 0 rgb(0 0 0 / .3)' }}
        animate={urgent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
      >
        {Math.ceil(left)}
      </motion.div>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-black/30 ring-2 ring-white/15">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${color}, #fff8)`, transition: 'width .1s linear, background .3s' }}
        />
      </div>
    </div>
  )
}

/* ───────── Barra de medida ───────── */

export function Meter({ label, value, color, delay = 0, emoji }: { label: string; value: number; color: string; delay?: number; emoji?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-[0.95rem] font-extrabold">
        <span>
          {emoji && <span aria-hidden className="mr-1">{emoji}</span>}
          {label}
        </span>
        <span className="tabular">{value}</span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-black/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* ───────── Contador desde cero ───────── */

export function CountUp({ to, duration = 1.2, delay = 0, fresh = true, className = '' }: { to: number; duration?: number; delay?: number; fresh?: boolean; className?: string }) {
  const [shown, setShown] = useState(fresh ? 0 : to)
  useEffect(() => {
    if (!fresh) {
      setShown(to)
      return
    }
    let ctrl: ReturnType<typeof animate> | null = null
    const start = window.setTimeout(() => {
      ctrl = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setShown(v) })
    }, delay * 1000)
    const end = window.setTimeout(() => setShown(to), (delay + duration) * 1000 + 300)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
      ctrl?.stop()
    }
  }, [to, duration, delay, fresh])
  return <span className={`tabular ${className}`}>{fmt(shown)}</span>
}

/* ───────── Medidor circular ───────── */

export function Gauge({ value, size = 12, fresh = true, label }: { value: number; size?: number; fresh?: boolean; label?: string }) {
  const color = value >= 85 ? '#2ee59d' : value >= 70 ? '#38a3ff' : value >= 55 ? '#ffb300' : '#ff4f6d'
  return (
    <div className="relative grid place-items-center" style={{ width: `${size}rem`, height: `${size}rem` }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(0 0 0 / .08)" strokeWidth="12" />
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: fresh ? 0 : value / 100 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center leading-none">
        <div className="font-display text-ink" style={{ fontSize: `${size * 0.3}rem` }}>
          <CountUp to={value} duration={1.3} fresh={fresh} />
        </div>
        <div className="font-display text-ink-soft" style={{ fontSize: `${size * 0.1}rem` }}>
          /100
        </div>
        {label && <div className="mt-1 text-[0.8rem] font-black uppercase tracking-wider text-ink-soft">{label}</div>}
      </div>
    </div>
  )
}
