import { motion } from 'framer-motion'
import { Check, ClipboardList, FolderOpen, Gavel, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AdPreview } from '../components/AdPreview'
import { CountUp, TeamAvatar, TimerBar } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { Mascot } from '../components/Mascot'
import { L2_FIELDS, PRODUCT_BY_ID, PRODUCTS, type Product } from '../data/level2'
import { BRIEF_BY_ID, BRIEFS, DIMS, L3_STEPS, type Brief } from '../data/level3'
import { BADGES, POWERS } from '../data/powers'
import { TEAM_COLORS } from '../data/teams'
import { GROUP_TIME, paceFactor } from '../game/engine'
import { useGame } from '../game/GameContext'
import { seededShuffle } from '../game/random'
import { useTurnTimer } from '../game/useTurnTimer'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'
import type { GameState, GroupResult, L2Picks, Team } from '../types'
import { NextButton } from './ResultBits'

const LETTERS = ['A', 'B', 'C', 'D']

interface Opt {
  id: string
  emoji: string
  label: string
  hint?: string
}
interface Field {
  key: string
  label: string
  emoji: string
  options: Opt[]
}

/** Campos del nivel con sus opciones barajadas de forma estable (la mejor no siempre es la A). */
function useFields(state: GameState): { fields: Field[]; product: Product; brief: Brief } {
  const product = PRODUCT_BY_ID[state.plan.l2] ?? PRODUCTS[0]
  const brief = BRIEF_BY_ID[state.plan.l3] ?? BRIEFS[0]
  const level = state.group?.level ?? 2
  const fields = useMemo<Field[]>(() => {
    if (level === 2)
      return L2_FIELDS.map((f) => ({
        key: f.key,
        label: f.label,
        emoji: f.emoji,
        options: seededShuffle(f.options, `${state.gameId}-${f.key}`).map((o) => ({ id: o.id, emoji: o.emoji, label: o.label, hint: o.hint })),
      }))
    return L3_STEPS.map((s) => ({
      key: s.key,
      label: s.label.toUpperCase(),
      emoji: s.emoji,
      options: seededShuffle(brief.steps[s.key], `${state.gameId}-${s.key}`).map((o) => ({ id: o.id, emoji: o.emoji, label: o.title, hint: o.desc })),
    }))
  }, [level, state.gameId, brief])
  return { fields, product, brief }
}

export function GroupCampaign() {
  const { state } = useGame()
  const g = state.group
  const data = useFields(state)
  if (!g) return null
  if (g.phase === 'reveal' && g.results) return <Reveal level={g.level} results={g.results} {...data} />
  return <Build level={g.level} {...data} />
}

/* ───────────────────────── Pensar + ingresar ───────────────────────── */

