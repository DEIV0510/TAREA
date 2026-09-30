import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { Mascot, type Mood } from '../components/Mascot'
import { RankingPanel, RankingStrip } from '../components/Ranking'
import { BADGES, POWERS } from '../data/powers'
import { currentTeam, turnKey } from '../game/engine'
import { useGame } from '../game/GameContext'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'
import type { GameState } from '../types'
import { Final } from './Final'
import { Level1Play } from './Level1Play'
import { GroupCampaign } from './GroupCampaign'
import { LevelComplete } from './LevelComplete'
import { LevelIntro } from './LevelIntro'
import { Shop } from './Shop'
import { TurnIntro } from './TurnIntro'

/** Escucha los resultados del motor y dispara sonidos, confeti, "+100" y anuncios. */
function GameFx() {
  const { state } = useGame()
  const fx = useFx()
  const seenTurn = useRef(state.last?.seq ?? 0)
  const seenEvent = useRef(state.event?.seq ?? 0)
  const wasTimeUp = useRef(state.timeUp)
  const teamsRef = useRef(state.teams)
  teamsRef.current = state.teams

  useEffect(() => {
    const r = state.last
    if (!r || r.seq <= seenTurn.current) return
    seenTurn.current = r.seq
    const team = state.teams.find((t) => t.id === r.teamId)
    const name = team ? `${team.emoji} ${team.name}` : ''
    const origin = fx.origin.current
    fx.origin.current = null
    const later = (ms: number, fn: () => void) => window.setTimeout(fn, ms)

    // En los niveles 2 y 3 los efectos esperan a que termine la revelación en pantalla.
    const base = r.level === 1 ? 0 : r.level === 2 ? 1500 : 4150

    if (r.level === 1) {
      if (r.correct) {
        sfx.correct()
        fx.flash('good')
        fx.confetti('burst', origin ?? undefined)
        if (r.streak >= 2)
          later(380, () => {
            sfx.combo(Math.min(r.streak, 5))
            fx.burst(`COMBO x${r.streak}`, r.streak >= 4 ? '¡IMPARABLES! 🔥' : '¡En racha!', r.streak >= 4 ? '#ff7a1a' : '#ffd23f')
          })
      } else {
        sfx.wrong()
        fx.flash('bad')
        fx.shake()
        if (r.shieldSaved)
          later(600, () => {
            sfx.shield()
            fx.burst('🛡️ ¡ESCUDO!', 'El combo se salva', '#2ee59d')
          })
      }
    }

    if (r.total > 0)
      later(base + (r.level === 1 ? 120 : 0), () => {
        if (r.level > 1) {
          if ((r.l2?.index ?? r.l3?.final ?? 0) >= 75) {
            fx.confetti('big')
            fx.flash('gold')
          } else fx.confetti('burst')
          sfx.coin()
        }
        fx.float(`+${r.total.toLocaleString('es-CO')}`, origin, r.teamId)
      })

    let t = base + (r.level === 1 ? 900 : 700)
    if (r.card && !r.cardToCoins) {
      const card = r.card
      later(t + 300, () => {
        sfx.card()
        fx.reward({ card, title: '¡CARTA DE PODER!', sub: `Para ${name}` })
      })
      t += 1400
    }
    r.badges.forEach((b, i) =>
      later(t + i * 500, () => {
        sfx.badge()
        fx.toast({ icon: BADGES[b].emoji, title: `¡Insignia: ${BADGES[b].name}!`, sub: `${name} · ${BADGES[b].desc} +10 🪙` })
      }),
    )
    if (r.rankAfter < r.rankBefore)
      later(t + 200, () => {
        sfx.rankUp()
        fx.banner({
          emoji: '🚀',
          title: r.rankAfter === 1 ? '¡SUBISTE AL #1!' : `¡SUBISTE AL #${r.rankAfter}!`,
          sub: name,
          color: r.rankAfter === 1 ? '#f59e0b' : '#ff4fa3',
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.last?.seq])

  useEffect(() => {
    const ev = state.event
    if (!ev || ev.seq <= seenEvent.current) return
    seenEvent.current = ev.seq
    const find = (id: string) => teamsRef.current.find((t) => t.id === id)
    const label = (id: string) => {
      const t = find(id)
      return t ? `${t.emoji} ${t.name}` : ''
    }
    if (ev.kind === 'steal') {
      sfx.steal()
      fx.banner({ emoji: '🎯', title: '¡ROBO DE PUNTOS!', sub: `${label(ev.thiefId)} le quitó ${ev.amount} a ${label(ev.targetId)}`, color: '#e11d74' })
      const src = document.querySelector<HTMLElement>(`[data-score-target="${ev.targetId}"]`)
      const r = src?.getBoundingClientRect()
      window.setTimeout(() => fx.float(`+${ev.amount}`, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null, ev.thiefId, '#ff4fa3'), 300)
      if (ev.rankAfter < ev.rankBefore)
        window.setTimeout(() => {
          sfx.rankUp()
          fx.banner({ emoji: '🚀', title: ev.rankAfter === 1 ? '¡SUBISTE AL #1!' : `¡SUBISTE AL #${ev.rankAfter}!`, sub: label(ev.thiefId), color: '#f59e0b' })
        }, 2700)
      ev.badges.forEach((b, i) => window.setTimeout(() => fx.toast({ icon: BADGES[b].emoji, title: `¡Insignia: ${BADGES[b].name}!`, sub: label(ev.thiefId) }), 1200 + i * 400))
    } else if (ev.kind === 'blocked') {
      sfx.shield()
      fx.banner({ emoji: '🛡️', title: '¡ROBO BLOQUEADO!', sub: `${label(ev.targetId)} se protegió con su escudo`, color: '#0e9f68' })
      ev.badges.forEach((b) => window.setTimeout(() => fx.toast({ icon: BADGES[b].emoji, title: `¡Insignia: ${BADGES[b].name}!`, sub: label(ev.targetId) }), 1200))
    } else if (ev.kind === 'activate') {
      sfx.card()
      fx.burst(`${POWERS[ev.card].emoji} ¡ACTIVADA!`, POWERS[ev.card].name, '#ffd23f')
    } else if (ev.kind === 'buy') {
      sfx.coin()
      fx.toast({ icon: POWERS[ev.card].emoji, title: `¡${POWERS[ev.card].name}!`, sub: `Comprada por ${label(ev.teamId)}` })
    } else if (ev.kind === 'gift') {
      window.setTimeout(() => {
        sfx.card()
        fx.reward({ card: ev.card, title: '¡REGALO DE REMONTADA!', sub: `Para ${label(ev.teamId)}` })
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.event?.seq])

  useEffect(() => {
    if (!state.timeUp || wasTimeUp.current) return
    wasTimeUp.current = true
    sfx.countdown(true)
    fx.banner({ emoji: '⏰', title: '¡SE ACABÓ EL TIEMPO!', sub: 'Terminamos esta jugada y vamos a la Gran Final', color: '#e11d48' })
  }, [state.timeUp, fx])

  return null
}

/** Megi reacciona a lo que pasa, debajo del ranking (sin tapar el juego). */
function AsideMascot({ state }: { state: GameState }) {
  const g = state.group
  const settled = state.stage === 'play' && state.level === 1 && state.last?.key === turnKey(state) ? state.last : null
  const mood: Mood = g ? (g.phase === 'reveal' ? 'happy' : 'think') : settled ? (settled.correct ? 'happy' : 'sad') : state.stage === 'play' ? 'think' : state.stage === 'turnIntro' ? 'wow' : 'happy'
  if (state.stage === 'levelIntro' || state.stage === 'levelComplete') return null
  const line = g
    ? g.phase === 'think'
      ? '¡A pensar, agencias! 🧠'
      : g.phase === 'input'
        ? '¡Díganme sus letras! ✍️'
        : '¡Qué campañas! 🎉'
    : settled
    ? settled.correct
      ? '¡Eso es! 🎉'
      : settled.timeout
        ? '¡Tiempo! ⏰'
        : '¡Casi! 😭'
    : state.stage === 'play'
      ? '¡Piénsenlo bien! 🤔'
      : state.stage === 'turnIntro'
        ? '¡Prepárense! 📣'
        : null
  return (
    <div className="relative flex h-[8.5rem] shrink-0 items-end justify-center [@media(max-height:640px)]:hidden" aria-hidden>
      <AnimatePresence mode="wait">
        {line && (
          <motion.div
            key={line}
            className="font-display absolute left-2 top-1 z-10 max-w-[11rem] rounded-2xl rounded-br-sm bg-white px-3 py-1.5 text-[1.05rem] leading-tight text-ink shadow-lg"
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, transition: { duration: 0.1 } }}
          >
            {line}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="ml-auto w-[8rem]">
        <Mascot mood={mood} className="w-full drop-shadow-[0_.6rem_.8rem_rgb(0_0_0/.35)]" />
      </div>
    </div>
  )
}

function stageKey(s: GameState): string {
  if (s.stage === 'turnIntro' || s.stage === 'play') return `${s.stage}-${turnKey(s)}`
  return `${s.stage}-${s.level}`
}

export function GameScreen({ onHome, onTeams }: { onHome: () => void; onTeams: () => void }) {
  const { state } = useGame()
  const key = stageKey(state)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [key])
  const cur = state.level === 1 && (state.stage === 'turnIntro' || state.stage === 'play') ? currentTeam(state)?.id : undefined
  // Mientras las agencias arman su campaña el ranking no cambia: se oculta para dar espacio a las opciones.
  const building = state.stage === 'play' && !!state.group && state.group.phase !== 'reveal'
  const showRanking = state.stage !== 'final' && !building

  let view: ReactNode = null
  switch (state.stage) {
    case 'levelIntro':
      view = <LevelIntro />
      break
    case 'turnIntro':
      view = <TurnIntro />
      break
    case 'play':
      view = state.level === 1 ? <Level1Play /> : <GroupCampaign />
      break
    case 'levelComplete':
      view = <LevelComplete />
      break
    case 'shop':
      view = <Shop />
      break
    case 'final':
      view = <Final onHome={onHome} onTeams={onTeams} />
      break
  }

  return (
    <motion.div
      className="mx-auto flex min-h-dvh w-full max-w-[1800px] gap-4 px-4 pb-4 pt-[4.6rem]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <GameFx />
      <main id="stage-root" className="flex min-w-0 flex-1 flex-col gap-3">
        {showRanking && (
          <div className="lg:hidden">
            <RankingStrip teams={state.teams} currentId={cur} />
          </div>
        )}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={key} className="h-full" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              {view}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {showRanking && (
        <aside className="sticky top-[4.6rem] hidden h-[calc(100dvh-5.6rem)] w-[18.5rem] shrink-0 flex-col gap-2 lg:flex xl:w-[20rem]">
          <div className="min-h-0 flex-1">
            <RankingPanel teams={state.teams} currentId={cur} />
          </div>
          <AsideMascot state={state} />
        </aside>
      )}
    </motion.div>
  )
}
