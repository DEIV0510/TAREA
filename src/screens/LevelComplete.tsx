import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { CountUp, TeamAvatar } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { Mascot } from '../components/Mascot'
import { LEVELS } from '../data/levels'
import { TEAM_COLORS } from '../data/teams'
import { ranking } from '../game/engine'
import { useGame } from '../game/GameContext'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'

let celebrated = ''

export function LevelComplete() {
  const { state, dispatch } = useGame()
  const fx = useFx()
  const L = LEVELS[state.level]
  const list = ranking(state.teams)
  const gains = list.map((t) => ({
    t,
    pts: t.points - (state.levelSnap[t.id]?.points ?? 0),
    coins: Math.max(0, t.coins - (state.levelSnap[t.id]?.coins ?? 0)),
    combo: state.levelMaxCombo[t.id] ?? 0,
  }))
  const mvp = gains.slice().sort((a, b) => b.pts - a.pts)[0]

  useEffect(() => {
    const key = `${state.seq}-${state.level}`
    if (celebrated === key) return
    celebrated = key
    sfx.levelUp()
    fx.confetti('sides')
    window.setTimeout(() => fx.confetti('big'), 600)
  }, [state.seq, state.level, fx])

  const goNext = () => dispatch({ type: 'nextLevel', rand: Math.random() })
  const goShop = () => dispatch({ type: 'toShop', rand: Math.random() })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <motion.section className="flex min-h-full flex-col items-center gap-3 py-1 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="flex w-full max-w-5xl flex-col items-center gap-3 md:flex-row md:gap-5 md:text-left">
        <div className="w-[min(30vw,6.5rem)] shrink-0">
          <Mascot mood="happy" className="w-full" />
        </div>
        <div>
          <motion.h1
            className="font-display title-3d text-[clamp(2.2rem,4.4vw,3.6rem)] leading-none"
            initial={{ scale: 0.3, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 11 }}
          >
            🎉 NIVEL {state.level} COMPLETADO
          </motion.h1>
          <p className="font-display mt-1 text-[1.5rem] text-sun">“{L.done}”</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1.5 md:ml-auto">
          <CandyButton tone="sun" className="shine text-[1.6rem]" onClick={goNext}>
            SIGUIENTE NIVEL <ArrowRight className="size-7" strokeWidth={3} />
          </CandyButton>
          <button onClick={goShop} className="rounded-full bg-white/12 px-3 py-1 text-[0.9rem] font-extrabold text-white/90 hover:bg-white/20">
            🛒 Tienda de poderes (opcional)
          </button>
        </div>
      </div>

      {mvp && mvp.pts > 0 && (
        <motion.div className="chip bg-white text-[1.1rem] text-ink" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          ⭐ Agencia del nivel: {mvp.t.emoji} {mvp.t.name} (+{mvp.pts.toLocaleString('es-CO')})
        </motion.div>
      )}

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="w-full min-w-[40rem] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-[0.85rem] font-black uppercase tracking-wider text-white/75">
              <th className="px-3">Posición actual</th>
              <th className="px-3">Agencia</th>
              <th className="px-3 text-right">Puntos obtenidos</th>
              <th className="px-3 text-right">Monedas obtenidas</th>
              <th className="px-3 text-right">Combo máximo</th>
              <th className="px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {gains.map(({ t, pts, coins, combo }, i) => {
              const c = TEAM_COLORS[t.color]
              return (
                <motion.tr
                  key={t.id}
                  className="bg-white text-ink"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <td className="rounded-l-2xl px-3 py-1.5">
                    <span className="font-display text-[1.6rem]">{i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-3">
                      <TeamAvatar team={t} size={2.3} />
                      <span className="text-[1.2rem] font-black leading-tight">{t.name}</span>
                    </span>
                  </td>
                  <td className="font-display px-3 py-2 text-right text-[1.6rem]" style={{ color: c.b }}>
                    +<CountUp to={pts} delay={0.4 + i * 0.1} />
                  </td>
                  <td className="font-display px-3 py-2 text-right text-[1.4rem] text-[#b7791f]">+{coins} 🪙</td>
                  <td className="font-display px-3 py-2 text-right text-[1.4rem] text-[#ea580c]">🔥 x{combo}</td>
                  <td className="font-display rounded-r-2xl px-3 py-2 text-right text-[1.6rem] text-grape-deep">
                    <CountUp to={t.points} delay={0.5 + i * 0.1} />
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </motion.section>
  )
}
