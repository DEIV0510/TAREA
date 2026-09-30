import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus, RotateCcw, Sparkles, Swords, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { TeamAvatar } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { useConfirm } from '../components/Confirm'
import { AVATARS, COLOR_KEYS, MAX_TEAMS, MIN_TEAMS, PHOTO_AVATARS, TEAM_COLORS, TEAM_PRESETS } from '../data/teams'
import { makeTeam, roundsFor } from '../game/engine'
import { useGame } from '../game/GameContext'
import { sfx } from '../lib/sound'
import type { ColorKey, Duration, Pace, Team } from '../types'

type Draft = Pick<Team, 'id' | 'name' | 'members' | 'emoji' | 'color' | 'photo'>

function presetDrafts(n: number): Draft[] {
  return TEAM_PRESETS.slice(0, n).map((p) => {
    const t = makeTeam(p)
    return { id: t.id, name: t.name, members: '', emoji: t.emoji, color: t.color, photo: t.photo ?? null }
  })
}

const PACES: { id: Pace; label: string; hint: string }[] = [
  { id: 'normal', label: 'Normal', hint: '15–35 s por reto' },
  { id: 'relaxed', label: 'Relajado', hint: '+50% de tiempo' },
  { id: 'unlimited', label: 'Sin reloj', hint: 'El profe decide' },
]
const DURATIONS: { id: Duration; label: string; hint: string }[] = [{ id: 10, label: 'Máximo 10 minutos', hint: 'Hay un reloj arriba; si llega a cero, pasamos a la Gran Final' }]

