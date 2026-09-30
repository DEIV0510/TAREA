import { LayoutGroup, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { TEAM_COLORS } from '../data/teams'
import { ranking } from '../game/engine'
import type { Team } from '../types'
import { AnimatedNumber, TeamAvatar } from './bits'

const MEDAL = ['🥇', '🥈', '🥉']

/** Ranking lateral (pantallas anchas). Se reordena solo con animación. */
export function RankingPanel({ teams, currentId, compact = false }: { teams: Team[]; currentId?: string; compact?: boolean }) {
  const list = ranking(teams)
  return (
    <section aria-label="Ranking en tiempo real" className="panel-glass flex h-full min-h-0 flex-col p-3">
      <h2 className="font-display flex items-center gap-2 px-2 pb-2 pt-1 text-[1.5rem] leading-none text-sun">
        <Trophy className="size-7" strokeWidth={2.6} fill="#ffd23f" /> RANKING
        <span className="ml-auto flex items-center gap-1.5 font-sans text-[0.75rem] font-extrabold uppercase tracking-wider text-white/70">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-mint" />
          </span>
          en vivo
        </span>
      </h2>
      <LayoutGroup id="ranking">
        <ol className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-1">
          {list.map((t, i) => {
            const c = TEAM_COLORS[t.color]
            const isCur = t.id === currentId
            return (
              <motion.li
                key={t.id}
                layout
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={`relative flex items-center gap-2.5 rounded-2xl px-2.5 py-2 ${isCur ? 'bg-white text-ink' : 'bg-white/10 text-white'}`}
                style={isCur ? { boxShadow: `0 0 0 3px ${c.b}, 0 .5rem 1.4rem ${c.b}88` } : undefined}
              >
                <span className="font-display w-8 shrink-0 text-center text-[1.5rem] leading-none">
                  {i < 3 && t.points > 0 ? <span aria-label={`Puesto ${i + 1}`}>{MEDAL[i]}</span> : <span className={isCur ? 'text-ink-soft' : 'text-white/70'}>{i + 1}</span>}
                </span>
                <TeamAvatar team={t} size={compact ? 2.2 : 2.5} />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 break-words text-[1rem] font-black leading-[1.1]" title={t.name}>
                    {t.name}
                  </div>
                  <div className={`flex flex-wrap items-center gap-x-2 text-[0.82rem] font-extrabold ${isCur ? 'text-ink-soft' : 'text-white/75'}`}>
                    <span title="Monedas">🪙 {t.coins}</span>
                    {t.streak >= 2 && <span className="text-[#ff7a1a]">🔥 x{t.streak}</span>}
                    {t.cards.length > 0 && <span title="Cartas de poder">🃏 {t.cards.length}</span>}
                    {t.cards.includes('shield') && <span title="Tiene escudo">🛡️</span>}
                  </div>
                </div>
                <span data-score-target={t.id} className="font-display inline-block text-[1.3rem] leading-none">
                  <AnimatedNumber value={t.points} />
                </span>
                {isCur && (
                  <span className="absolute -top-2 right-3 rounded-full bg-bubble px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-white">
                    En turno
                  </span>
                )}
              </motion.li>
            )
          })}
        </ol>
      </LayoutGroup>
    </section>
  )
}

/** Versión horizontal para pantallas angostas (tablet vertical, celular). */
export function RankingStrip({ teams, currentId }: { teams: Team[]; currentId?: string }) {
  const list = ranking(teams)
  return (
    <LayoutGroup id="ranking-strip">
      <ol aria-label="Ranking en tiempo real" className="flex gap-2 overflow-x-auto pb-1">
        {list.map((t, i) => {
          const isCur = t.id === currentId
          return (
            <motion.li
              key={t.id}
              layout
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-1.5 ${isCur ? 'bg-white text-ink' : 'bg-white/12 text-white'}`}
            >
              <span className="font-display text-[1.1rem]">{i < 3 && t.points > 0 ? MEDAL[i] : i + 1}</span>
              <TeamAvatar team={t} size={1.9} />
              <span className="max-w-[8rem] truncate text-[0.95rem] font-black">{t.name}</span>
              <span data-score-target={t.id} className="font-display inline-block text-[1.15rem]">
                <AnimatedNumber value={t.points} />
              </span>
            </motion.li>
          )
        })}
      </ol>
    </LayoutGroup>
  )
}
