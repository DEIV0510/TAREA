import { motion } from 'framer-motion'
import { Home as HomeIcon, RotateCcw, Users } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { CountUp, TeamAvatar } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { Mascot } from '../components/Mascot'
import { BADGES } from '../data/powers'
import { TEAM_COLORS } from '../data/teams'
import { ranking } from '../game/engine'
import { useGame } from '../game/GameContext'
import { creativityLabel } from '../game/scoring'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'
import type { Team } from '../types'

let revealedFor = -1

function creativityOf(t: Team): number {
  const vals = [t.l3?.creativity, t.l2?.index].filter((v): v is number => typeof v === 'number')
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
}

export function Final({ onHome, onTeams }: { onHome: () => void; onTeams: () => void }) {
  const { state, dispatch } = useGame()
  const fx = useFx()
  const list = ranking(state.teams)
  const [phase, setPhase] = useState<'suspense' | 'reveal'>(revealedFor === state.seq ? 'reveal' : 'suspense')

  useEffect(() => {
    if (phase !== 'suspense') return
    sfx.drumroll(2)
    const t = window.setTimeout(() => {
      revealedFor = state.seq
      setPhase('reveal')
    }, 2300)
    return () => window.clearTimeout(t)
  }, [phase, state.seq])

  useEffect(() => {
    if (phase !== 'reveal') return
    sfx.victory()
    fx.flash('gold')
    fx.confetti('fireworks')
    fx.confetti('sides')
    const ids = [1, 2, 3].map((i) => window.setTimeout(() => fx.confetti(i % 2 ? 'big' : 'sides'), i * 2200))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [phase, fx])

  const winner = list[0]
  if (!winner) return null

  if (phase === 'suspense') {
    return (
      <motion.section className="flex min-h-full flex-col items-center justify-center gap-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="w-[min(50vw,15rem)]">
          <Mascot mood="wow" className="w-full" />
        </div>
        <p className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">
          Y la Agencia Maestra de la Publicidad es
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
            …
          </motion.span>
        </p>
      </motion.section>
    )
  }

  const c = TEAM_COLORS[winner.color]
  const creativity = creativityOf(winner)
  const stats: [string, string, ReactNode][] = [
    ['⭐', 'Puntos finales', <CountUp key="p" to={winner.points} duration={1.6} />],
    ['✅', 'Retos superados', `${winner.correct}/${winner.played}`],
    ['🔥', 'Mayor combo', `x${winner.maxStreak}`],
    ['🪙', 'Monedas ganadas', `${winner.coinsEarned}`],
    ['🎨', `Creatividad · ${creativityLabel(creativity)}`, `${creativity}/100`],
  ]

  return (
    <motion.section className="flex min-h-full flex-col items-center gap-5 py-2 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.h1
        className="font-display text-gradient-sun title-drop text-[clamp(3.4rem,9vw,7rem)] leading-none"
        initial={{ scale: 0.2, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        🏆 CAMPEONES
      </motion.h1>

      <motion.div
        className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] p-6"
        style={{ background: `linear-gradient(160deg, ${c.a}, ${c.b})`, boxShadow: `0 .5rem 0 ${c.lip}, 0 1.6rem 3rem rgb(0 0 0 / .45)` }}
        initial={{ y: 80, scale: 0.7, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.15 }}
      >
        <div
          aria-hidden
          className="anim-spin-slow absolute left-1/2 top-1/2 size-[160%] -translate-x-1/2 -translate-y-1/2 opacity-25"
          style={{ background: 'repeating-conic-gradient(from 0deg, #fff 0deg 10deg, transparent 10deg 26deg)', borderRadius: '50%' }}
        />
        <div className="relative flex flex-col items-center gap-4 md:flex-row md:text-left">
          <div className="relative w-[min(46vw,13rem)] shrink-0">
            <Mascot mood="happy" crown className="w-full drop-shadow-[0_1rem_1.2rem_rgb(0_0_0/.35)]" />
          </div>
          <div className="min-w-0 flex-1" style={{ color: c.text }}>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <TeamAvatar team={winner} size={4.4} ring />
              <span className="font-display rounded-full bg-white/90 px-3 py-1 text-[1.2rem] text-ink">🥇 1.er LUGAR</span>
            </div>
            <div className="font-display mt-2 text-[clamp(2.8rem,6vw,4.6rem)] leading-none drop-shadow-[0_4px_0_rgb(0_0_0/.25)]">{winner.name.toUpperCase()}</div>
            <div className="font-display mt-1 text-[clamp(1.2rem,2.4vw,1.7rem)]">“LA AGENCIA MAESTRA DE LA PUBLICIDAD”</div>
            {winner.members && <div className="mt-1 text-[1.05rem] font-extrabold opacity-90">{winner.members}</div>}
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {stats.map(([e, k, v], i) => (
            <motion.div
              key={k}
              className="rounded-2xl bg-white/92 px-2 py-2.5 text-ink"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <div className="text-[1.5rem] leading-none" aria-hidden>
                {e}
              </div>
              <div className="font-display mt-1 text-[1.35rem] leading-tight">{v}</div>
              <div className="text-[0.75rem] font-black uppercase tracking-wide text-ink-soft">{k}</div>
            </motion.div>
          ))}
        </div>

        {winner.badges.length > 0 && (
          <div className="relative mt-3 flex flex-wrap justify-center gap-1.5">
            {winner.badges.map((b) => (
              <span key={b} className="chip bg-white/25 text-[0.95rem] text-white" title={BADGES[b].desc}>
                {BADGES[b].emoji} {BADGES[b].name}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {list.length > 1 && (
        <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">
          {list.slice(1, 3).map((t, i) => (
            <motion.div
              key={t.id}
              className="card-white flex items-center gap-3 p-3 text-left"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.15 }}
            >
              <span className="font-display text-[2.6rem]">{i === 0 ? '🥈' : '🥉'}</span>
              <TeamAvatar team={t} size={3} />
              <div className="min-w-0 flex-1">
                <div className="text-[0.8rem] font-black uppercase tracking-wider text-ink-soft">{i === 0 ? 'Segundo lugar' : 'Tercer lugar'}</div>
                <div className="truncate text-[1.35rem] font-black">{t.name}</div>
              </div>
              <div className="font-display text-[1.7rem] text-grape-deep">{t.points.toLocaleString('es-CO')}</div>
            </motion.div>
          ))}
        </div>
      )}
      {list.length > 3 && (
        <ol className="flex flex-wrap justify-center gap-2" start={4}>
          {list.slice(3).map((t, i) => (
            <li key={t.id} className="chip bg-white/12 text-[1rem]">
              #{i + 4} {t.emoji} {t.name} · {t.points.toLocaleString('es-CO')}
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-1">
        <CandyButton tone="sun" className="shine text-[1.9rem]" onClick={() => dispatch({ type: 'startGame' })}>
          <RotateCcw className="size-7" strokeWidth={3} /> JUGAR DE NUEVO
        </CandyButton>
        <CandyButton tone="bubble" className="text-[1.3rem]" onClick={onTeams}>
          <Users className="size-6" /> Nuevos equipos
        </CandyButton>
        <CandyButton tone="ghost" className="text-[1.3rem]" onClick={onHome}>
          <HomeIcon className="size-6" /> Inicio
        </CandyButton>
      </div>
    </motion.section>
  )
}
