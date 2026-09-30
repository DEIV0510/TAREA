import { motion } from 'framer-motion'
import { GraduationCap, Home, Volume2, VolumeX } from 'lucide-react'
import { LEVELS } from '../data/levels'
import { useClock, useGame, useUI } from '../game/GameContext'
import { sfx } from '../lib/sound'

/** Reloj de la partida: cuánto queda de los 10 minutos. */
function ClockChip() {
  const { left, running } = useClock()
  const s = Math.ceil(left)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  const urgent = s <= 60
  return (
    <motion.span
      role="timer"
      aria-label={`Quedan ${Math.floor(s / 60)} minutos y ${s % 60} segundos de partida`}
      className={`font-display tabular flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-1.5 text-[1.25rem] leading-none ring-1 ${urgent ? 'bg-[#e11d48] text-white ring-white/40' : 'bg-white/12 text-white ring-white/20'}`}
      animate={urgent && running ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 1, repeat: urgent && running ? Infinity : 0 }}
    >
      ⏱️ {mm}:{ss}
      {!running && <span className="font-sans text-[0.75rem] font-black opacity-80">PAUSA</span>}
    </motion.span>
  )
}

export function TopBar({ inGame, onHome }: { inGame: boolean; onHome: () => void }) {
  const { state } = useGame()
  const { prefs, setPrefs, setTeacherOpen } = useUI()
  const L = LEVELS[state.level]

  return (
    <header className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center gap-2 px-4 pb-4 pt-[calc(0.625rem+env(safe-area-inset-top,0px))] ${inGame ? 'bg-gradient-to-b from-[#170a3c] via-[#170a3ce6] to-transparent' : ''}`}>
      <div className="pointer-events-auto flex items-center gap-2">
        {inGame && (
          <button
            onClick={onHome}
            className="font-display flex items-center gap-2 whitespace-nowrap rounded-2xl bg-white/12 px-3 py-2 text-[1.2rem] leading-none text-white ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label="Ir al inicio"
          >
            <Home className="size-5" strokeWidth={2.6} />
            <span className="hidden sm:inline">
              AD <span className="text-sun">BATTLE</span>
            </span>
          </button>
        )}
        {inGame && state.status === 'playing' && (
          <motion.span
            key={state.level}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="hidden whitespace-nowrap rounded-2xl px-3 py-2 text-[0.95rem] font-black text-white lg:inline-block"
            style={{ background: `linear-gradient(90deg, ${L.a}, ${L.b})` }}
          >
            NIVEL {state.level} · {L.emoji} {L.title}
          </motion.span>
        )}
        {inGame && state.status === 'playing' && <ClockChip />}
      </div>

      <div className="pointer-events-auto ml-auto flex items-center gap-2">
        <button
          onClick={() => {
            const on = !prefs.sound
            setPrefs({ sound: on })
            if (on) window.setTimeout(() => sfx.pop(), 30)
          }}
          aria-pressed={prefs.sound}
          aria-label={prefs.sound ? 'Sonido activado. Tocar para silenciar' : 'Sonido desactivado. Tocar para activar'}
          className="flex items-center gap-1.5 rounded-2xl bg-white/12 px-3 py-2 text-[0.95rem] font-black text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          {prefs.sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          <span className="hidden whitespace-nowrap lg:inline">{prefs.sound ? 'Sonido ON' : 'Sonido OFF'}</span>
        </button>
        <button
          onClick={() => {
            sfx.click()
            setTeacherOpen(true)
          }}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-2xl bg-sun px-3 py-2 text-[0.95rem] font-black text-ink shadow-[0_.2rem_0_#b45309] transition hover:brightness-105"
        >
          <GraduationCap className="size-5" strokeWidth={2.4} />
          <span>MODO PROFESOR</span>
        </button>
      </div>
    </header>
  )
}
