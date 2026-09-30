import { AnimatePresence, motion } from 'framer-motion'
import { FastForward, GraduationCap, Pause, Play, RotateCcw, SkipForward, Trash2, Trophy, Users, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { HAND_MAX, POWERS, POWER_IDS } from '../data/powers'
import { ranking } from '../game/engine'
import { useGame, useUI } from '../game/GameContext'
import { sfx } from '../lib/sound'
import type { Pace } from '../types'
import { TeamAvatar, fmt } from './bits'
import { useConfirm } from './Confirm'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-[#f6f2ff] p-3">
      <h3 className="font-display mb-2 text-[1.2rem] text-grape-deep">{title}</h3>
      {children}
    </section>
  )
}

function Btn({ onClick, children, tone = 'plain', disabled }: { onClick: () => void; children: ReactNode; tone?: 'plain' | 'primary' | 'danger'; disabled?: boolean }) {
  const cls =
    tone === 'primary'
      ? 'bg-grape text-white shadow-[0_.2rem_0_#4c1d95] hover:brightness-110'
      : tone === 'danger'
        ? 'bg-[#ffe1e7] text-[#9f1239] hover:bg-[#ffd0da]'
        : 'bg-white text-ink shadow-[0_.18rem_0_#d9ceff] hover:bg-[#fdfbff]'
  return (
    <button
      onClick={() => {
        sfx.click()
        onClick()
      }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[0.95rem] font-black transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  )
}

export function TeacherPanel({ onTeams, onRanking, onGame }: { onTeams: () => void; onRanking: () => void; onGame: () => void }) {
  const { state, dispatch } = useGame()
  const { teacherOpen, setTeacherOpen, paused, setPaused, prefs, setPrefs } = useUI()
  const [step, setStep] = useState(50)
  const [custom, setCustom] = useState<Record<string, string>>({})
  const close = () => setTeacherOpen(false)
  const playing = state.status === 'playing'
  const inTurn = playing && (state.stage === 'turnIntro' || state.stage === 'play')
  const canSkip = inTurn && state.level === 1

  // Abrir el modo profesor congela el reloj; al cerrarlo sigue (salvo que el profe lo haya pausado a propósito).
  const autoPaused = useRef(false)
  useEffect(() => {
    if (teacherOpen && inTurn && !paused) {
      setPaused(true)
      autoPaused.current = true
    }
    if (!teacherOpen && autoPaused.current) {
      autoPaused.current = false
      setPaused(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherOpen])

  useEffect(() => {
    if (!teacherOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const ask = useConfirm()
  const confirmDo = async (msg: string, fn: () => void, danger = true) => {
    if (await ask(msg, { danger })) fn()
  }

  return (
    <AnimatePresence>
      {teacherOpen && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Cerrar modo profesor" className="absolute inset-0 cursor-default bg-[#0b0520]/60" onClick={close} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-title"
            className="absolute right-0 top-0 flex h-full w-[min(34rem,100vw)] flex-col bg-white text-ink shadow-[-1rem_0_3rem_rgb(0_0_0/.4)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-sun to-[#ff9f1c] px-5 py-4">
              <GraduationCap className="size-8" />
              <h2 id="teacher-title" className="font-display flex-1 text-[1.8rem] leading-none">
                MODO PROFESOR
              </h2>
              <button onClick={close} aria-label="Cerrar" className="grid size-11 place-items-center rounded-full bg-white/40 hover:bg-white/60">
                <X className="size-6" strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <Section title="🎮 Partida">
                {inTurn && <p className="mb-2 text-[0.85rem] font-extrabold text-ink-soft">⏸️ El reloj se detiene mientras este panel está abierto.</p>}
                <div className="grid grid-cols-2 gap-2">
                  <Btn
                    onClick={() => {
                      autoPaused.current = false
                      setPaused(!paused)
                    }}
                    disabled={!inTurn}
                    tone={paused ? 'primary' : 'plain'}
                  >
                    {paused ? <Play className="size-4" /> : <Pause className="size-4" />} {paused ? 'Reanudar tiempo' : 'Pausar tiempo'}
                  </Btn>
                  <Btn
                    onClick={() => {
                      setPaused(false)
                      dispatch({ type: 'skip' })
                    }}
                    disabled={!canSkip}
                  >
                    <SkipForward className="size-4" /> Saltar pregunta
                  </Btn>
                  <Btn
                    onClick={() =>
                      confirmDo(state.level === 3 ? '¿Terminar el juego e ir a la Gran Final?' : `¿Terminar el Nivel ${state.level} ahora?`, () => {
                        setPaused(false)
                        dispatch({ type: 'endLevel' })
                        close()
                      })
                    }
                    disabled={!playing || state.stage === 'levelComplete' || state.stage === 'shop'}
                  >
                    <FastForward className="size-4" /> Avanzar de nivel
                  </Btn>
                  <Btn
                    onClick={() => {
                      close()
                      onTeams()
                    }}
                  >
                    <Users className="size-4" /> {state.teams.length ? 'Editar equipos' : 'Crear equipos'}
                  </Btn>
                  <Btn
                    tone="danger"
                    onClick={() =>
                      confirmDo('¿Reiniciar la partida con los mismos equipos? Se borran los puntos.', () => {
                        setPaused(false)
                        dispatch({ type: 'startGame' })
                        close()
                        onGame()
                      })
                    }
                    disabled={state.teams.length < 2}
                  >
                    <RotateCcw className="size-4" /> Reiniciar partida
                  </Btn>
                  <Btn
                    tone="danger"
                    onClick={() =>
                      confirmDo('¿Borrar todo (equipos y puntos) y empezar desde cero?', () => {
                        setPaused(false)
                        dispatch({ type: 'newGame' })
                        close()
                        onTeams()
                      })
                    }
                  >
                    <Trash2 className="size-4" /> Borrar todo
                  </Btn>
                </div>
              </Section>

              <Section title="⭐ Puntos, monedas y cartas">
                {state.teams.length === 0 ? (
                  <p className="font-bold text-ink-soft">Primero creen los equipos.</p>
                ) : (
                  <>
                    <div className="mb-2 flex items-center gap-2 text-[0.9rem] font-extrabold text-ink-soft">
                      Paso:
                      {[10, 50, 100].map((n) => (
                        <button
                          key={n}
                          onClick={() => setStep(n)}
                          className={`rounded-lg px-2.5 py-1 font-black ${step === n ? 'bg-grape text-white' : 'bg-white text-ink'}`}
                          aria-pressed={step === n}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {ranking(state.teams).map((t) => (
                        <li key={t.id} className="rounded-xl bg-white p-2.5 shadow-[0_.15rem_0_#e6defc]">
                          <div className="flex items-center gap-2">
                            <TeamAvatar team={t} size={2.2} />
                            <span className="min-w-0 flex-1 truncate font-black">{t.name}</span>
                            <span className="font-display text-[1.3rem] text-grape-deep">{fmt(t.points)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <Btn onClick={() => dispatch({ type: 'adjust', teamId: t.id, points: -step })}>−{step}</Btn>
                            <Btn tone="primary" onClick={() => dispatch({ type: 'adjust', teamId: t.id, points: step })}>
                              +{step}
                            </Btn>
                            <form
                              className="flex items-center gap-1"
                              onSubmit={(e) => {
                                e.preventDefault()
                                const n = parseInt(custom[t.id] ?? '', 10)
                                if (!Number.isFinite(n) || n === 0) return
                                dispatch({ type: 'adjust', teamId: t.id, points: n })
                                setCustom((c) => ({ ...c, [t.id]: '' }))
                              }}
                            >
                              <label className="sr-only" htmlFor={`pts-${t.id}`}>
                                Puntos para {t.name}
                              </label>
                              <input
                                id={`pts-${t.id}`}
                                inputMode="numeric"
                                placeholder="±pts"
                                value={custom[t.id] ?? ''}
                                onChange={(e) => setCustom((c) => ({ ...c, [t.id]: e.target.value.replace(/[^\d-]/g, '') }))}
                                className="w-20 rounded-lg border-2 border-[#e6defc] px-2 py-1.5 text-[0.95rem] font-black outline-none focus:border-grape"
                              />
                              <button type="submit" className="rounded-lg bg-mint px-2.5 py-1.5 text-[0.9rem] font-black text-ink">
                                OK
                              </button>
                            </form>
                            <span className="ml-auto flex items-center gap-1 text-[0.9rem] font-black">
                              🪙 {t.coins}
                              <button onClick={() => dispatch({ type: 'adjust', teamId: t.id, coins: -10 })} className="rounded-md bg-[#f1ecff] px-1.5" aria-label={`Quitar 10 monedas a ${t.name}`}>
                                −
                              </button>
                              <button onClick={() => dispatch({ type: 'adjust', teamId: t.id, coins: 10 })} className="rounded-md bg-[#f1ecff] px-1.5" aria-label={`Dar 10 monedas a ${t.name}`}>
                                +
                              </button>
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[0.85rem] font-extrabold text-ink-soft">
                            Dar carta:
                            {POWER_IDS.map((id) => (
                              <button
                                key={id}
                                disabled={t.cards.length >= HAND_MAX}
                                onClick={() => dispatch({ type: 'giveCard', teamId: t.id, card: id })}
                                title={POWERS[id].name}
                                aria-label={`Dar ${POWERS[id].name} a ${t.name}`}
                                className="rounded-md bg-[#f6f2ff] px-1.5 py-0.5 text-[1.1rem] hover:bg-[#ede5ff] disabled:opacity-30"
                              >
                                {POWERS[id].emoji}
                              </button>
                            ))}
                            <span className="ml-1">({t.cards.length}/{HAND_MAX})</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Section>

              <Section title="🏆 Ranking">
                <div className="grid grid-cols-2 gap-2">
                  <Btn
                    onClick={() => {
                      close()
                      onRanking()
                    }}
                  >
                    <Trophy className="size-4" /> Ver ranking
                  </Btn>
                  <Btn
                    tone="danger"
                    disabled={!state.teams.length}
                    onClick={() => confirmDo('¿Poner en cero puntos, monedas, combos y cartas de todos los equipos?', () => dispatch({ type: 'resetRanking' }))}
                  >
                    <RotateCcw className="size-4" /> Reiniciar ranking
                  </Btn>
                </div>
              </Section>

              <Section title="⚙️ Ajustes">
                <div className="space-y-2">
                  <label className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 font-black">
                    🔊 Sonido
                    <input type="checkbox" className="size-6 accent-[#7c3aed]" checked={prefs.sound} onChange={(e) => setPrefs({ sound: e.target.checked })} />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 font-black">
                    <span>
                      🧘 Animaciones suaves
                      <span className="block text-[0.8rem] font-bold text-ink-soft">Menos movimiento y confeti (para equipos lentos)</span>
                    </span>
                    <input type="checkbox" className="size-6 accent-[#7c3aed]" checked={prefs.calm} onChange={(e) => setPrefs({ calm: e.target.checked })} />
                  </label>
                  <div className="rounded-xl bg-white px-3 py-2 font-black">
                    ⏱️ Ritmo
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(
                        [
                          ['normal', 'Normal'],
                          ['relaxed', 'Relajado'],
                          ['unlimited', 'Sin reloj'],
                        ] as [Pace, string][]
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          onClick={() => dispatch({ type: 'setSettings', settings: { pace: id } })}
                          aria-pressed={state.settings.pace === id}
                          className={`rounded-lg px-3 py-1.5 text-[0.9rem] font-black ${state.settings.pace === id ? 'bg-grape text-white' : 'bg-[#f1ecff] text-ink'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-[0.8rem] font-bold text-ink-soft">Se aplica desde el siguiente turno.</p>
                  </div>
                </div>
              </Section>

              <p className="px-1 text-[0.8rem] font-bold text-ink-soft">
                💾 Todo se guarda solo en este navegador: si recargan la página, la partida sigue donde iba. Atajos: Enter = continuar · 1-4 o A-D = opciones · M/R = mito o realidad · ← → = clasificar.
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
