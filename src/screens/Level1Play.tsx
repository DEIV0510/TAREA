import { AnimatePresence, motion } from 'framer-motion'
import { Pause } from 'lucide-react'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { TeamAvatar, TimerBar } from '../components/bits'
import { Mascot } from '../components/Mascot'
import { L1_BANK, L1_BY_ID, L1_TYPES, SLIDES } from '../data/level1'
import { TEAM_COLORS } from '../data/teams'
import { currentTeam, paceFactor, questionIdFor, roundsL1, timeLimit, turnKey } from '../game/engine'
import { useGame } from '../game/GameContext'
import { useTurnTimer } from '../game/useTurnTimer'
import type { ChoiceQ, GameState, L1Question, Team, TurnResult } from '../types'
import { ChoiceGame, MatchGame, OrderGame, SortGame, TrueFalseGame } from './minigames'
import { NextButton, PointsBreakdown, RewardChips } from './ResultBits'

export function Level1Play() {
  const { state } = useGame()
  const team = currentTeam(state)
  if (!team) return null
  return <Level1Turn key={turnKey(state)} team={team} />
}

function correctAnswerText(q: L1Question): string | null {
  if (q.type === 'tf') return q.truth ? 'REALIDAD ✅' : 'MITO ❌'
  if (q.type === 'quiz' || q.type === 'ad' || q.type === 'odd' || q.type === 'case') return (q as ChoiceQ).options[0]
  if (q.type === 'order') return q.steps.join(' → ')
  return null
}

export function TurnHeader({ state, team, center, children }: { state: GameState; team: Team; center: ReactNode; children?: ReactNode }) {
  const c = TEAM_COLORS[team.color]
  const mods = [state.mods.double && '🔥 x2', state.mods.time && '⏰ +15 s', state.mods.quick && '⚡ rápida'].filter(Boolean) as string[]
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-2 rounded-2xl py-1 pl-1 pr-3" style={{ background: `linear-gradient(90deg, ${c.b}, ${c.b}55)` }}>
        <TeamAvatar team={team} size={2.4} />
        <span className="max-w-[14rem] truncate text-[1.15rem] font-black text-white">{team.name}</span>
        {team.streak >= 1 && (
          <motion.span
            key={team.streak}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="font-display rounded-lg bg-white/90 px-2 py-0.5 text-[1rem] text-[#ea580c]"
          >
            🔥 x{team.streak}
          </motion.span>
        )}
      </div>
      <div className="font-display text-[1.25rem] text-white/90">{center}</div>
      <div className="ml-auto flex flex-wrap gap-1.5">
        {mods.map((m) => (
          <span key={m} className="chip bg-sun text-[0.9rem] text-ink shadow-[0_.18rem_0_#b45309]">
            {m}
          </span>
        ))}
        {children}
      </div>
    </div>
  )
}

