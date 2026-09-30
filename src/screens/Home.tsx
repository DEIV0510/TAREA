import { motion } from 'framer-motion'
import { CircleHelp, Play, Trophy, Users } from 'lucide-react'
import { CandyButton } from '../components/CandyButton'
import { Mascot } from '../components/Mascot'
import { useGame } from '../game/GameContext'

const WORDS = [
  { w: 'Piensa.', c: '#ffd23f' },
  { w: 'Crea.', c: '#ff4fa3' },
  { w: 'Convence.', c: '#38a3ff' },
  { w: 'Gana.', c: '#2ee59d' },
]

const LEVEL_NAME = { 1: 'Detective publicitario', 2: 'Creadores de campañas', 3: 'El cliente final' } as const

export function Home({ onPlay, onHowTo, onRanking, onTeams }: { onPlay: () => void; onHowTo: () => void; onRanking: () => void; onTeams: () => void }) {
  const { state } = useGame()
  const inProgress = state.status === 'playing'

  return (
    <motion.main
      className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 pb-10 pt-20 md:flex-row md:gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.3 }}
    >
      {/* mascota */}
      <motion.div
        className="relative w-[min(62vw,19rem)] shrink-0 md:w-[42%] md:max-w-[34rem]"
        initial={{ x: -60, opacity: 0, rotate: -8 }}
        animate={{ x: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
      >
        <div className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(circle,rgb(255_210_63/.35),transparent_65%)]" aria-hidden />
        <div className="anim-spin-slow absolute inset-[-6%] -z-10 opacity-40" aria-hidden
          style={{ background: 'repeating-conic-gradient(from 0deg, rgb(255 255 255 / .16) 0deg 10deg, transparent 10deg 30deg)', borderRadius: '50%', maskImage: 'radial-gradient(circle, #000 35%, transparent 70%)' }}
        />
        <Mascot mood="happy" className="w-full drop-shadow-[0_1.2rem_1.6rem_rgb(0_0_0/.35)]" />
        <motion.div
          className="font-display absolute right-[2%] top-[4%] rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-[1.15rem] text-grape-deep shadow-[0_.3rem_0_#d9ceff]"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 4 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
        >
          ¡Atención, agencias! 📣
        </motion.div>
      </motion.div>

      {/* título y menú */}
      <div className="flex w-full max-w-[40rem] flex-col items-center text-center md:items-start md:text-left">
        <motion.p
          className="chip mb-3 bg-white/12 text-[0.95rem] uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🎓 Exposición «La publicidad» · juego por equipos
        </motion.p>

        <motion.h1
          className="font-display leading-[0.82]"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 13 }}
        >
          <span className="text-gradient-sun title-drop block text-[clamp(4.6rem,11vw,9rem)]">
            AD
          </span>
          <span className="title-3d block text-[clamp(4.2rem,10vw,8.2rem)] text-white">BATTLE</span>
        </motion.h1>

        <motion.p
          className="font-display mt-4 text-[1.7rem] leading-tight text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          “La batalla definitiva de publicidad”
        </motion.p>

        <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
          {WORDS.map((x, i) => (
            <motion.span
              key={x.w}
              className="font-display rounded-xl px-3 py-1 text-[1.35rem] text-ink"
              style={{ background: x.c, boxShadow: '0 .2rem 0 rgb(0 0 0 / .3)' }}
              initial={{ y: 30, opacity: 0, rotate: -6 }}
              animate={{ y: 0, opacity: 1, rotate: i % 2 ? 2 : -2 }}
              transition={{ delay: 0.35 + i * 0.09, type: 'spring', stiffness: 300, damping: 14 }}
            >
              {x.w}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="mt-8 flex w-full flex-col items-center gap-2 md:items-start"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <CandyButton tone="sun" sound={false} onClick={onPlay} className="shine w-full max-w-[26rem] text-[2.5rem]" aria-label={inProgress ? 'Continuar partida' : 'Jugar'}>
            <Play className="size-9" fill="currentColor" strokeWidth={2.5} /> {inProgress ? 'CONTINUAR' : 'JUGAR'}
          </CandyButton>
          {inProgress && (
            <span className="mt-1 text-[1rem] font-extrabold text-white/85">
              Nivel {state.level} · {LEVEL_NAME[state.level]} · {state.teams.length} equipos
            </span>
          )}
        </motion.div>

        <motion.div
          className="mt-5 grid w-full max-w-[36rem] grid-cols-1 gap-3 sm:grid-cols-3"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.72 }}
        >
          <CandyButton tone="sky" onClick={onHowTo} className="text-[1.2rem]">
            <CircleHelp className="size-6" strokeWidth={2.6} /> ¿CÓMO JUGAR?
          </CandyButton>
          <CandyButton tone="grape" onClick={onRanking} className="text-[1.2rem]">
            <Trophy className="size-6" strokeWidth={2.6} /> RANKING
          </CandyButton>
          <CandyButton tone="bubble" onClick={onTeams} className="text-[1.2rem]">
            <Users className="size-6" strokeWidth={2.6} /> EQUIPOS
          </CandyButton>
        </motion.div>

        <p className="mt-6 text-[0.95rem] font-extrabold text-white/70">⏱️ Máximo 10 minutos · 3 niveles · cartas de poder · ranking en vivo</p>
      </div>
    </motion.main>
  )
}
