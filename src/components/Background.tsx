import { Coins, Heart, Megaphone, Sparkles, Star, Trophy, Zap } from 'lucide-react'
import { memo } from 'react'

const ICONS = [Star, Heart, Zap, Coins, Sparkles, Trophy, Megaphone]
const COLORS = ['#ffd23f', '#ff4fa3', '#38a3ff', '#2ee59d', '#b594ff', '#ffffff']

// Posiciones fijas (no aleatorias) para que el fondo no "salte" entre renders.
const FLOATERS = Array.from({ length: 16 }, (_, i) => ({
  Icon: ICONS[i % ICONS.length],
  color: COLORS[(i * 5) % COLORS.length],
  left: (i * 37 + 7) % 100,
  size: 1.1 + ((i * 13) % 7) * 0.28,
  dur: 16 + ((i * 7) % 10) * 1.6,
  delay: -((i * 3.7) % 20),
  o: 0.18 + ((i * 11) % 5) * 0.05,
}))

/** Fondo vivo: degradado morado, manchas de color que se mueven y objetos flotando. Solo CSS (transform/opacity). */
export const Background = memo(function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, var(--bg-1) 0%, var(--bg-2) 55%, var(--bg-3) 100%)' }}
      />
      <div
        className="absolute -left-[20vmax] -top-[20vmax] h-[70vmax] w-[70vmax] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(255 79 163 / .38), transparent 62%)', animation: 'drift 18s ease-in-out infinite' }}
      />
      <div
        className="absolute -right-[22vmax] top-[5vh] h-[65vmax] w-[65vmax] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(56 163 255 / .32), transparent 62%)', animation: 'drift 22s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute bottom-[-35vmax] left-[20vw] h-[70vmax] w-[70vmax] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(139 92 246 / .45), transparent 62%)', animation: 'drift 26s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-[10vmax] -right-[10vmax] h-[40vmax] w-[40vmax] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(46 229 157 / .18), transparent 62%)', animation: 'drift 20s ease-in-out infinite reverse' }}
      />
      {/* trama de puntos */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(#fff 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }}
      />
      {FLOATERS.map(({ Icon, color, left, size, dur, delay, o }, i) => (
        <div
          key={i}
          className="bg-rise absolute bottom-[-10vh]"
          style={{
            left: `${left}%`,
            animation: `rise ${dur}s linear ${delay}s infinite`,
            ['--o' as string]: o,
          }}
        >
          <Icon style={{ width: `${size}rem`, height: `${size}rem`, color }} fill={i % 3 === 0 ? color : 'none'} strokeWidth={2.2} />
        </div>
      ))}
    </div>
  )
})