function Level1Turn({ team }: { team: Team }) {
  const { state, dispatch } = useGame()
  const key = turnKey(state)
  const qid = questionIdFor(state, team)
  const q: L1Question = (qid && L1_BY_ID[qid]) || L1_BANK[0]
  const T = L1_TYPES[q.type]
  const settled: TurnResult | null = state.last?.key === key ? state.last : null
  const answered = useRef(!!settled)
  const [sheet, setSheet] = useState(!!settled)

  const limit = timeLimit(state, T.time)
  const fastLimit = Math.round(T.fast * (paceFactor(state.settings.pace) ?? 1))

  const finish = useCallback(
    (correct: boolean, answer: string | null, timeout = false) => {
      if (answered.current) return
      answered.current = true
      dispatch({
        type: 'settle',
        input: { level: 1, correct, timeout, elapsed: timerRef.current(), answer, fastLimit, quickLimit: T.quick, rand: Math.random() },
      })
      window.setTimeout(() => setSheet(true), correct ? (team.streak >= 1 ? 1500 : 1150) : 1350)
    },
    [dispatch, fastLimit, T.quick, team.streak],
  )

  const timerRef = useRef<() => number>(() => 0)
  const { left, getElapsed, paused } = useTurnTimer(limit, !settled, () => finish(false, null, true))
  timerRef.current = getElapsed

  const revealed = settled ? { answer: settled.answer, correct: settled.correct } : null
  const seed = `${key}-${q.id}`
  const onDone = (correct: boolean, answer: string | null) => finish(correct, answer)

  return (
    <motion.section
      className="relative flex min-h-full flex-col gap-3 pb-2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      <TurnHeader
        state={state}
        team={team}
        center={
          <>
            RETO {state.round + 1}/{roundsL1(state)} · {T.emoji} {T.name}
          </>
        }
      />
      <div className="relative">
        <TimerBar left={settled ? left : left} limit={limit} />
        {paused && !settled && (
          <div className="font-display absolute inset-0 grid place-items-center rounded-full bg-[#0b0520]/70 text-[1.2rem]">
            <span className="flex items-center gap-2">
              <Pause className="size-5" fill="currentColor" /> PAUSA DEL PROFESOR
            </span>
          </div>
        )}
      </div>

      <div className="relative mx-auto w-full max-w-6xl flex-1">
        {q.type === 'tf' ? (
          <TrueFalseGame q={q} seed={seed} revealed={revealed} onDone={onDone} />
        ) : q.type === 'match' ? (
          <MatchGame q={q} seed={seed} revealed={revealed} onDone={onDone} />
        ) : q.type === 'order' ? (
          <OrderGame q={q} seed={seed} revealed={revealed} onDone={onDone} />
        ) : q.type === 'sort' ? (
          <SortGame q={q} seed={seed} revealed={revealed} onDone={onDone} />
        ) : (
          <ChoiceGame q={q} seed={seed} revealed={revealed} onDone={onDone} />
        )}
      </div>

      <AnimatePresence>
        {settled && sheet && (
          <ResultSheet key="sheet" result={settled} q={q} team={team} />
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function ResultSheet({ result, q, team }: { result: TurnResult; q: L1Question; team: Team }) {
  const answer = correctAnswerText(q)
  const title = result.correct ? '¡CORRECTO! 🎉' : result.timeout ? '⏰ ¡SE ACABÓ EL TIEMPO!' : '¡CASI! 😭'
  return (
    <>
      <motion.div className="fixed inset-0 z-30 bg-[#0b0520]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden />
      <motion.div
        role="dialog"
        aria-label="Resultado del reto"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-h-[78dvh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-5 pt-4 text-ink shadow-[0_-1rem_3rem_rgb(0_0_0/.45)] sm:px-7"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-black/10" aria-hidden />
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-[5.5rem] shrink-0">
            <Mascot mood={result.correct ? 'happy' : 'sad'} megaphone={false} className="w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-display text-[clamp(2rem,4vw,3rem)] leading-none ${result.correct ? 'text-mint-deep' : 'text-bubble-deep'}`}>{title}</h3>
            <p className="mt-1 text-[1.05rem] font-extrabold text-ink-soft">
              {result.correct
                ? `${team.emoji} ${team.name} suma puntos${result.streak >= 2 ? ` y va en COMBO x${result.streak}` : ''}.`
                : 'Sin castigo: los puntos no bajan. ¡La próxima es suya!'}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            {answer && (
              <p className="rounded-2xl bg-[#e7fbf2] px-4 py-2.5 text-[1.15rem] font-black text-[#065f46]">
                ✅ Respuesta correcta: <span className="text-ink">{answer}</span>
              </p>
            )}
            <p className="rounded-2xl bg-[#fff7df] px-4 py-2.5 text-[1.1rem] font-bold leading-snug text-ink">
              <span className="font-black">💡 ¿Por qué? </span>
              {q.explain}
            </p>
            {q.slide && (
              <p className="text-[0.95rem] font-extrabold text-ink-soft">
                📚 De la exposición · diapositiva {q.slide}: {SLIDES[q.slide]}
              </p>
            )}
            <RewardChips result={result} />
          </div>
          <PointsBreakdown result={result} />
        </div>

        <div className="mt-4 flex justify-center">
          <NextButton />
        </div>
      </motion.div>
    </>
  )
}
