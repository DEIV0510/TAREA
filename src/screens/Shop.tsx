import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { PowerCard, TeamAvatar } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { HAND_MAX, POWERS, POWER_IDS } from '../data/powers'
import { TEAM_COLORS } from '../data/teams'
import { ranking } from '../game/engine'
import { useGame } from '../game/GameContext'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'

export function Shop() {
  const { state, dispatch } = useGame()
  const fx = useFx()
  // Abre la tienda el equipo que va de último: es quien más necesita ayuda.
  const list = ranking(state.teams).reverse()
  const [sel, setSel] = useState(list[0]?.id ?? '')
  const team = state.teams.find((t) => t.id === sel) ?? list[0]
  const giftTeam = state.gift ? state.teams.find((t) => t.id === state.gift!.teamId) : null

  if (!team) return null
  const c = TEAM_COLORS[team.color]
  const full = team.cards.length >= HAND_MAX

  return (
    <motion.section className="flex min-h-full flex-col gap-3 py-1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display title-3d text-[clamp(2.2rem,4.6vw,3.4rem)] leading-none">🛒 TIENDA DE PODERES</h1>
          <p className="mt-1 text-[1.1rem] font-extrabold text-white/85">
            Gasten sus monedas antes del Nivel {state.level + 1}. Máximo {HAND_MAX} cartas por equipo.
          </p>
        </div>
        <CandyButton tone="sun" className="shine text-[1.6rem]" onClick={() => dispatch({ type: 'nextLevel', rand: Math.random() })}>
          IR AL NIVEL {state.level + 1} <ArrowRight className="size-7" strokeWidth={3} />
        </CandyButton>
      </div>

      {giftTeam && state.gift && (
        <motion.div
          className="flex items-center gap-3 rounded-2xl bg-mint px-4 py-2 text-ink shadow-[0_.3rem_0_#05573a]"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.2 }}
        >
          <span className="text-[1.8rem]" aria-hidden>
            🎁
          </span>
          <span className="text-[1.05rem] font-black">
            Regalo de remontada: {giftTeam.emoji} {giftTeam.name} recibe gratis {POWERS[state.gift.card].emoji} {POWERS[state.gift.card].name}. ¡Todavía pueden ganar!
          </span>
        </motion.div>
      )}

      {/* equipo que compra */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Equipo que compra">
        {list.map((t) => (
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
            <TeamAvatar team={t} size={2.1} />
            <span className="text-[1.02rem] font-black">{t.name}</span>
            <span className="chip bg-[#fff3c4] text-[0.9rem] text-[#8a5a00]">🪙 {t.coins}</span>
          </button>
        ))}
      </div>

      <div className="panel-glass p-3" style={{ boxShadow: `inset 0 0 0 2px ${c.b}` }}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <TeamAvatar team={team} size={2.8} />
          <div className="mr-auto">
            <div className="font-display text-[1.6rem] leading-none">{team.name}</div>
            <div className="text-[1rem] font-extrabold text-white/85">
              Tienen <span className="font-display text-[1.25rem] text-sun">🪙 {team.coins}</span> · cartas {team.cards.length}/{HAND_MAX}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.cards.map((id, i) => (
              <span key={`${id}-${i}`} className="chip bg-white/15 text-[0.95rem]">
                {POWERS[id].emoji} {POWERS[id].name}
              </span>
            ))}
            {!team.cards.length && <span className="text-[0.95rem] font-bold text-white/70">Aún sin cartas</span>}
          </div>
        </div>

        <ul className="grid gap-2.5 md:grid-cols-2">
          {POWER_IDS.map((id, i) => {
            const p = POWERS[id]
            const can = team.coins >= p.price && !full
            return (
              <motion.li
                key={id}
                className="flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-3 text-ink shadow-[0_.25rem_0_#d9ceff]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.04 * i }}
              >
                <PowerCard id={id} size="xs" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[1.3rem] leading-tight" style={{ color: p.lip }}>
                    {p.emoji} {p.name}
                  </div>
                  <p className="text-[0.98rem] font-bold leading-snug text-ink-soft">{p.desc}</p>
                </div>
                <button
                  disabled={!can}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    dispatch({ type: 'buy', teamId: team.id, card: id })
                    fx.confetti('coins', { x: r.left + r.width / 2, y: r.top })
                  }}
                  className="font-display shrink-0 rounded-xl px-3 py-2 text-[1.1rem] leading-tight text-ink shadow-[0_.22rem_0_#b45309] transition hover:brightness-105 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ background: 'linear-gradient(180deg,#ffe86b,#ffb300)' }}
                  aria-label={`Comprar ${p.name} por ${p.price} monedas`}
                >
                  {full ? 'Mano llena' : `🪙 ${p.price}`}
                  <span className="block font-sans text-[0.75rem] font-black">{full ? '' : 'COMPRAR'}</span>
                </button>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </motion.section>
  )
}
