export function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWith<T>(arr: readonly T[], rand: () => number): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Barajado estable: la misma semilla da siempre el mismo orden (sobrevive a recargas). */
export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  return shuffleWith(arr, mulberry32(hashStr(seed)))
}

export function shuffle<T>(arr: readonly T[]): T[] {
  return shuffleWith(arr, Math.random)
}

export function pickWith<T>(arr: readonly T[], r: number): T {
  return arr[Math.min(arr.length - 1, Math.floor(r * arr.length))]
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}