/** Una fila por decisión con sus 4 opciones (A-D). Sin onPick es solo el menú para leer. */
function OptionRows({ fields, picks, onPick, dense = false }: { fields: Field[]; picks?: Record<string, string>; onPick?: (field: string, id: string) => void; dense?: boolean }) {
  return (
    <div className="card-white divide-y-2 divide-[#f1ecff] px-3 py-1.5">
      {fields.map((fl) => (
        <div key={fl.key} className={`grid items-center gap-x-3 gap-y-1 ${dense ? 'py-1 md:grid-cols-[6.2rem_1fr]' : 'py-1.5 md:grid-cols-[8.5rem_1fr]'}`}>
          <div className="text-[0.85rem] font-black uppercase leading-tight tracking-wide text-grape">
            {fl.emoji} {fl.label}
          </div>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            {fl.options.map((o, i) => {
              const on = picks?.[fl.key] === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={!onPick}
                  aria-pressed={onPick ? on : undefined}
                  onClick={() => onPick?.(fl.key, o.id)}
                  className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition disabled:cursor-default ${
                    on ? 'bg-grape text-white shadow-[0_.2rem_0_#4c1d95]' : onPick ? 'bg-[#f4f0ff] text-ink hover:bg-[#ebe3ff]' : 'bg-[#f7f4ff] text-ink'
                  }`}
                >
                  <span className={`font-display grid size-6 shrink-0 place-items-center rounded-md text-[0.95rem] ${on ? 'bg-white text-grape-deep' : 'bg-grape text-white'}`}>{LETTERS[i]}</span>
                  <span className="hidden text-[1.1rem] leading-none 2xl:inline" aria-hidden>
                    {o.emoji}
                  </span>
                  <span className={`min-w-0 font-extrabold leading-tight ${dense ? 'text-[0.88rem]' : 'text-[0.95rem]'}`}>{o.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function BriefStrip({ brief }: { brief: Brief }) {
  return (
    <div className="relative">
      <div className="font-display absolute -top-3.5 left-4 z-10 inline-flex items-center gap-2 rounded-t-xl bg-sun px-3 py-0.5 text-[0.95rem] text-ink">
        <FolderOpen className="size-4" /> BRIEF CONFIDENCIAL
      </div>
      <div className="card-white flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 pb-2.5 pt-4" style={{ background: '#fffaf0' }}>
        <div className="flex items-center gap-2">
          <span className="text-[2.2rem] leading-none" aria-hidden>
            {brief.emoji}
          </span>
          <div className="leading-tight">
            <div className="font-display text-[1.5rem] text-ink">{brief.client}</div>
            <div className="text-[0.95rem] font-extrabold text-ink-soft">{brief.product}</div>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap gap-1.5 text-[0.88rem]">
          <span className="chip bg-[#f1ecff] text-ink">💰 {brief.budget}</span>
          <span className="chip bg-[#f1ecff] text-ink">🎯 {brief.objective}</span>
          <span className="chip bg-[#f1ecff] text-ink">👥 {brief.audience}</span>
          <span className="chip bg-[#ffe4ea] text-[#9f1239]">⚠️ {brief.problem}</span>
        </div>
      </div>
    </div>
  )
}

function ProductStrip({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[1.4rem] px-4 py-2 text-white shadow-[0_.3rem_0_rgb(0_0_0/.3)]" style={{ background: product.bg }}>
      <span className="text-[2.4rem] leading-none" aria-hidden>
        {product.emoji}
      </span>
      <div className="leading-tight">
        <div className="text-[0.75rem] font-black uppercase tracking-[0.16em] opacity-90">📦 Producto para todas las agencias</div>
        <div className="font-display text-[1.6rem] drop-shadow-[0_3px_0_rgb(0_0_0/.25)]">{product.name}</div>
      </div>
      <div className="text-[1.05rem] font-extrabold">{product.desc}</div>
      <div className="rounded-full bg-black/25 px-3 py-1 text-[0.85rem] font-extrabold">Situación: {product.stage}</div>
    </div>
  )
}

function Build({ level, fields, product, brief }: { level: 2 | 3; fields: Field[]; product: Product; brief: Brief }) {
  const { state, dispatch } = useGame()
  const g = state.group!
  const f = paceFactor(state.settings.pace)
  const limit = f === null ? null : Math.round(GROUP_TIME * f)
  const thinking = g.phase === 'think'
  const [sel, setSel] = useState(state.teams[0]?.id ?? '')
  const team = state.teams.find((t) => t.id === sel) ?? state.teams[0]
  const done = (t: Team) => fields.every((fl) => g.picks[t.id]?.[fl.key])
  const allDone = state.teams.every(done)
  const topRef = useRef<HTMLDivElement>(null)

  const { left } = useTurnTimer(limit, thinking, () => {
    sfx.countdown(true)
    dispatch({ type: 'groupPhase', phase: 'input' })
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [g.phase])

  const evaluate = () => {
    if (!allDone && !window.confirm('Algunas agencias no terminaron. Lo que falte se completará al azar (Nivel 2) o quedará «sin decidir» (Nivel 3). ¿Evaluar ya?')) return
    sfx.whoosh()
    dispatch({ type: 'groupEvaluate', rand: Math.random() })
  }

  const header = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <h2 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-none">
        {level === 2 ? '🎨 Creen su campaña' : '👑 Resuelvan el brief'}
      </h2>
      <span className="chip bg-white/12 text-[0.95rem]">
        <Users className="size-4" /> Todas las agencias a la vez
      </span>
    </div>
  )

  if (thinking) {
    return (
      <motion.section ref={topRef} className="flex min-h-full flex-col gap-3 pb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        {header}
        <TimerBar left={left} limit={limit} />
        {level === 2 ? <ProductStrip product={product} /> : <BriefStrip brief={brief} />}
        <p className="rounded-2xl bg-white/10 px-4 py-1.5 text-[1rem] font-extrabold text-white">
          ✍️ Cada agencia anota una letra por fila (ej.: {fields.map((_, i) => LETTERS[(i * 3 + 1) % 4]).join(' · ')}). ¡Tienen {limit ?? 'todo el'} {limit ? 'segundos' : 'tiempo'}!
        </p>
        <OptionRows fields={fields} dense={level === 3} />
        <div className="flex justify-center">
          <CandyButton tone="sun" className="shine text-[1.6rem]" onClick={() => dispatch({ type: 'groupPhase', phase: 'input' })}>
            <ClipboardList className="size-7" /> ¡LISTO! INGRESAR RESPUESTAS
          </CandyButton>
        </div>
      </motion.section>
    )
  }

  if (!team) return null
  const picks = g.picks[team.id] ?? {}
  const c = TEAM_COLORS[team.color]
  const idx = state.teams.findIndex((t) => t.id === team.id)
  const nextTeam = state.teams.slice(idx + 1).find((t) => !done(t)) ?? state.teams.find((t) => !done(t) && t.id !== team.id)
  const hasDouble = team.cards.includes('double')
  const usingDouble = g.doubles.includes(team.id)

  return (
    <motion.section className="flex min-h-full flex-col gap-3 pb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {header}
        <CandyButton tone={allDone ? 'sun' : 'grape'} className={`${allDone ? 'shine' : ''} text-[1.35rem]`} onClick={evaluate}>
          <Gavel className="size-6" /> EVALUAR CAMPAÑAS
        </CandyButton>
      </div>

      {/* agencias */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Agencia que responde">
        {state.teams.map((t) => {
          const ok = done(t)
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === team.id}
              onClick={() => {
                sfx.select()
                setSel(t.id)
              }}
              className={`flex items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3 transition ${t.id === team.id ? 'bg-white text-ink shadow-[0_.25rem_0_#b9a8e6]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <TeamAvatar team={t} size={2} />
              <span className="text-[1rem] font-black">{t.name}</span>
              {ok ? (
                <span className="grid size-6 place-items-center rounded-full bg-mint text-white">
                  <Check className="size-4" strokeWidth={4} />
                </span>
              ) : (
                <span className="text-[0.85rem] font-extrabold opacity-70">
                  {fields.filter((fl) => g.picks[t.id]?.[fl.key]).length}/{fields.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className={`grid flex-1 items-start gap-4 ${level === 2 ? '2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]' : ''}`}>
        <div className="rounded-[1.5rem] bg-white/10 p-3" style={{ boxShadow: `inset 0 0 0 3px ${c.b}` }}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <TeamAvatar team={team} size={2.2} />
            <span className="font-display text-[1.4rem] text-white">Respuestas de {team.name}</span>
            {hasDouble && (
              <button
                onClick={() => {
                  sfx.card()
                  dispatch({ type: 'groupDouble', teamId: team.id })
                }}
                aria-pressed={usingDouble}
                className={`ml-auto rounded-xl px-3 py-1.5 text-[0.95rem] font-black transition ${usingDouble ? 'bg-[#ef3b2d] text-white shadow-[0_.2rem_0_#8f1d14]' : 'bg-[#ffe4dc] text-[#8f1d14]'}`}
              >
                🔥 {usingDouble ? 'Doble puntos ACTIVO' : 'Usar Doble puntos'}
              </button>
            )}
          </div>
          <OptionRows
            fields={fields}
            dense={level === 3}
            picks={picks}
            onPick={(field, id) => {
              sfx.select()
              dispatch({ type: 'groupPick', teamId: team.id, field, id })
            }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {nextTeam && (
              <CandyButton tone="sky" className="text-[1.15rem]" onClick={() => setSel(nextTeam.id)}>
                Siguiente: {nextTeam.emoji} {nextTeam.name} →
              </CandyButton>
            )}
          </div>
        </div>
        {level === 2 && (
          <div className="panel-glass hidden p-3 2xl:block">
            <div className="mb-2 text-center text-[0.8rem] font-black uppercase tracking-[0.14em] text-sun">👀 Campaña de {team.name}</div>
            <AdPreview product={product} picks={picks as L2Picks} />
          </div>
        )}
      </div>
    </motion.section>
  )
}

/* ───────────────────────── Evaluación del cliente ───────────────────────── */

let revealedSeq = -1

function Reveal({ level, results, product, brief }: { level: 2 | 3; results: GroupResult[]; product: Product; brief: Brief }) {
  const { state } = useGame()
  const fx = useFx()
  const fresh = revealedSeq !== state.seq
  const [phase, setPhase] = useState<'wait' | 'show'>(fresh ? 'wait' : 'show')
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!fresh) return
    revealedSeq = state.seq
    sfx.drumroll(1.5)
    const t = window.setTimeout(() => setPhase('show'), 1600)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'show' || !fresh) return
    const timers: number[] = []
    timers.push(
      window.setTimeout(() => {
        sfx.levelUp()
        fx.flash('gold')
        fx.confetti('big')
      }, 500),
    )
    results.forEach((r, i) => {
      timers.push(
        window.setTimeout(() => {
          const el = cardRefs.current[r.teamId]
          const rect = el?.getBoundingClientRect()
          fx.float(`+${r.total.toLocaleString('es-CO')}`, rect ? { x: rect.left + rect.width / 2, y: rect.top + 40 } : null, r.teamId)
          sfx.coin()
        }, 1300 + i * 350),
      )
    })
    const climber = results.filter((r) => r.rankAfter < r.rankBefore).sort((a, b) => a.rankAfter - b.rankAfter)[0]
    if (climber) {
      const t = state.teams.find((x) => x.id === climber.teamId)
      timers.push(
        window.setTimeout(() => {
          sfx.rankUp()
          fx.banner({ emoji: '🚀', title: climber.rankAfter === 1 ? '¡SUBIERON AL #1!' : `¡SUBIERON AL #${climber.rankAfter}!`, sub: t ? `${t.emoji} ${t.name}` : '', color: '#f59e0b' })
        }, 1600 + results.length * 350),
      )
    }
    results
      .flatMap((r) => r.badges.map((b) => ({ b, r })))
      .slice(0, 4)
      .forEach(({ b, r }, i) => {
        const t = state.teams.find((x) => x.id === r.teamId)
        timers.push(
          window.setTimeout(() => {
            sfx.badge()
            fx.toast({ icon: BADGES[b].emoji, title: `¡Insignia: ${BADGES[b].name}!`, sub: t ? `${t.emoji} ${t.name}` : '' })
          }, 3200 + i * 600),
        )
      })
    return () => timers.forEach((t) => window.clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'wait') {
    return (
      <motion.section className="flex min-h-full flex-col items-center justify-center gap-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="w-[min(46vw,13rem)]">
          <Mascot mood="think" className="w-full" />
        </div>
        <p className="font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight">
          {level === 2 ? `${product.emoji} ${product.name}` : `${brief.emoji} ${brief.client}`} está evaluando las campañas
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.9, repeat: Infinity }}>
            …
          </motion.span>
        </p>
      </motion.section>
    )
  }

  const cols = results.length <= 2 ? 'sm:grid-cols-2' : results.length <= 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'

  return (
    <motion.section className="flex min-h-full flex-col gap-3 pb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[0.95rem] font-black uppercase tracking-[0.14em] text-white/80">
            {level === 2 ? `Campañas para ${product.emoji} ${product.name}` : `Brief de ${brief.emoji} ${brief.client}`}
          </p>
          <h2 className="font-display title-3d text-[clamp(2rem,4.2vw,3.2rem)] leading-none">{level === 2 ? 'ÍNDICE DE CAMPAÑA' : 'EVALUACIÓN DEL CLIENTE'}</h2>
        </div>
        <NextButton />
      </div>

      <div className={`grid gap-3 ${cols}`}>
        {results.map((r, i) => {
          const t = state.teams.find((x) => x.id === r.teamId)
          if (!t) return null
          const c = TEAM_COLORS[t.color]
          const top = r.bonus > 0
          const note = r.l2 ? r.l2.praise[0] ?? r.l2.tips[0] : r.l3?.best
          const tip = r.l2 ? r.l2.tips[0] : r.l3?.worst
          return (
            <motion.div
              key={r.teamId}
              ref={(el) => {
                cardRefs.current[r.teamId] = el
              }}
              className="card-white relative overflow-hidden px-3 py-2.5"
              style={{ boxShadow: top ? `0 .4rem 0 #b45309, 0 0 0 .25rem #ffd23f, 0 1rem 2rem rgb(8 2 30 / .4)` : `0 .4rem 0 ${c.lip}, 0 1rem 2rem rgb(8 2 30 / .35)` }}
              initial={fresh ? { y: 40, scale: 0.85, opacity: 0 } : false}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ delay: fresh ? 0.15 + i * 0.25 : 0, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display w-9 text-center text-[1.8rem]">{i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}</span>
                <TeamAvatar team={t} size={2.6} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[1.2rem] font-black leading-tight">{t.name}</div>
                  <div className="truncate text-[0.85rem] font-extrabold text-ink-soft">{r.l2 ? r.l2.verdict : r.l3?.verdict}</div>
                </div>
                <div className="text-right leading-none">
                  <div className="font-display text-[2.6rem]" style={{ color: r.score >= 85 ? '#0e9f68' : r.score >= 70 ? '#1d5fe0' : r.score >= 55 ? '#d97706' : '#e11d48' }}>
                    <CountUp to={r.score} duration={1} delay={fresh ? 0.3 + i * 0.25 : 0} fresh={fresh} />
                  </div>
                  <div className="text-[0.75rem] font-black text-ink-soft">/100</div>
                </div>
              </div>

              {r.l3 && (
                <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                  {DIMS.map((d) => (
                    <div key={d.key} className="text-center">
                      <div className="flex h-7 flex-col justify-end overflow-hidden rounded-md bg-black/5">
                        <motion.div
                          className="w-full rounded-lg"
                          style={{ background: d.color }}
                          initial={{ height: fresh ? 0 : `${r.l3!.dims[d.key]}%` }}
                          animate={{ height: `${r.l3!.dims[d.key]}%` }}
                          transition={{ duration: 0.7, delay: fresh ? 0.4 + i * 0.25 : 0 }}
                        />
                      </div>
                      <div className="mt-0.5 text-[0.65rem] font-black leading-tight text-ink-soft" title={d.label}>
                        {d.emoji} {r.l3!.dims[d.key]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {r.score >= 70 && note ? (
                <p className="mt-2 line-clamp-2 rounded-xl bg-[#e7fbf2] px-2.5 py-1.5 text-[0.92rem] font-extrabold leading-snug text-[#065f46]">✨ {note}</p>
              ) : tip ? (
                <p className="mt-2 line-clamp-2 rounded-xl bg-[#fff1e6] px-2.5 py-1.5 text-[0.92rem] font-extrabold leading-snug text-[#9a3412]">🔧 {tip}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.85rem]">
                <span className="font-display chip bg-[#f1ecff] text-[1.05rem] text-grape-deep">+{r.total.toLocaleString('es-CO')} pts</span>
                <span className="chip bg-[#fff3c4] text-[#8a5a00]">+{r.coins} 🪙</span>
                {r.doubled && <span className="chip bg-[#ffe4dc] text-[#8f1d14]">🔥 x2</span>}
                {r.bonus > 0 && <span className="chip bg-sun text-ink">🏆 Mejor campaña +{r.bonus}</span>}
                {r.card && <span className="chip bg-[#ffe4f1] text-[#9d174d]">🃏 {POWERS[r.card].name}</span>}
                {r.badges.slice(0, 1).map((b) => (
                  <span key={b} className="chip bg-[#ede7ff] text-[#4c1d95]">
                    {BADGES[b].emoji} {BADGES[b].name}
                  </span>
                ))}
                {r.l2?.autoFilled.length ? <span className="chip bg-[#fff3c4] text-[#8a5a00]">⏰ {r.l2.autoFilled.length} al azar</span> : null}
              </div>
            </motion.div>
          )
        })}
      </div>

      {level === 3 && (
        <p className="rounded-2xl bg-white/10 px-4 py-2.5 text-center text-[1.1rem] font-extrabold text-white">
          📚 Lección de la exposición: personalizar y emocionar vende más que solo mostrar el producto (caso «Comparte una Coca-Cola»).
        </p>
      )}
    </motion.section>
  )
}