export function TeamsSetup({ onBack, onStarted, onSaved }: { onBack: () => void; onStarted: () => void; onSaved: () => void }) {
  const { state, dispatch } = useGame()
  const playing = state.status === 'playing'
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    state.teams.length ? state.teams.map(({ id, name, members, emoji, color, photo }) => ({ id, name, members, emoji, color, photo: photo ?? null })) : presetDrafts(4),
  )
  const [duration, setDuration] = useState<Duration>(state.settings.duration)
  const [pace, setPace] = useState<Pace>(state.settings.pace)
  const [picker, setPicker] = useState<string | null>(null)

  const update = (id: string, patch: Partial<Draft>) => setDrafts((d) => d.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const add = () => {
    if (drafts.length >= MAX_TEAMS) return
    sfx.pop()
    const used = new Set(drafts.map((d) => d.name))
    const preset = TEAM_PRESETS.find((p) => !used.has(p.name)) ?? TEAM_PRESETS[drafts.length % TEAM_PRESETS.length]
    const usedColors = new Set(drafts.map((d) => d.color))
    const color = usedColors.has(preset.color) ? (COLOR_KEYS.find((c) => !usedColors.has(c)) ?? preset.color) : preset.color
    const usedPhotos = new Set(drafts.map((d) => d.photo).filter(Boolean))
    const photo = preset.photo && !usedPhotos.has(preset.photo) ? preset.photo : (PHOTO_AVATARS.find((p) => !usedPhotos.has(p.id))?.id ?? null)
    const t = makeTeam({ ...preset, color, photo })
    setDrafts((d) => [...d, { id: t.id, name: t.name, members: '', emoji: t.emoji, color: t.color, photo: t.photo ?? null }])
  }

  const remove = (id: string) => {
    if (drafts.length <= MIN_TEAMS) return
    setDrafts((d) => d.filter((t) => t.id !== id))
  }

  const finalTeams = (): Team[] => {
    const byId = new Map(state.teams.map((t) => [t.id, t]))
    return drafts.map((d, i) => {
      const clean = { ...d, name: d.name.trim() || `Equipo ${i + 1}`, members: d.members.trim() }
      const prev = byId.get(d.id)
      return prev ? { ...prev, ...clean } : makeTeam(clean)
    })
  }

  const start = () => {
    dispatch({ type: 'setTeams', teams: finalTeams(), settings: { duration, pace } })
    dispatch({ type: 'startGame' })
    onStarted()
  }

  const save = () => {
    dispatch({ type: 'setTeams', teams: finalTeams(), settings: { pace } })
    onSaved()
  }

  const ask = useConfirm()
  const restartWith = async () => {
    if (!(await ask('¿Empezar una partida nueva? Los puntos actuales se borran.', { yes: 'Sí, empezar', danger: true }))) return
    start()
  }

  return (
    <motion.main
      className="mx-auto w-full max-w-7xl px-4 pb-12 pt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button onClick={onBack} className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[0.95rem] font-extrabold text-white/90 hover:bg-white/20">
            <ArrowLeft className="size-4" strokeWidth={3} /> Volver
          </button>
          <h1 className="font-display title-3d text-[3rem] leading-none">
            {playing ? 'EDITAR EQUIPOS' : 'ARMA TUS AGENCIAS'} <span aria-hidden>🏢</span>
          </h1>
          <p className="mt-2 text-[1.15rem] font-extrabold text-white/85">
            De {MIN_TEAMS} a {MAX_TEAMS} equipos. Cada uno es una agencia que compite por ser la Agencia Maestra.
          </p>
        </div>
        {!playing && (
          <button
            onClick={() => {
              sfx.pop()
              setDrafts(presetDrafts(Math.max(drafts.length, 4)))
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 font-extrabold text-white ring-1 ring-white/25 hover:bg-white/20"
          >
            <Sparkles className="size-5" /> Usar nombres de ejemplo
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {drafts.map((d, i) => {
            const c = TEAM_COLORS[d.color]
            const live = state.teams.find((t) => t.id === d.id)
            return (
              <motion.article
                key={d.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="card-white relative overflow-visible p-4"
                style={{ boxShadow: `0 .4rem 0 ${c.lip}, 0 1rem 2rem rgb(8 2 30 / .4)` }}
              >
                <div className="absolute inset-x-0 top-0 h-2.5 rounded-t-[1.5rem]" style={{ background: `linear-gradient(90deg, ${c.a}, ${c.b})` }} />
                <div className="flex items-start gap-3 pt-1">
                  <div className="relative">
                    <button
                      onClick={() => setPicker(picker === d.id ? null : d.id)}
                      aria-label={`Cambiar avatar del equipo ${i + 1}`}
                      aria-expanded={picker === d.id}
                      className="transition hover:scale-105"
                    >
                      <TeamAvatar team={d} size={4.4} />
                    </button>
                    <AnimatePresence>
                      {picker === d.id && (
                        <motion.div
                          className="absolute left-0 top-[105%] z-30 grid w-[17.5rem] grid-cols-6 gap-1 rounded-2xl bg-white p-2 shadow-[0_1rem_2rem_rgb(0_0_0/.35)] ring-2 ring-grape/30"
                          role="listbox"
                          aria-label="Elegir avatar"
                          initial={{ scale: 0.8, opacity: 0, y: -8 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <div className="col-span-6 px-1 pt-0.5 text-[0.75rem] font-black uppercase tracking-wider text-ink-soft">Fotos</div>
                          {PHOTO_AVATARS.map((p, pi) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                sfx.select()
                                update(d.id, { photo: p.id })
                                setPicker(null)
                              }}
                              className={`aspect-square overflow-hidden rounded-xl p-0.5 hover:bg-grape/15 ${d.photo === p.id ? 'bg-grape ring-2 ring-grape' : ''}`}
                              aria-label={`Foto ${pi + 1}`}
                            >
                              <img src={p.src} alt="" className="size-full rounded-[0.6rem] object-cover" />
                            </button>
                          ))}
                          <div className="col-span-6 px-1 pt-1 text-[0.75rem] font-black uppercase tracking-wider text-ink-soft">Emojis</div>
                          {AVATARS.map((e) => (
                            <button
                              key={e}
                              onClick={() => {
                                sfx.select()
                                update(d.id, { emoji: e, photo: null })
                                setPicker(null)
                              }}
                              className={`grid aspect-square place-items-center rounded-xl text-[1.6rem] hover:bg-grape/15 ${!d.photo && e === d.emoji ? 'bg-grape/20 ring-2 ring-grape' : ''}`}
                              aria-label={`Avatar ${e}`}
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="block text-[0.8rem] font-black uppercase tracking-wider text-ink-soft" htmlFor={`name-${d.id}`}>
                      Agencia {i + 1}
                    </label>
                    <input
                      id={`name-${d.id}`}
                      value={d.name}
                      maxLength={22}
                      onChange={(e) => update(d.id, { name: e.target.value })}
                      placeholder={`Equipo ${i + 1}`}
                      className="font-display w-full rounded-xl border-2 border-[#e6defc] bg-[#f7f4ff] px-3 py-1.5 text-[1.45rem] text-ink outline-none focus:border-grape"
                    />
                  </div>
                  <button
                    onClick={() => remove(d.id)}
                    disabled={drafts.length <= MIN_TEAMS}
                    aria-label={`Quitar ${d.name || `equipo ${i + 1}`}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-soft transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>

                <label className="mt-3 block text-[0.8rem] font-black uppercase tracking-wider text-ink-soft" htmlFor={`mem-${d.id}`}>
                  Integrantes
                </label>
                <textarea
                  id={`mem-${d.id}`}
                  value={d.members}
                  onChange={(e) => update(d.id, { members: e.target.value })}
                  placeholder="Ana, Luis, Camila…"
                  rows={2}
                  className="w-full resize-none rounded-xl border-2 border-[#e6defc] bg-[#f7f4ff] px-3 py-2 text-[1rem] font-bold text-ink outline-none focus:border-grape"
                />

                <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Color del equipo">
                  {COLOR_KEYS.map((k: ColorKey) => (
                    <button
                      key={k}
                      role="radio"
                      aria-checked={d.color === k}
                      aria-label={TEAM_COLORS[k].name}
                      onClick={() => {
                        sfx.select()
                        update(d.id, { color: k })
                      }}
                      className={`size-9 rounded-full transition ${d.color === k ? 'scale-110 ring-4 ring-ink/80 ring-offset-2' : 'hover:scale-110'}`}
                      style={{ background: `linear-gradient(160deg, ${TEAM_COLORS[k].a}, ${TEAM_COLORS[k].b})` }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[0.85rem]">
                  <span className="chip bg-[#f1ecff] text-grape-deep">PUNTOS: {live?.points ?? 0}</span>
                  <span className="chip bg-[#fff6d6] text-[#8a5a00]">MONEDAS: {live?.coins ?? 0}</span>
                  <span className="chip bg-[#ffe6f2] text-bubble-deep">COMBO: x{live?.streak ?? 0}</span>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>

        {drafts.length < MAX_TEAMS && (
          <motion.button
            layout
            onClick={add}
            className="grid min-h-[14rem] place-items-center rounded-[1.5rem] border-[3px] border-dashed border-white/35 text-white/85 transition hover:border-sun hover:bg-white/5 hover:text-sun"
          >
            <span className="flex flex-col items-center gap-2">
              <span className="grid size-16 place-items-center rounded-full bg-white/12">
                <Plus className="size-9" strokeWidth={3} />
              </span>
              <span className="font-display text-[1.5rem]">Agregar equipo</span>
            </span>
          </motion.button>
        )}
      </div>

      {/* ajustes */}
      <div className="panel-glass mt-6 grid gap-5 p-5 md:grid-cols-2">
        <fieldset>
          <legend className="font-display mb-2 text-[1.3rem] text-sun">⏱️ Ritmo de juego</legend>
          <div className="flex flex-wrap gap-2">
            {PACES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sfx.select()
                  setPace(p.id)
                }}
                aria-pressed={pace === p.id}
                className={`rounded-2xl px-4 py-2 text-left transition ${pace === p.id ? 'bg-white text-ink shadow-[0_.25rem_0_#b9a8e6]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <span className="block text-[1.1rem] font-black">{p.label}</span>
                <span className={`block text-[0.8rem] font-bold ${pace === p.id ? 'text-ink-soft' : 'text-white/70'}`}>{p.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={playing}>
          <legend className="font-display mb-2 text-[1.3rem] text-sun">⏱️ Duración de la partida</legend>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  sfx.select()
                  setDuration(r.id)
                }}
                aria-pressed={duration === r.id}
                className={`rounded-2xl px-4 py-2 text-left transition disabled:opacity-50 ${duration === r.id ? 'bg-white text-ink shadow-[0_.25rem_0_#b9a8e6]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <span className="block text-[1.1rem] font-black">{r.label}</span>
                <span className={`block text-[0.8rem] font-bold ${duration === r.id ? 'text-ink-soft' : 'text-white/70'}`}>{r.hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[0.85rem] font-bold text-white/70">
            {playing
              ? 'Se puede cambiar al empezar una partida nueva.'
              : `Con ${drafts.length} equipos: ${roundsFor(drafts.length, duration)} ${roundsFor(drafts.length, duration) === 1 ? 'reto' : 'retos'} por equipo en el Nivel 1; los niveles 2 y 3 se juegan todos a la vez.`}
          </p>
        </fieldset>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        {playing ? (
          <>
            <CandyButton tone="sun" onClick={save} className="text-[1.8rem]">
              GUARDAR Y SEGUIR JUGANDO
            </CandyButton>
            <CandyButton tone="ghost" onClick={restartWith} className="text-[1.2rem]">
              <RotateCcw className="size-5" /> Nueva partida con estos equipos
            </CandyButton>
          </>
        ) : (
          <CandyButton tone="sun" onClick={start} className="shine text-[2.2rem]">
            <Swords className="size-8" strokeWidth={2.6} /> ¡A LA BATALLA!
          </CandyButton>
        )}
      </div>
    </motion.main>
  )
}
