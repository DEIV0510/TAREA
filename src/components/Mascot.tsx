import { motion, type TargetAndTransition } from 'framer-motion'
import { useId } from 'react'

export type Mood = 'idle' | 'happy' | 'sad' | 'think' | 'wow'

interface Props {
  mood?: Mood
  megaphone?: boolean
  crown?: boolean
  className?: string
  title?: string
}

const INK = '#1b1036'

const bodyAnim: Record<Mood, TargetAndTransition> = {
  idle: { y: [0, -6, 0], rotate: 0, scale: 1, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  happy: { y: [0, -26, 0, -12, 0], rotate: [0, -5, 4, -2, 0], scale: 1, transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.5 } },
  sad: { y: 5, rotate: -4, scale: 0.97, transition: { type: 'spring', stiffness: 120, damping: 12 } },
  think: { y: [0, -3, 0], rotate: 5, scale: 1, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  wow: { y: -8, rotate: 0, scale: 1.06, transition: { type: 'spring', stiffness: 300, damping: 10 } },
}

/** Megi, la mascota: una criaturita creativa con megáfono. SVG propio, sin imágenes. */
export function Mascot({ mood = 'idle', megaphone = true, crown = false, className = '', title = 'Megi, la mascota de AD Battle' }: Props) {
  const id = useId().replace(/:/g, '')
  const grad = `mg-body-${id}`
  const meg = `mg-meg-${id}`
  const origin = { transformBox: 'fill-box', transformOrigin: 'center' } as const

  return (
    <svg viewBox="0 0 270 230" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#c4a4ff" />
          <stop offset="0.55" stopColor="#9b6bff" />
          <stop offset="1" stopColor="#ff5fa8" />
        </linearGradient>
        <linearGradient id={meg} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe56b" />
          <stop offset="1" stopColor="#ffb300" />
        </linearGradient>
      </defs>

      <motion.ellipse
        cx="112"
        cy="214"
        rx="54"
        ry="8"
        fill="rgb(0 0 0 / .28)"
        animate={mood === 'happy' ? { scaleX: [1, 0.7, 1, 0.85, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9, repeat: mood === 'happy' ? Infinity : 0, repeatDelay: 0.5 }}
        style={origin}
      />

      <motion.g animate={bodyAnim[mood]} style={{ transformBox: 'view-box', transformOrigin: '112px 200px' }}>
        {/* pies */}
        <ellipse cx="88" cy="198" rx="17" ry="10" fill="#5b21b6" />
        <ellipse cx="136" cy="198" rx="17" ry="10" fill="#5b21b6" />

        {/* brazo izquierdo (saluda cuando celebra) */}
        <motion.ellipse
          cx="40"
          cy="138"
          rx="13"
          ry="20"
          fill="#a67cff"
          animate={mood === 'happy' ? { rotate: [0, -35, 0, -35, 0] } : { rotate: mood === 'sad' ? 10 : 0 }}
          transition={{ duration: 0.8, repeat: mood === 'happy' ? Infinity : 0 }}
          style={{ transformBox: 'fill-box', transformOrigin: '80% 20%' }}
        />

        {/* antena con chispa creativa */}
        <path d="M112 56 C112 40 124 34 124 22" stroke="#7c3aed" strokeWidth="6" fill="none" strokeLinecap="round" />
        <motion.path
          d="M124 8 L128 17 L138 18 L130 24 L133 34 L124 28 L115 34 L118 24 L110 18 L120 17 Z"
          fill="#ffd23f"
          stroke="#f5a300"
          strokeWidth="2"
          strokeLinejoin="round"
          animate={{ rotate: [0, 18, -12, 0], scale: mood === 'happy' || mood === 'wow' ? [1, 1.3, 1] : [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={origin}
        />

        {/* cuerpo */}
        <path d="M112 54 C164 54 188 92 188 134 C188 178 156 204 112 204 C68 204 36 178 36 134 C36 92 60 54 112 54 Z" fill={`url(#${grad})`} />
        <ellipse cx="112" cy="160" rx="44" ry="34" fill="rgb(255 255 255 / .22)" />
        <ellipse cx="80" cy="86" rx="17" ry="10" fill="rgb(255 255 255 / .45)" transform="rotate(-32 80 86)" />

        {/* corona (gran final) */}
        {crown && (
          <g>
            <path d="M78 64 L84 32 L100 50 L112 26 L124 50 L140 32 L146 64 Z" fill="#ffd23f" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="112" cy="50" r="5" fill="#ff4fa3" />
            <circle cx="92" cy="56" r="4" fill="#38a3ff" />
            <circle cx="132" cy="56" r="4" fill="#2ee59d" />
          </g>
        )}

        {/* cejas */}
        {mood === 'sad' && (
          <g stroke={INK} strokeWidth="4.5" strokeLinecap="round">
            <line x1="74" y1="100" x2="96" y2="94" />
            <line x1="128" y1="94" x2="150" y2="100" />
          </g>
        )}
        {mood === 'think' && (
          <g stroke={INK} strokeWidth="4.5" strokeLinecap="round">
            <line x1="76" y1="96" x2="98" y2="98" />
            <line x1="126" y1="92" x2="148" y2="96" />
          </g>
        )}

        {/* ojos */}
        {mood === 'happy' ? (
          <g stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round">
            <path d="M76 124 Q88 108 100 124" />
            <path d="M124 124 Q136 108 148 124" />
          </g>
        ) : (
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.8, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            {[88, 136].map((cx) => {
              const big = mood === 'wow'
              const dx = mood === 'think' ? -4 : 0
              const dy = mood === 'think' ? -5 : mood === 'sad' ? 4 : 0
              return (
                <g key={cx}>
                  <ellipse cx={cx} cy="120" rx={big ? 16 : 15} ry={big ? 20 : 17} fill="#fff" />
                  <circle cx={cx + dx} cy={120 + dy} r={big ? 6.5 : 8.5} fill={INK} />
                  <circle cx={cx + dx + 3} cy={116 + dy} r="3" fill="#fff" />
                </g>
              )
            })}
          </motion.g>
        )}

        {/* mejillas */}
        <ellipse cx="68" cy="146" rx="10" ry="6.5" fill="#ff7ab8" opacity=".75" />
        <ellipse cx="156" cy="146" rx="10" ry="6.5" fill="#ff7ab8" opacity=".75" />

        {/* boca */}
        {mood === 'happy' && (
          <g>
            <path d="M92 142 Q112 172 132 142 Z" fill={INK} />
            <ellipse cx="112" cy="156" rx="9" ry="5" fill="#ff5f8a" />
          </g>
        )}
        {mood === 'idle' && <path d="M96 146 Q112 160 128 146" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />}
        {mood === 'sad' && <path d="M98 158 Q112 146 126 158" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />}
        {mood === 'think' && <path d="M102 154 L122 150" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />}
        {mood === 'wow' && <ellipse cx="112" cy="154" rx="9" ry="11" fill={INK} />}

        {/* lágrima */}
        {mood === 'sad' && (
          <motion.path
            d="M74 138 Q70 146 74 150 Q78 146 74 138 Z"
            fill="#7cc8ff"
            animate={{ y: [0, 14], opacity: [1, 0] }}
            transition={{ duration: 1.3, repeat: Infinity }}
          />
        )}

        {/* megáfono + brazo derecho */}
        {megaphone && (
          <g>
            <ellipse cx="182" cy="140" rx="13" ry="18" fill="#a67cff" transform="rotate(-30 182 140)" />
            <g transform="translate(190 118) rotate(-24)">
              <rect x="-4" y="6" width="9" height="20" rx="4" fill="#ff4fa3" />
              <path d="M-10 -9 L-10 9 L38 26 L38 -26 Z" fill={`url(#${meg})`} stroke="#e08e00" strokeWidth="2.5" strokeLinejoin="round" />
              <rect x="-18" y="-6" width="10" height="12" rx="3" fill="#ff4fa3" />
              <ellipse cx="38" cy="0" rx="6" ry="26" fill="#ffc933" stroke="#e08e00" strokeWidth="2.5" />
              {[52, 64, 76].map((x, i) => (
                <motion.path
                  key={x}
                  d={`M${x} -${12 + i * 5} Q${x + 8} 0 ${x} ${12 + i * 5}`}
                  stroke="#fff"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                  animate={{ opacity: [0, 1, 0], x: [0, 5, 10] }}
                  transition={{ duration: mood === 'happy' ? 0.7 : 1.4, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </g>
          </g>
        )}
      </motion.g>
    </svg>
  )
}
