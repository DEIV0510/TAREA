import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Background } from './components/Background'
import { HowToPlay, RankingModal } from './components/InfoModals'
import { Mascot } from './components/Mascot'
import { TeacherPanel } from './components/TeacherPanel'
import { TopBar } from './components/TopBar'
import { useGame, useUI } from './game/GameContext'
import { sfx } from './lib/sound'
import { GameScreen } from './screens/GameScreen'
import { Home } from './screens/Home'
import { TeamsSetup } from './screens/TeamsSetup'

type View = 'home' | 'setup' | 'game'

/** Cortina animada entre el menú y el juego. */
function PlayWipe({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[95] grid place-items-center overflow-hidden" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <motion.div
            className="absolute left-1/2 top-1/2 size-[250vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, #ffd23f 0%, #ff4fa3 35%, #7c3aed 70%)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.3, 1] }}
          />
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 12 }}
          >
            <div className="w-[min(40vw,12rem)]">
              <Mascot mood="happy" className="w-full" />
            </div>
            <div className="font-display title-3d text-[clamp(3rem,9vw,6rem)] leading-none text-white">¡A JUGAR!</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const { state, dispatch } = useGame()
  const { prefs } = useUI()
  const [view, setView] = useState<View>(() => (state.status === 'playing' || state.status === 'finished' ? 'game' : 'home'))
  const [modal, setModal] = useState<null | 'howto' | 'ranking'>(null)
  const [wipe, setWipe] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  useEffect(() => {
    document.documentElement.classList.toggle('calm', prefs.calm)
  }, [prefs.calm])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  // Si alguien borra todo desde el modo profesor, no dejamos la pantalla de juego vacía.
  useEffect(() => {
    if (view === 'game' && (state.status === 'setup' || !state.teams.length)) setView('setup')
  }, [view, state.status])

  const withWipe = useCallback((fn: () => void) => {
    sfx.whoosh()
    setWipe(true)
    timers.current.push(window.setTimeout(fn, 650))
    timers.current.push(window.setTimeout(() => setWipe(false), 1250))
  }, [])

  const goGame = useCallback(() => setView('game'), [])
  const goHome = useCallback(() => setView('home'), [])
  const goSetup = useCallback(() => setView('setup'), [])

  const play = () => {
    if (state.status === 'playing') return withWipe(goGame)
    if (state.teams.length < 2) return goSetup()
    if (state.status === 'finished') return goSetup()
    dispatch({ type: 'startGame' })
    withWipe(goGame)
  }

  return (
    <MotionConfig reducedMotion={prefs.calm ? 'always' : 'never'}>
      <Background />
      <TopBar inGame={view !== 'home'} onHome={goHome} />

      <AnimatePresence mode="wait">
        {view === 'home' && <Home key="home" onPlay={play} onHowTo={() => setModal('howto')} onRanking={() => setModal('ranking')} onTeams={goSetup} />}
        {view === 'setup' && <TeamsSetup key="setup" onBack={() => setView(state.status === 'playing' ? 'game' : 'home')} onStarted={() => withWipe(goGame)} onSaved={goGame} />}
        {view === 'game' && <GameScreen key="game" onHome={goHome} onTeams={goSetup} />}
      </AnimatePresence>

      <PlayWipe show={wipe} />
      <TeacherPanel onTeams={goSetup} onRanking={() => setModal('ranking')} onGame={goGame} />
      <HowToPlay open={modal === 'howto'} onClose={() => setModal(null)} />
      <RankingModal open={modal === 'ranking'} onClose={() => setModal(null)} />
    </MotionConfig>
  )
}
