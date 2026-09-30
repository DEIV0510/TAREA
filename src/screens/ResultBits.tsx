import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { fmt } from '../components/bits'
import { CandyButton } from '../components/CandyButton'
import { BADGES, POWERS } from '../data/powers'
import { roundsL1 } from '../game/engine'
import { useGame } from '../game/GameContext'
import type { TurnResult } from '../types'

const TONE_COLOR: Record<string, string> = {
  base: '#6d28d9',
  bonus: '#0e9f68',
  combo: '#ea580c',
  double: '#e11d48',
  time: '#1d5fe0',
}

/** Desglose de puntos de un turno. */
export function PointsBreakdown({ result }: { result: TurnResult }) {
  return (
    <div className="rounded-2xl bg-[#f6f2ff] p-3">
      {result.lines.length === 0 ? (
        <p className="text-center text-[1.05rem] font-extrabold text-ink-soft">0 puntos esta vez · ¡sin castigo!</p>
      ) : (
        <ul className="space-y-1">
          {result.lines.map((l, i) => (
            <motion.li
              key={l.label}
              className="flex items-center justify-between gap-3 text-[1.05rem] font-extrabold"
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <span className="text-ink">{l.label}</span>
              <span className="font-display tabular text-[1.25rem]" style={{ color: TONE_COLOR[l.tone] }}>
                +{fmt(l.value)}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-[#d9ceff] pt-2">
        <span className="font-display text-[1.2rem] text-ink">TOTAL</span>
        <span className="flex items-center gap-3">
          <span className="chip bg-[#fff3c4] text-[1rem] text-[#8a5a00]">+{result.coins} 🪙</span>
          <span className="font-display tabular text-[1.8rem] text-grape-deep">+{fmt(result.total)}</span>
        </span>
      </div>
    </div>
  )
}

/** Recompensas extra del turno: carta, escudo, insignias, cambio de puesto. */
export function RewardChips({ result }: { result: TurnResult }) {
  const items: { k: string; text: string; bg: string; fg: string }[] = []
  if (result.shieldSaved) items.push({ k: 'shield', text: `🛡️ El escudo salvó su COMBO x${result.streak}`, bg: '#d9fbe9', fg: '#065f46' })
  if (result.card && !result.cardToCoins) items.push({ k: 'card', text: `🃏 Ganaron la carta ${POWERS[result.card].emoji} ${POWERS[result.card].name}`, bg: '#ffe4f1', fg: '#9d174d' })
  if (result.cardToCoins) items.push({ k: 'full', text: '🃏 Mano llena: la carta se cambió por +20 🪙', bg: '#fff3c4', fg: '#8a5a00' })
  for (const b of result.badges) items.push({ k: b, text: `${BADGES[b].emoji} Insignia: ${BADGES[b].name}`, bg: '#ede7ff', fg: '#4c1d95' })
  if (result.rankAfter < result.rankBefore) items.push({ k: 'rank', text: `🚀 ¡Subieron al puesto #${result.rankAfter}!`, bg: '#dbeafe', fg: '#1e3a8a' })
  if (!items.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <motion.span
          key={it.k}
          className="chip text-[0.98rem]"
          style={{ background: it.bg, color: it.fg }}
          initial={{ scale: 0, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 400, damping: 15 }}
        >
          {it.text}
        </motion.span>
      ))}
    </div>
  )
}

/** Botón «siguiente» con la etiqueta correcta según lo que viene. */
export function NextButton({ onNext }: { onNext?: () => void }) {
  const { state, dispatch } = useGame()
  const lastTurn = state.level !== 1 || state.turn + 1 >= state.order.length
  const lastRound = state.level !== 1 || state.round + 1 >= roundsL1(state)
  const label =
    state.timeUp || (state.level === 3 && lastTurn && lastRound)
      ? 'VER LA GRAN FINAL 🏆'
      : !lastTurn || !lastRound
        ? 'SIGUIENTE TURNO'
        : 'RESULTADOS DEL NIVEL'
  const go = () => {
    onNext?.()
    dispatch({ type: 'next' })
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) go()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <CandyButton tone="sun" onClick={go} className="text-[1.6rem]">
      {label} <ArrowRight className="size-7" strokeWidth={3} />
    </CandyButton>
  )
}
