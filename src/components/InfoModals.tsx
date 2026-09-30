import { useGame } from '../game/GameContext'
import { ranking } from '../game/engine'
import { BADGES, POWERS, POWER_IDS } from '../data/powers'
import { LEVELS } from '../data/levels'
import { CandyButton } from './CandyButton'
import { Modal, PowerCard, TeamAvatar, fmt } from './bits'
import type { Level } from '../types'

export function HowToPlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const scoring: [string, string, string][] = [
    ['✅', 'Respuesta correcta', '+100'],
    ['⚡', 'Respuesta rápida', '+50 extra'],
    ['🔥', 'COMBO x2 · x3 · x4', '+50 · +100 · +150'],
    ['😭', 'Respuesta incorrecta', '0 (sin castigo)'],
    ['🎨', 'Nivel 2: índice de campaña', 'índice × 10'],
    ['👑', 'Nivel 3: puntuación final', 'puntaje × 15'],
    ['🏆', 'Mejor campaña (niveles 2 y 3)', '+150'],
  ]
  return (
    <Modal open={open} onClose={onClose} title="¿CÓMO JUGAR? 🎮" wide labelledBy="howto-title">
      <div className="space-y-5 text-ink">
        <p className="text-[1.2rem] font-extrabold">
          La clase se divide en <b>2 a 6 equipos</b>. Cada equipo es una agencia de publicidad y compite por convertirse en la{' '}
          <b className="text-grape-deep">Agencia Maestra de la Publicidad</b>. La partida dura <b>máximo 10 minutos</b> (hay un reloj arriba) y todas las preguntas salen de la exposición «La publicidad».
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {([1, 2, 3] as Level[]).map((n) => {
            const L = LEVELS[n]
            return (
              <div key={n} className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(160deg, ${L.a}, ${L.b})` }}>
                <div className="text-[0.8rem] font-black uppercase tracking-wider opacity-90">Nivel {n}</div>
                <div className="font-display text-[1.45rem] leading-tight">
                  {L.emoji} {L.title}
                </div>
                <p className="mt-1 text-[0.98rem] font-bold">{L.theme}</p>
              </div>
            )
          })}
        </div>

        <div>
          <h3 className="font-display mb-2 text-[1.5rem] text-grape-deep">⭐ Puntos</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {scoring.map(([e, k, v]) => (
              <div key={k} className="flex items-center gap-3 rounded-xl bg-[#f6f2ff] px-3 py-2">
                <span className="text-[1.6rem]" aria-hidden>
                  {e}
                </span>
                <span className="flex-1 text-[1.05rem] font-extrabold">{k}</span>
                <span className="font-display text-[1.15rem] text-grape-deep">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display mb-1 text-[1.5rem] text-grape-deep">🃏 Cartas de poder</h3>
          <p className="mb-3 text-[1rem] font-bold text-ink-soft">
            Cada agencia empieza con una carta de regalo. Se ganan más con COMBO x2 y x4, con campañas de 90+ y en la tienda opcional (con monedas 🪙). Se usan al inicio del turno; la 🔥 Doble puntos también sirve en las campañas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {POWER_IDS.map((id) => (
              <PowerCard key={id} id={id} size="md" footer={<span className="font-display text-[1rem] text-white">🪙 {POWERS[id].price}</span>} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display mb-2 text-[1.5rem] text-grape-deep">🏅 Insignias (+10 🪙 cada una)</h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(BADGES).map((b) => (
              <span key={b.id} className="chip bg-[#f1ecff] text-[0.95rem] text-ink" title={b.desc}>
                {b.emoji} {b.name}
              </span>
            ))}
          </div>
        </div>

        <p className="rounded-2xl bg-[#fff7df] px-4 py-3 text-[1rem] font-bold">
          🎓 El botón <b>MODO PROFESOR</b> permite pausar el tiempo, saltar preguntas, ajustar puntos y reiniciar. Todo se guarda solo: si recargan, la partida sigue.
        </p>

        <div className="flex justify-center">
          <CandyButton tone="sun" onClick={onClose} className="text-[1.5rem]">
            ¡ENTENDIDO!
          </CandyButton>
        </div>
      </div>
    </Modal>
  )
}

const MEDAL = ['🥇', '🥈', '🥉']

export function RankingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame()
  const list = ranking(state.teams)
  return (
    <Modal open={open} onClose={onClose} title="🏆 RANKING" labelledBy="ranking-title">
      {list.length === 0 ? (
        <p className="text-center text-[1.2rem] font-extrabold text-ink-soft">Todavía no hay equipos. ¡Creen sus agencias para empezar!</p>
      ) : (
        <ol className="space-y-2">
          {list.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-[#f6f2ff] px-3 py-2.5">
              <span className="font-display w-10 text-center text-[1.9rem]">{i < 3 ? MEDAL[i] : i + 1}</span>
              <TeamAvatar team={t} size={3} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[1.35rem] font-black">{t.name}</div>
                <div className="text-[0.95rem] font-extrabold text-ink-soft">
                  🪙 {t.coins} · 🔥 mejor combo x{t.maxStreak} · ✅ {t.correct}/{t.played}
                  {t.badges.length > 0 && ` · ${t.badges.map((b) => BADGES[b].emoji).join('')}`}
                </div>
              </div>
              <span className="font-display text-[1.9rem] text-grape-deep">{fmt(t.points)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-center text-[0.95rem] font-bold text-ink-soft">
        {state.status === 'finished' ? 'Resultado final de la última partida.' : state.status === 'playing' ? `Partida en curso · Nivel ${state.level}.` : 'La partida aún no empieza.'}
      </p>
    </Modal>
  )
}
