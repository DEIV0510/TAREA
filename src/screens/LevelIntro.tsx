import { motion } from 'framer-motion'
import { Check, Lock, Play } from 'lucide-react'
import { useEffect } from 'react'
import { CandyButton } from '../components/CandyButton'
import { Mascot } from '../components/Mascot'
import { LEVELS } from '../data/levels'
import { useGame } from '../game/GameContext'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'
import type { Level } from '../types'

let lastAnnounced = ''

export function LevelMap({ current, className = '' }: { current: Level; className?: string }) {
  return (
    <ol className={`flex items-center justify-center gap-0 ${className}`} aria-label="Mapa de niveles">
      {([1, 2, 3] as Level[]).map((n, i) => {
        const L = LEVELS[n]
        const done = n < current
        const now = n === current
        return (
          <li key={n} className="flex items-center">
            {i > 0 && (
              <div className="h-2 w-[clamp(2rem,7vw,6rem)] rounded-full" style={{ background: n <= current ? 'linear-gradient(90deg,#ffd23f,#ff4fa3)' : 'rgb(255 255 255 / .15)' }} aria-hidden />
            )}
            <div className="relative flex flex-col items-center">
              {now && <span className="absolute inset-0 m-auto size-[3.1rem] rounded-full bg-sun/60" style={{ animation: 'pulse-ring 1.6s ease-out infinite' }} aria-hidden />}
              <motion.div
                className="relative grid size-[3.1rem] place-items-center rounded-full text-[1.5rem]"
                style={{
                  background: done || now ? `linear-gradient(160deg, ${L.a}, ${L.b})` : 'rgb(255 255 255 / .12)',
                  boxShadow: done || now ? '0 .3rem 0 rgb(0 0 0 / .35), inset 0 2px 0 rgb(255 255 255 / .4)' : 'inset 0 0 0 2px rgb(255 255 255 / .2)',
                }}
                initial={now ? { scale: 0.3, rotate: -30 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.2 }}
              >
                {done ? <Check className="size-9 text-white" strokeWidth={4} /> : now ? <span aria-hidden>{L.emoji}</span> : <Lock className="size-7 text-white/50" strokeWidth={3} />}
              </motion.div>
              <span className={`mt-1.5 text-[0.8rem] font-black uppercase tracking-wider ${now ? 'text-sun' : 'text-white/60'}`}>Nivel {n}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function LevelIntro() {
  const { state, dispatch } = useGame()
  const fx = useFx()
  const L = LEVELS[state.level]

  useEffect(() => {
    const key = `${state.seq}-${state.level}`
    if (lastAnnounced === key) return
    lastAnnounced = key
    if (state.level > 1) {
      sfx.levelUp()
      window.setTimeout(() => fx.confetti('sides'), 250)
    } else sfx.whoosh()
  }, [state.level, state.seq, fx])

  const begin = () => dispatch({ type: 'beginLevel' })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) begin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <motion.section
      className="flex min-h-full flex-col items-center justify-center gap-2.5 py-1 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.15 } }}
    >
      <LevelMap current={state.level} />

      {state.level > 1 && (
        <motion.div
          className="chip bg-mint text-[1.1rem] text-ink shadow-[0_.25rem_0_#05573a]"
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 380, damping: 12, delay: 0.35 }}
        >
          🔓 ¡NIVEL {state.level} DESBLOQUEADO!
        </motion.div>
      )}

      <div className="flex w-full max-w-5xl flex-col items-center gap-4 md:flex-row md:gap-8">
        <motion.div
          className="w-[min(32vw,9rem)] shrink-0"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Mascot mood={state.level === 3 ? 'wow' : 'happy'} crown={state.level === 3} className="w-full drop-shadow-[0_1rem_1.4rem_rgb(0_0_0/.35)]" />
        </motion.div>
        <div className="flex-1 text-center md:text-left">
          <motion.div
            className="font-display inline-block rounded-2xl px-4 py-1 text-[1.3rem] text-white"
            style={{ background: `linear-gradient(90deg, ${L.a}, ${L.b})`, boxShadow: '0 .25rem 0 rgb(0 0 0 / .3)' }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            NIVEL {state.level}
          </motion.div>
          <motion.h1
            className="font-display title-3d mt-1.5 text-[clamp(2.2rem,4vw,3.3rem)] leading-[0.95]"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
          >
            <span aria-hidden className="mr-2 inline-block text-[0.8em]">{L.emoji}</span>
            {L.title}
          </motion.h1>
          <p className="font-display mt-1 text-[1.6rem] text-sun">“{L.theme}”</p>
          <ul className="mt-2 space-y-1.5">
            {L.bullets.map((b, i) => (
              <motion.li
                key={b}
                className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-1.5 text-left text-[1.05rem] font-extrabold leading-snug text-white"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="font-display grid size-8 shrink-0 place-items-center rounded-full bg-sun text-[1.1rem] text-ink">{i + 1}</span>
                {b}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <CandyButton tone="sun" onClick={begin} className="shine text-[1.7rem]">
        <Play className="size-8" fill="currentColor" /> ¡EMPEZAR NIVEL {state.level}!
      </CandyButton>
    </motion.section>
  )
}
