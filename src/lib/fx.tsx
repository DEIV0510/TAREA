import confettiLib from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { PowerCard } from '../components/bits'
import { useUI } from '../game/GameContext'
import type { PowerId } from '../types'

type Point = { x: number; y: number }
type ConfettiKind = 'burst' | 'big' | 'sides' | 'fireworks' | 'coins'

interface FloatItem {
  id: number
  text: string
  from: Point
  to: Point
  color: string
  hit: string | null
}
interface BurstItem {
  id: number
  text: string
  sub?: string
  color: string
}
interface BannerItem {
  id: number
  emoji: string
  title: string
  sub?: string
  color: string
}
interface ToastItem {
  id: number
  icon: string
  title: string
  sub?: string
}
interface RewardItem {
  id: number
  card: PowerId
  title: string
  sub?: string
}

export interface FxApi {
  confetti: (kind?: ConfettiKind, origin?: Point) => void
  flash: (tone: 'good' | 'bad' | 'gold') => void
  shake: () => void
  float: (text: string, from: Point | null, teamId: string | null, color?: string) => void
  burst: (text: string, sub?: string, color?: string) => void
  banner: (b: { emoji: string; title: string; sub?: string; color?: string }) => void
  toast: (t: { icon: string; title: string; sub?: string }) => void
  reward: (r: { card: PowerId; title: string; sub?: string }) => void
  /** Punto de origen del último clic (para que los "+100" salgan de la respuesta) */
  origin: MutableRefObject<Point | null>
}

const FxCtx = createContext<FxApi | null>(null)

export function useFx(): FxApi {
  const v = useContext(FxCtx)
  if (!v) throw new Error('useFx fuera de FxProvider')
  return v
}

let nextId = 1
const PALETTE = ['#ff4fa3', '#ffd23f', '#38a3ff', '#2ee59d', '#8b5cf6', '#ffffff']

