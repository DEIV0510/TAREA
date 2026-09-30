import { AnimatePresence, motion } from 'framer-motion'
import { Rocket, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PowerCard, TeamAvatar, fmt } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { L1_BY_ID, L1_TYPES } from '../data/level1'
import { LEVELS } from '../data/levels'
import { POWERS } from '../data/powers'
import { TEAM_COLORS } from '../data/teams'
import { currentTeam, paceFactor, questionIdFor, roundsL1 } from '../game/engine'
import { useGame } from '../game/GameContext'
import { sfx } from '../lib/sound'
import type { Mods, PowerId } from '../types'

export function TurnIntro() {
  const { state, dispatch } = useGame()
  const team = currentTeam(state)
  const [count, setCount] = useState<number | null>(null)
  const [stealOpen, setStealOpen] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  useEffect(() => {
    sfx.whoosh()
  }, [])

  const go = () => {
    if (count !== null) return
    const steps = [3, 2, 1, 0]
    steps.forEach((n, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setCount(n)
          sfx.countdown(n === 0)
        }, i * 520),
      )
    })
    timers.current.push(window.setTimeout(() => dispatch({ type: 'startTurn' }), steps.length * 520 + 150))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !stealOpen && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        go()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!team) return null
  const c = TEAM_COLORS[team.color]
  const nextId = state.order[state.turn + 1]
  const nextTeam = state.teams.find((t) => t.id === nextId)
  const L = LEVELS[state.level]
  const qid = questionIdFor(state, team)
  const q = qid ? L1_BY_ID[qid] : undefined
  const T = q ? L1_TYPES[q.type] : null

  const usable = (id: PowerId): { ok: boolean; why?: string } => {
    if (POWERS[id].passive) return { ok: false, why: 'Se activa sola' }
    if (id === 'time' && paceFactor(state.settings.pace) === null) return { ok: false, why: 'Juego sin reloj' }
    if (id !== 'steal' && state.mods[id as keyof Mods]) return { ok: false, why: 'Ya está activa' }
    if (id === 'steal' && state.teams.length < 2) return { ok: false, why: 'Sin rivales' }
    return { ok: true }
  }

  const activate = (id: PowerId) => {
    if (id === 'steal') {
      setStealOpen(true)
      return
    }
    dispatch({ type: 'activate', card: id })
  }

  const activeMods = (Object.keys(state.mods) as (keyof Mods)[]).filter((k) => state.mods[k])

  return (
    <motion.section
      className="relative flex min-h-full flex-col items-center justify-center gap-3 py-2 text-center"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="chip bg-white/12 text-[1rem] text-white ring-1 ring-white/20">
          {L.emoji} Nivel {state.level}
        </span>
        {T && (
          <span className="chip bg-white text-[1rem] text-ink">
            Reto {state.round + 1} de {roundsL1(state)} · {T.emoji} {T.name}
          </span>
        )}
      </div>

      <motion.div
        className="flex flex-col items-center gap-4 sm:flex-row sm:text-left"
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      >
        <TeamAvatar team={team} size={6.2} ring />
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <p className="font-display text-[1.4rem] leading-none tracking-wide text-white/85">TURNO DE</p>
          <h2 className="font-display text-[clamp(2.6rem,5.4vw,4.4rem)] leading-none" style={{ color: c.a, textShadow: `0 .06em 0 ${c.lip}, 0 .14em .3em rgb(0 0 0 / .5)` }}>
            {team.name}
          </h2>
          {team.members && <p className="max-w-2xl text-[1.1rem] font-extrabold text-white/85">{team.members}</p>}
          <div className="flex flex-wrap justify-center gap-2 text-[1rem]">
            <span className="chip bg-white/12">⭐ {fmt(team.points)} pts</span>
            <span className="chip bg-white/12">🪙 {team.coins}</span>
            <span className="chip bg-white/12">🔥 COMBO x{team.streak}</span>
          </div>
        </div>
      </motion.div>

      {T && <p className="text-[1.25rem] font-extrabold text-sun">{T.hint}</p>}

      {/* cartas */}
      <div className="mt-1 w-full max-w-4xl">
        {team.cards.length > 0 || activeMods.length > 0 ? (
          <>
            <p className="mb-2 text-[1rem] font-black uppercase tracking-wider text-white/80">🃏 Cartas de poder · toquen una para usarla</p>
            <div className="flex flex-wrap items-end justify-center gap-3">
              {activeMods.map((m) => (
                <motion.div key={`on-${m}`} initial={{ y: -20, scale: 0.8 }} animate={{ y: 0, scale: 1 }} className="flex flex-col items-center gap-1.5">
                  <PowerCard id={m} size="sm" active />
                  <button
                    onClick={() => dispatch({ type: 'deactivate', card: m })}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[0.8rem] font-extrabold hover:bg-white/25"
                  >
                    <Undo2 className="size-3.5" /> Activa · deshacer
                  </button>
                </motion.div>
              ))}
              {team.cards.map((id, i) => {
                const u = usable(id)
                return (
                  <motion.button
                    key={`${id}-${i}`}
                    onClick={() => u.ok && activate(id)}
                    disabled={!u.ok}
                    whileHover={u.ok ? { y: -10, rotate: -2 } : undefined}
                    whileTap={u.ok ? { scale: 0.92 } : undefined}
                    className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                    aria-label={`${POWERS[id].name}: ${POWERS[id].desc}${u.ok ? '' : ` (${u.why})`}`}
                  >
                    <PowerCard id={id} size="sm" dim={!u.ok && id !== 'shield'} />
                    <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[0.8rem] font-extrabold">{u.ok ? 'Usar' : u.why}</span>
                  </motion.button>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-[1rem] font-bold text-white/65">Aún no tienen cartas de poder: se ganan con combos x3 y en la tienda.</p>
        )}
      </div>

      <CandyButton tone="sun" onClick={go} className="shine mt-2 text-[2.3rem]" sound={false}>
        <Rocket className="size-9" strokeWidth={2.4} /> ¡LISTOS!
      </CandyButton>
      {nextTeam && nextTeam.id !== team.id && (
        <p className="text-[0.95rem] font-extrabold text-white/60">
          Después: {nextTeam.emoji} {nextTeam.name}
        </p>
      )}

      {/* elegir víctima del robo */}
      <AnimatePresence>
        {stealOpen && (
          <motion.div className="fixed inset-0 z-[65] grid place-items-center bg-[#0b0520]/75 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="card-white w-full max-w-xl p-6" initial={{ scale: 0.85 }} animate={{ scale: 1 }}>
              <h3 className="font-display text-[2rem] text-bubble-deep">🎯 ¿A quién le roban?</h3>
              <p className="mb-4 font-bold text-ink-soft">Le quitan hasta 150 puntos. Si tiene 🛡️ escudo, el robo se bloquea.</p>
              <div className="grid gap-2">
                {state.teams
                  .filter((t) => t.id !== team.id)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setStealOpen(false)
                        dispatch({ type: 'activate', card: 'steal', targetId: t.id })
                      }}
                      className="flex items-center gap-3 rounded-2xl bg-[#f5f1ff] px-3 py-2.5 text-left transition hover:bg-[#ffe4f1] hover:ring-2 hover:ring-bubble"
                    >
                      <TeamAvatar team={t} size={2.6} />
                      <span className="flex-1 text-[1.2rem] font-black">{t.name}</span>
                      {t.cards.includes('shield') && <span title="Tiene escudo">🛡️</span>}
                      <span className="font-display text-[1.3rem] text-grape-deep">{fmt(t.points)}</span>
                    </button>
                  ))}
              </div>
              <button onClick={() => setStealOpen(false)} className="mt-4 w-full rounded-2xl py-2 font-extrabold text-ink-soft hover:bg-black/5">
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* cuenta regresiva */}
      <AnimatePresence>
        {count !== null && (
          <motion.div className="fixed inset-0 z-[66] grid place-items-center bg-[#0b0520]/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={count}
                className="font-display title-3d text-[clamp(8rem,22vw,16rem)] leading-none"
                style={{ color: count === 0 ? '#2ee59d' : '#ffd23f', WebkitTextStroke: '4px #fff' }}
                initial={{ scale: 2.4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                {count === 0 ? '¡YA!' : count}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
