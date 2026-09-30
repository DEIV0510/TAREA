/**
 * Efectos de sonido sintetizados con Web Audio: no hay archivos que descargar
 * y, si el navegador no deja reproducir audio, el juego sigue igual.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function audio(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.5
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface ToneOpts {
  type?: OscillatorType
  vol?: number
  to?: number
  attack?: number
}

function tone(freq: number, at: number, dur: number, o: ToneOpts = {}) {
  const c = audio()
  if (!c || !master) return
  try {
    const t0 = c.currentTime + at
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = o.type ?? 'triangle'
    osc.frequency.setValueAtTime(freq, t0)
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur)
    const v = o.vol ?? 0.22
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack ?? 0.012))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  } catch {
    /* sin audio */
  }
}

function noise(at: number, dur: number, o: { vol?: number; freq?: number; to?: number; q?: number } = {}) {
  const c = audio()
  if (!c || !master) return
  try {
    const t0 = c.currentTime + at
    const len = Math.max(1, Math.floor(c.sampleRate * dur))
    const buf = c.createBuffer(1, len, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = o.q ?? 1
    f.frequency.setValueAtTime(o.freq ?? 1200, t0)
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(o.vol ?? 0.2, t0 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    src.connect(f).connect(g).connect(master)
    src.start(t0)
    src.stop(t0 + dur + 0.05)
  } catch {
    /* sin audio */
  }
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5

export const sfx = {
  click: () => tone(640, 0, 0.07, { vol: 0.14, to: 900 }),
  pop: () => tone(480, 0, 0.1, { type: 'sine', vol: 0.2, to: 1100 }),
  select: () => {
    tone(740, 0, 0.06, { type: 'sine', vol: 0.16 })
    tone(988, 0.05, 0.08, { type: 'sine', vol: 0.14 })
  },
  correct: () => {
    ;[C5, E5, G5, C6].forEach((f, i) => tone(f, i * 0.07, 0.24, { vol: 0.2 }))
    tone(1568, 0.3, 0.35, { type: 'sine', vol: 0.12 })
  },
  wrong: () => {
    tone(330, 0, 0.18, { type: 'sawtooth', vol: 0.08, to: 290 })
    tone(247, 0.17, 0.34, { type: 'sawtooth', vol: 0.08, to: 190 })
  },
  combo: (level = 2) => {
    const base = 520 + level * 70
    tone(base, 0, 0.25, { type: 'square', vol: 0.08, to: base * 2 })
    ;[0, 1, 2].forEach((i) => tone(base * 2 + i * 180, 0.18 + i * 0.06, 0.16, { type: 'sine', vol: 0.12 }))
  },
  coin: () => {
    tone(988, 0, 0.08, { type: 'square', vol: 0.07 })
    tone(1319, 0.07, 0.28, { type: 'square', vol: 0.07 })
  },
  tick: () => tone(1250, 0, 0.05, { type: 'square', vol: 0.05 }),
  whoosh: () => noise(0, 0.45, { vol: 0.18, freq: 300, to: 3200, q: 0.8 }),
  card: () => [0, 1, 2, 3, 4].forEach((i) => tone(1100 + i * 220, i * 0.05, 0.18, { type: 'sine', vol: 0.1 })),
  steal: () => {
    tone(1400, 0, 0.3, { type: 'sawtooth', vol: 0.07, to: 300 })
    noise(0.05, 0.25, { vol: 0.1, freq: 2000, to: 400 })
  },
  shield: () => {
    tone(392, 0, 0.3, { type: 'triangle', vol: 0.18 })
    tone(784, 0.02, 0.4, { type: 'sine', vol: 0.12 })
  },
  badge: () => {
    ;[E5, G5, C6].forEach((f, i) => tone(f, i * 0.06, 0.2, { type: 'sine', vol: 0.14 }))
  },
  rankUp: () => {
    tone(440, 0, 0.12, { type: 'square', vol: 0.07 })
    tone(660, 0.1, 0.12, { type: 'square', vol: 0.07 })
    tone(880, 0.2, 0.3, { type: 'square', vol: 0.08 })
  },
  countdown: (last = false) => tone(last ? 988 : 660, 0, last ? 0.35 : 0.14, { type: 'square', vol: 0.08 }),
  levelUp: () => {
    ;[392, C5, E5, G5].forEach((f, i) => tone(f, i * 0.1, 0.22, { type: 'square', vol: 0.08 }))
    ;[C5, E5, G5, C6].forEach((f) => tone(f, 0.45, 0.6, { vol: 0.1 }))
  },
  drumroll: (dur = 1.6) => {
    const hits = Math.floor(dur / 0.045)
    for (let i = 0; i < hits; i++) noise(i * 0.045, 0.05, { vol: 0.05 + (i / hits) * 0.12, freq: 180, q: 0.7 })
    noise(dur, 0.5, { vol: 0.3, freq: 120, q: 0.5 })
  },
  victory: () => {
    const seq = [C5, C5, C5, C5, 415.3, 466.16, C5, 466.16, C5]
    const times = [0, 0.13, 0.26, 0.4, 0.62, 0.84, 1.06, 1.22, 1.34]
    const durs = [0.1, 0.1, 0.1, 0.22, 0.22, 0.22, 0.14, 0.1, 0.6]
    seq.forEach((f, i) => tone(f, times[i], durs[i], { type: 'square', vol: 0.08 }))
    ;[C5, E5, G5, C6].forEach((f) => tone(f, 1.34, 0.9, { vol: 0.09 }))
  },
}

export type Sfx = keyof typeof sfx