function scoreTarget(teamId: string | null): { point: Point; el: HTMLElement } | null {
  if (!teamId) return null
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-score-target="${teamId}"]`))
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return { point: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, el }
  }
  return null
}

export function FxProvider({ children }: { children: ReactNode }) {
  const { prefs } = useUI()
  const calmRef = useRef(prefs.calm)
  calmRef.current = prefs.calm

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const shooter = useRef<ReturnType<typeof confettiLib.create> | null>(null)
  const origin = useRef<Point | null>(null)

  const [flash, setFlash] = useState<{ id: number; tone: 'good' | 'bad' | 'gold' } | null>(null)
  const [floats, setFloats] = useState<FloatItem[]>([])
  const [bursts, setBursts] = useState<BurstItem[]>([])
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [reward, setReward] = useState<RewardItem | null>(null)

  useEffect(() => {
    if (canvasRef.current && !shooter.current) {
      shooter.current = confettiLib.create(canvasRef.current, { resize: true, useWorker: false })
    }
  }, [])

  const confetti = useCallback<FxApi['confetti']>((kind = 'burst', at) => {
    const fire = shooter.current
    if (!fire) return
    const calm = calmRef.current
    const k = calm ? 0.35 : 1
    const o = at ? { x: at.x / window.innerWidth, y: at.y / window.innerHeight } : { x: 0.5, y: 0.45 }
    try {
      if (kind === 'burst') {
        void fire({ particleCount: Math.round(70 * k), spread: 75, startVelocity: 38, origin: o, colors: PALETTE, scalar: 1.1, ticks: 160 })
      } else if (kind === 'coins') {
        void fire({ particleCount: Math.round(30 * k), spread: 60, startVelocity: 30, origin: o, colors: ['#ffd23f', '#ffb300', '#fff3a0'], shapes: ['circle'], scalar: 1.3, ticks: 140 })
      } else if (kind === 'big') {
        void fire({ particleCount: Math.round(160 * k), spread: 110, startVelocity: 48, origin: { x: 0.5, y: 0.55 }, colors: PALETTE, scalar: 1.2, ticks: 220 })
        void fire({ particleCount: Math.round(60 * k), spread: 160, startVelocity: 30, origin: { x: 0.5, y: 0.3 }, colors: PALETTE, shapes: ['star'], scalar: 1.4, ticks: 220 })
      } else if (kind === 'sides') {
        void fire({ particleCount: Math.round(80 * k), angle: 60, spread: 65, origin: { x: 0, y: 0.75 }, colors: PALETTE, startVelocity: 55, ticks: 220 })
        void fire({ particleCount: Math.round(80 * k), angle: 120, spread: 65, origin: { x: 1, y: 0.75 }, colors: PALETTE, startVelocity: 55, ticks: 220 })
      } else if (kind === 'fireworks') {
        const shots = calm ? 3 : 9
        for (let i = 0; i < shots; i++) {
          window.setTimeout(() => {
            void shooter.current?.({
              particleCount: Math.round(90 * k),
              spread: 360,
              startVelocity: 32,
              gravity: 0.9,
              ticks: 200,
              origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.35 },
              colors: PALETTE,
              shapes: i % 2 ? ['star'] : ['circle', 'square'],
              scalar: 1.2,
            })
          }, i * 420)
        }
      }
    } catch {
      /* sin canvas */
    }
  }, [])

  const flashFn = useCallback<FxApi['flash']>((tone) => {
    const id = nextId++
    setFlash({ id, tone })
    window.setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), 700)
  }, [])

  const shake = useCallback(() => {
    if (calmRef.current) return
    const el = document.getElementById('stage-root')
    if (!el) return
    el.classList.remove('anim-shake')
    void el.offsetWidth
    el.classList.add('anim-shake')
    window.setTimeout(() => el.classList.remove('anim-shake'), 500)
  }, [])

  const float = useCallback<FxApi['float']>((text, from, teamId, color = '#ffd23f') => {
    const target = scoreTarget(teamId)
    const start = from ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const to = target?.point ?? { x: start.x, y: start.y - 180 }
    const id = nextId++
    setFloats((l) => [...l, { id, text, from: start, to, color, hit: teamId }])
    window.setTimeout(() => {
      setFloats((l) => l.filter((f) => f.id !== id))
      const el = scoreTarget(teamId)?.el
      try {
        el?.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.45)', color: '#ffd23f' }, { transform: 'scale(1)' }],
          { duration: 450, easing: 'ease-out' },
        )
      } catch {
        /* sin WAAPI */
      }
    }, 1150)
  }, [])

  const burst = useCallback<FxApi['burst']>((text, sub, color = '#ffd23f') => {
    const id = nextId++
    setBursts((l) => [...l.slice(-1), { id, text, sub, color }])
    window.setTimeout(() => setBursts((l) => l.filter((b) => b.id !== id)), 1050)
  }, [])

  const banner = useCallback<FxApi['banner']>((b) => {
    const id = nextId++
    setBanners((l) => [...l.slice(-1), { id, color: '#ff4fa3', ...b }])
    window.setTimeout(() => setBanners((l) => l.filter((x) => x.id !== id)), 2600)
  }, [])

  const toast = useCallback<FxApi['toast']>((t) => {
    const id = nextId++
    setToasts((l) => [...l.slice(-3), { id, ...t }])
    window.setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), 3800)
  }, [])

  const rewardFn = useCallback<FxApi['reward']>((r) => {
    const id = nextId++
    setReward({ id, ...r })
    window.setTimeout(() => setReward((x) => (x?.id === id ? null : x)), 3200)
  }, [])

  const api = useMemo<FxApi>(
    () => ({ confetti, flash: flashFn, shake, float, burst, banner, toast, reward: rewardFn, origin }),
    [confetti, flashFn, shake, float, burst, banner, toast, rewardFn],
  )

  const flashBg =
    flash?.tone === 'good'
      ? 'radial-gradient(circle at 50% 50%, rgb(255 255 255 / .55), rgb(46 229 157 / .25) 45%, transparent 75%)'
      : flash?.tone === 'gold'
        ? 'radial-gradient(circle at 50% 40%, rgb(255 244 180 / .7), rgb(255 210 63 / .3) 45%, transparent 75%)'
        : 'radial-gradient(circle at 50% 50%, transparent 40%, rgb(255 60 90 / .35) 100%)'

  return (
    <FxCtx.Provider value={api}>
      {children}

      {/* capa de efectos */}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />

      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.id}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[60]"
            style={{ background: flashBg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, times: [0, 0.25, 1] }}
          />
        )}
      </AnimatePresence>

      <div aria-hidden className="pointer-events-none fixed inset-0 z-[75]">
        {floats.map((f) => (
          <motion.div
            key={f.id}
            className="absolute left-0 top-0"
            initial={{ x: f.from.x, y: f.from.y, scale: 0.5, opacity: 0 }}
            animate={{
              x: [f.from.x, f.from.x, f.to.x],
              y: [f.from.y, f.from.y - 70, f.to.y],
              scale: [0.5, 1.35, 0.55],
              opacity: [0, 1, 1, 0.2],
            }}
            transition={{ duration: 1.15, times: [0, 0.35, 1], ease: 'easeInOut' }}
          >
            <span
              className="font-display block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[3rem] leading-none"
              style={{ color: f.color, textShadow: '0 .08em 0 #3b0f8a, 0 .16em .3em rgb(0 0 0 / .5)', WebkitTextStroke: '2px #fff' }}
            >
              {f.text}
            </span>
          </motion.div>
        ))}
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[76] grid place-items-center">
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              className="col-start-1 row-start-1 text-center"
              initial={{ scale: 0.2, rotate: -12, opacity: 0 }}
              animate={{ scale: [0.2, 1.25, 1], rotate: [-12, 4, -3], opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
            >
              <div
                className="font-display text-[5.4rem] leading-none"
                style={{ color: b.color, WebkitTextStroke: '3px #fff', textShadow: '0 .06em 0 #5b21b6, 0 .12em 0 #3b0f8a, 0 .25em .4em rgb(0 0 0 / .5)' }}
              >
                {b.text}
              </div>
              {b.sub && <div className="font-display mt-2 text-[2rem] text-white drop-shadow-[0_3px_0_rgb(0_0_0/0.35)]">{b.sub}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[12%] z-[77] flex justify-center px-4">
        <AnimatePresence>
          {banners.map((b) => (
            <motion.div
              key={b.id}
              className="font-display flex items-center gap-4 rounded-[1.6rem] px-8 py-4 text-white"
              style={{
                background: `linear-gradient(135deg, ${b.color}, #7c3aed)`,
                boxShadow: '0 .4rem 0 #3b0f8a, 0 1.2rem 2.5rem rgb(0 0 0 / .45), inset 0 2px 0 rgb(255 255 255 / .4)',
              }}
              initial={{ y: -120, scale: 0.6, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -60, scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            >
              <span className="text-[3.2rem] leading-none" aria-hidden>
                {b.emoji}
              </span>
              <div>
                <div className="text-[2.6rem] leading-none">{b.title}</div>
                {b.sub && <div className="mt-1 font-sans text-[1.15rem] font-extrabold text-white/90">{b.sub}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[78] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_.3rem_0_#d9ceff,0_.8rem_1.6rem_rgb(0_0_0/.35)]"
              initial={{ x: 80, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sun to-bubble text-[1.7rem]" aria-hidden>
                {t.icon}
              </span>
              <div className="min-w-0">
                <div className="font-display text-[1.2rem] leading-tight text-grape-deep">{t.title}</div>
                {t.sub && <div className="text-[0.95rem] font-bold text-ink-soft">{t.sub}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {reward && (
          <motion.div
            key={reward.id}
            className="fixed inset-0 z-[79] grid place-items-center bg-[#0b0520]/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReward(null)}
          >
            <div className="flex flex-col items-center gap-5 px-4 text-center">
              <motion.div
                className="font-display text-[2.6rem] leading-none text-white title-3d"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                🃏 {reward.title}
              </motion.div>
              <motion.div
                initial={{ rotateY: 180, scale: 0.4 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 14 }}
                style={{ transformPerspective: 900 }}
              >
                <PowerCard id={reward.card} size="lg" />
              </motion.div>
              {reward.sub && <div className="font-extrabold text-[1.3rem] text-white/90">{reward.sub}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FxCtx.Provider>
  )
}
