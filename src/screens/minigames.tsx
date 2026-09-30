import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Check, Diamond, FolderOpen, Heart, Search, Star, X, Zap, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FakeAd } from '../components/FakeAd'
import { seededShuffle } from '../game/random'
import { useFx } from '../lib/fx'
import { sfx } from '../lib/sound'
import type { ChoiceQ, MatchQ, OrderQ, SortQ, TrueFalseQ } from '../types'

export interface GameProps<Q> {
  q: Q
  seed: string
  /** null mientras se juega; con valor cuando el turno ya se resolvió */
  revealed: { answer: string | null; correct: boolean } | null
  onDone: (correct: boolean, answer: string | null) => void
}

const pointOf = (el: Element) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

function useKeys(handler: (e: KeyboardEvent) => void, active: boolean) {
  useEffect(() => {
    if (!active) return
    const fn = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      handler(e)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  })
}

function Lives({ lives, max = 2 }: { lives: number; max?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${lives} vidas`}>
      {Array.from({ length: max }, (_, i) => (
        <motion.span key={i} animate={i >= lives ? { scale: [1, 1.5, 0.8], opacity: 0.3 } : { scale: 1, opacity: 1 }} className="text-[1.6rem] leading-none">
          {i < lives ? '❤️' : '🖤'}
        </motion.span>
      ))}
    </div>
  )
}

export function PromptCard({ label, text, children }: { label: string; text: string; children?: ReactNode }) {
  return (
    <motion.div className="card-white px-6 py-4 text-center" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className="text-[0.85rem] font-black uppercase tracking-[0.14em] text-grape">{label}</div>
      <h2 className="mt-1 text-[clamp(1.5rem,2.6vw,2.3rem)] font-black leading-[1.15] text-ink">{text}</h2>
      {children}
    </motion.div>
  )
}

/* ───────────────── Opción múltiple (pregunta, anuncio, intruso, caso) ───────────────── */

const TILES: { a: string; b: string; lip: string; fg: string; Icon: LucideIcon; key: string }[] = [
  { a: '#ff7cbc', b: '#de1d7a', lip: '#8f1150', fg: '#fff', Icon: Heart, key: 'A' },
  { a: '#6fc3ff', b: '#1d5fe0', lip: '#1a3a8f', fg: '#fff', Icon: Zap, key: 'B' },
  { a: '#ffe86b', b: '#ffb300', lip: '#b45309', fg: '#1b1036', Icon: Star, key: 'C' },
  { a: '#5cf0b4', b: '#0b9a63', lip: '#05573a', fg: '#fff', Icon: Diamond, key: 'D' },
]

const CHOICE_LABEL: Record<ChoiceQ['type'], string> = {
  quiz: '🔎 Pregunta detective',
  ad: '🖼️ Anuncio misterioso',
  odd: '🕵️ ¿Quién es el intruso?',
  case: '📁 Caso práctico',
}

export function ChoiceGame({ q, seed, revealed, onDone }: GameProps<ChoiceQ>) {
  const fx = useFx()
  const options = useMemo(() => seededShuffle(q.options.map((text, i) => ({ id: String(i), text, correct: i === 0 })), seed), [q, seed])
  const [picked, setPicked] = useState<string | null>(null)
  const chosen = revealed ? revealed.answer : picked
  const locked = !!revealed || picked !== null

  const pick = (id: string, el?: Element | null) => {
    if (locked) return
    setPicked(id)
    if (el) fx.origin.current = pointOf(el)
    onDone(id === '0', id)
  }

  useKeys((e) => {
    const k = e.key.toUpperCase()
    const idx = ['1', '2', '3', '4'].indexOf(k) >= 0 ? ['1', '2', '3', '4'].indexOf(k) : ['A', 'B', 'C', 'D'].indexOf(k)
    if (idx >= 0 && options[idx]) pick(options[idx].id, document.querySelector(`[data-opt="${options[idx].id}"]`))
  }, !locked)

  const grid = (
    <div className={`grid gap-3 ${q.type !== 'ad' ? 'grid-cols-1 sm:grid-cols-2' : q.ad?.format === 'billboard' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'}`}>
      {options.map((o, i) => {
        const t = TILES[i]
        const isRight = o.correct
        const isChosen = chosen === o.id
        const show = !!revealed
        const state = !show ? 'idle' : isRight ? 'right' : isChosen ? 'wrong' : 'dim'
        return (
          <motion.button
            key={o.id}
            data-opt={o.id}
            onClick={(e) => pick(o.id, e.currentTarget)}
            disabled={locked}
            className="relative flex min-h-[4.6rem] items-center gap-3 rounded-[1.3rem] px-4 py-3 text-left disabled:cursor-default"
            style={{
              background: `linear-gradient(180deg, ${t.a}, ${t.b})`,
              color: t.fg,
              boxShadow: `0 .3rem 0 ${t.lip}, 0 .6rem 1.2rem rgb(0 0 0 / .3), inset 0 2px 0 rgb(255 255 255 / .45)${
                state === 'right' ? ', 0 0 0 .3rem #fff, 0 0 2rem #2ee59d' : ''
              }`,
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={
              state === 'right'
                ? { y: 0, opacity: 1, scale: [1, 1.06, 1.03] }
                : state === 'wrong'
                  ? { y: 0, opacity: 0.85, x: [0, -12, 10, -6, 0] }
                  : state === 'dim'
                    ? { y: 0, opacity: 0.35, scale: 0.97 }
                    : { y: 0, opacity: 1 }
            }
            whileHover={locked ? undefined : { scale: 1.03, y: -3 }}
            whileTap={locked ? undefined : { scale: 0.96 }}
            transition={{ delay: revealed ? 0 : 0.05 * i, type: 'spring', stiffness: 380, damping: 22 }}
          >
            <span
              className="font-display grid size-12 shrink-0 place-items-center rounded-xl bg-white/25 text-[1.4rem]"
              aria-hidden
            >
              <t.Icon className="size-6" fill="currentColor" strokeWidth={2} />
            </span>
            <span className="text-[clamp(1.1rem,1.7vw,1.55rem)] font-black leading-tight">
              <span className="sr-only">Opción {t.key}: </span>
              {o.text}
            </span>
            {state === 'right' && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid size-10 place-items-center rounded-full bg-mint text-white shadow-lg ring-4 ring-white">
                <Check className="size-6" strokeWidth={4} />
              </motion.span>
            )}
            {state === 'wrong' && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid size-10 place-items-center rounded-full bg-[#ff3d5e] text-white shadow-lg ring-4 ring-white">
                <X className="size-6" strokeWidth={4} />
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )

  if (q.type === 'ad' && q.ad) {
    return (
      <div className="flex flex-col gap-4">
        <PromptCard label={CHOICE_LABEL.ad} text={q.prompt} />
        <div className={`grid items-center gap-5 ${q.ad.format === 'billboard' ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]' : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'}`}>
          <motion.div initial={{ scale: 0.8, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
            <FakeAd ad={q.ad} />
          </motion.div>
          <div>{grid}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {q.type === 'case' && q.scenario ? (
        <motion.div className="relative" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="font-display absolute -top-4 left-5 z-10 inline-flex items-center gap-2 rounded-t-xl bg-sun px-4 py-1 text-[1.05rem] text-ink">
            <FolderOpen className="size-5" /> CASO PRÁCTICO
          </div>
          <div className="card-white px-6 pb-4 pt-6" style={{ background: '#fff8e6' }}>
            <p className="text-[clamp(1.25rem,2.1vw,1.85rem)] font-extrabold leading-snug text-ink">{q.scenario}</p>
            <p className="mt-3 flex items-center gap-2 text-[1.2rem] font-black text-grape-deep">
              <Search className="size-5" strokeWidth={3} /> {q.prompt}
            </p>
          </div>
        </motion.div>
      ) : (
        <PromptCard label={CHOICE_LABEL[q.type]} text={q.prompt} />
      )}
      {grid}
    </div>
  )
}

/* ───────────────── Mito o realidad ───────────────── */

export function TrueFalseGame({ q, revealed, onDone }: GameProps<TrueFalseQ>) {
  const fx = useFx()
  const [picked, setPicked] = useState<string | null>(null)
  const chosen = revealed ? revealed.answer : picked
  const locked = !!revealed || picked !== null
  const right = q.truth ? 'true' : 'false'

  const pick = (id: 'true' | 'false', el?: Element | null) => {
    if (locked) return
    setPicked(id)
    if (el) fx.origin.current = pointOf(el)
    onDone(id === right, id)
  }
  useKeys((e) => {
    const k = e.key.toLowerCase()
    if (k === 'm' || k === 'arrowleft') pick('false', document.querySelector('[data-tf="false"]'))
    if (k === 'r' || k === 'arrowright') pick('true', document.querySelector('[data-tf="true"]'))
  }, !locked)

  const btn = (id: 'true' | 'false') => {
    const isTrue = id === 'true'
    const state = !revealed ? 'idle' : id === right ? 'right' : chosen === id ? 'wrong' : 'dim'
    return (
      <motion.button
        data-tf={id}
        onClick={(e) => pick(id, e.currentTarget)}
        disabled={locked}
        className="font-display relative flex flex-col items-center justify-center gap-2 rounded-[1.8rem] py-6 text-[clamp(2.4rem,5vw,4rem)] leading-none disabled:cursor-default"
        style={{
          background: isTrue ? 'linear-gradient(180deg,#5cf0b4,#0b9a63)' : 'linear-gradient(180deg,#ff8fb0,#e11d48)',
          color: '#fff',
          boxShadow: `0 .4rem 0 ${isTrue ? '#05573a' : '#881337'}, 0 .8rem 1.6rem rgb(0 0 0 / .35), inset 0 2px 0 rgb(255 255 255 / .45)${
            state === 'right' ? ', 0 0 0 .35rem #fff, 0 0 2.4rem #ffd23f' : ''
          }`,
          textShadow: '0 .06em 0 rgb(0 0 0 / .25)',
        }}
        animate={state === 'right' ? { scale: [1, 1.08, 1.04] } : state === 'wrong' ? { x: [0, -14, 12, -6, 0], opacity: 0.8 } : state === 'dim' ? { opacity: 0.35 } : {}}
        whileHover={locked ? undefined : { scale: 1.04, rotate: isTrue ? 1.5 : -1.5 }}
        whileTap={locked ? undefined : { scale: 0.95 }}
      >
        <span aria-hidden className="text-[1.1em]">
          {isTrue ? '✅' : '❌'}
        </span>
        {isTrue ? 'REALIDAD' : 'MITO'}
        <span className="font-sans text-[1rem] font-extrabold opacity-80">tecla {isTrue ? 'R' : 'M'}</span>
      </motion.button>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <motion.div className="card-white relative px-6 py-7 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="text-[0.85rem] font-black uppercase tracking-[0.14em] text-grape">🤔 ¿Mito o realidad?</div>
        <p className="mt-2 text-[clamp(1.6rem,3vw,2.6rem)] font-black leading-[1.15] text-ink">«{q.statement}»</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-4">
        {btn('false')}
        {btn('true')}
      </div>
    </div>
  )
}

/* ───────────────── Conecta las ideas ───────────────── */

const PAIR_COLORS = ['#ff4fa3', '#38a3ff', '#f59e0b', '#10b981', '#8b5cf6']

export function MatchGame({ q, seed, revealed, onDone }: GameProps<MatchQ>) {
  const fx = useFx()
  const left = useMemo(() => seededShuffle(q.pairs.map((p, i) => ({ i, text: p[0] })), `${seed}-L`), [q, seed])
  const right = useMemo(() => seededShuffle(q.pairs.map((p, i) => ({ i, text: p[1] })), `${seed}-R`), [q, seed])
  const [matched, setMatched] = useState<number[]>([])
  const [selL, setSelL] = useState<number | null>(null)
  const [selR, setSelR] = useState<number | null>(null)
  const [lives, setLives] = useState(2)
  const [bad, setBad] = useState<{ l: number; r: number; n: number } | null>(null)
  const [done, setDone] = useState(false)
  const all = revealed ? q.pairs.map((_, i) => i) : matched
  const locked = !!revealed || done

  const tryPair = (l: number, r: number, el: Element) => {
    if (l === r) {
      sfx.select()
      const next = [...matched, l]
      setMatched(next)
      setSelL(null)
      setSelR(null)
      if (next.length === q.pairs.length) {
        setDone(true)
        fx.origin.current = pointOf(el)
        onDone(true, null)
      }
    } else {
      const lv = lives - 1
      setLives(lv)
      setBad({ l, r, n: Date.now() })
      setSelL(null)
      setSelR(null)
      if (lv <= 0) {
        setDone(true)
        fx.origin.current = pointOf(el)
        onDone(false, null)
      } else sfx.wrong()
    }
  }

  const tapL = (i: number, el: Element) => {
    if (locked || all.includes(i)) return
    sfx.pop()
    if (selR !== null) tryPair(i, selR, el)
    else setSelL(i === selL ? null : i)
  }
  const tapR = (i: number, el: Element) => {
    if (locked || all.includes(i)) return
    sfx.pop()
    if (selL !== null) tryPair(selL, i, el)
    else setSelR(i === selR ? null : i)
  }

  const cell = (side: 'L' | 'R', item: { i: number; text: string }) => {
    const m = all.indexOf(item.i)
    const isM = m >= 0
    const sel = side === 'L' ? selL === item.i : selR === item.i
    const isBad = bad && (side === 'L' ? bad.l === item.i : bad.r === item.i)
    const color = isM ? PAIR_COLORS[item.i % PAIR_COLORS.length] : undefined
    return (
      <motion.button
        key={`${side}-${item.i}-${isBad ? bad?.n : 0}`}
        onClick={(e) => (side === 'L' ? tapL(item.i, e.currentTarget) : tapR(item.i, e.currentTarget))}
        disabled={locked || isM}
        className={`relative flex min-h-[3.8rem] items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-colors ${side === 'L' ? 'font-display text-[1.45rem]' : 'text-[1.12rem] font-extrabold'} ${
          isM ? 'text-white' : sel ? 'bg-sun text-ink' : 'bg-white text-ink hover:bg-[#f3eeff]'
        }`}
        style={{
          background: isM ? color : undefined,
          boxShadow: isM ? `0 .25rem 0 rgb(0 0 0 / .25)` : sel ? '0 .25rem 0 #b45309, 0 0 0 .2rem #fff' : '0 .25rem 0 #d9ceff',
        }}
        animate={isBad ? { x: [0, -10, 9, -5, 0] } : isM ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        {isM && (
          <span className="font-display grid size-8 shrink-0 place-items-center rounded-full bg-white/30 text-[1.05rem]" aria-hidden>
            {item.i + 1}
          </span>
        )}
        <span className="leading-tight">{item.text}</span>
      </motion.button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PromptCard label="🔗 Conecta las ideas" text={q.prompt}>
        <div className="mt-2 flex items-center justify-center gap-4 text-[1rem] font-extrabold text-ink-soft">
          <span>Toca un concepto y luego su pareja</span>
          {!revealed && <Lives lives={lives} />}
        </div>
      </PromptCard>
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 sm:gap-5">
        <div className="flex flex-col gap-2.5">{left.map((it) => cell('L', it))}</div>
        <div className="flex flex-col gap-2.5">{right.map((it) => cell('R', it))}</div>
      </div>
    </div>
  )
}

/* ───────────────── Ordena la jugada ───────────────── */

export function OrderGame({ q, seed, revealed, onDone }: GameProps<OrderQ>) {
  const fx = useFx()
  const chips = useMemo(() => seededShuffle(q.steps.map((text, i) => ({ i, text })), seed), [q, seed])
  const [placed, setPlaced] = useState<number[]>([])
  const [lives, setLives] = useState(2)
  const [bad, setBad] = useState<{ i: number; n: number } | null>(null)
  const [done, setDone] = useState(false)
  const shown = revealed ? q.steps.map((_, i) => i) : placed
  const locked = !!revealed || done

  const tap = (i: number, el: Element) => {
    if (locked || shown.includes(i)) return
    if (i === placed.length) {
      sfx.select()
      const next = [...placed, i]
      setPlaced(next)
      if (next.length === q.steps.length) {
        setDone(true)
        fx.origin.current = pointOf(el)
        onDone(true, null)
      }
    } else {
      const lv = lives - 1
      setLives(lv)
      setBad({ i, n: Date.now() })
      if (lv <= 0) {
        setDone(true)
        fx.origin.current = pointOf(el)
        onDone(false, null)
      } else sfx.wrong()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PromptCard label="🧩 Ordena la jugada" text={q.prompt}>
        <div className="mt-2 flex items-center justify-center gap-4 text-[1rem] font-extrabold text-ink-soft">
          <span>Toquen los pasos del primero al último</span>
          {!revealed && <Lives lives={lives} />}
        </div>
      </PromptCard>
      <LayoutGroup>
        <ol className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(q.steps.length, 5)}, minmax(0, 1fr))` }}>
          {q.steps.map((_, slot) => {
            const i = shown[slot]
            const filled = i !== undefined
            return (
              <li key={slot} className="relative min-h-[5.2rem] rounded-2xl border-[3px] border-dashed border-white/35 bg-white/5 p-1">
                <span className="font-display absolute -left-2 -top-3 z-10 grid size-9 place-items-center rounded-full bg-sun text-[1.2rem] text-ink shadow-[0_.2rem_0_#b45309]">
                  {slot + 1}
                </span>
                {filled && (
                  <motion.div
                    layoutId={`step-${seed}-${i}`}
                    className="grid h-full min-h-[4.6rem] place-items-center rounded-xl bg-gradient-to-b from-[#5cf0b4] to-[#0b9a63] px-2 text-center text-[clamp(0.95rem,1.4vw,1.2rem)] font-black leading-tight text-white shadow-[0_.25rem_0_#05573a]"
                  >
                    {q.steps[i]}
                  </motion.div>
                )}
              </li>
            )
          })}
        </ol>
        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence>
            {chips
              .filter((c) => !shown.includes(c.i))
              .map((c) => (
                <motion.button
                  key={`${c.i}-${bad?.i === c.i ? bad.n : 0}`}
                  layoutId={`step-${seed}-${c.i}`}
                  onClick={(e) => tap(c.i, e.currentTarget)}
                  disabled={locked}
                  className="rounded-2xl bg-white px-5 py-3.5 text-[clamp(1.1rem,1.6vw,1.4rem)] font-black text-ink shadow-[0_.3rem_0_#d9ceff,0_.6rem_1.2rem_rgb(0_0_0/.25)]"
                  animate={bad?.i === c.i ? { x: [0, -12, 10, -6, 0], backgroundColor: ['#ffe1e7', '#ffffff'] } : {}}
                  whileHover={locked ? undefined : { y: -4, scale: 1.04 }}
                  whileTap={locked ? undefined : { scale: 0.94 }}
                >
                  {c.text}
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  )
}

/* ───────────────── Clasifica rápido ───────────────── */

export function SortGame({ q, seed, revealed, onDone }: GameProps<SortQ>) {
  const fx = useFx()
  const items = useMemo(() => seededShuffle(q.items.map((it, i) => ({ ...it, i })), seed), [q, seed])
  const [idx, setIdx] = useState(0)
  const [lives, setLives] = useState(2)
  const [placed, setPlaced] = useState<{ i: number; ok: boolean }[]>([])
  const [fly, setFly] = useState<0 | 1 | null>(null)
  const [shakeN, setShakeN] = useState(0)
  const [done, setDone] = useState(false)
  const locked = !!revealed || done
  const cur = items[idx]

  const send = (bin: 0 | 1, el?: Element | null) => {
    if (locked || !cur || fly !== null) return
    const ok = cur.bin === bin
    if (!ok) setShakeN((n) => n + 1)
    const lv = ok ? lives : lives - 1
    if (ok) sfx.select()
    else if (lv > 0) sfx.wrong()
    setLives(lv)
    setFly(cur.bin)
    const next = [...placed, { i: cur.i, ok }]
    window.setTimeout(() => {
      setPlaced(next)
      setFly(null)
      setIdx((n) => n + 1)
      const finished = next.length === items.length
      if (lv <= 0 || finished) {
        setDone(true)
        if (el) fx.origin.current = pointOf(el)
        onDone(lv > 0, null)
      }
    }, ok ? 280 : 520)
  }

  useKeys((e) => {
    if (e.key === 'ArrowLeft') send(0, document.querySelector('[data-bin="0"]'))
    if (e.key === 'ArrowRight') send(1, document.querySelector('[data-bin="1"]'))
  }, !locked)

  const binList = (b: 0 | 1) => {
    const list = revealed ? items.filter((it) => it.bin === b).map((it) => ({ it, ok: true })) : placed.filter((p) => items.find((x) => x.i === p.i)!.bin === b).map((p) => ({ it: items.find((x) => x.i === p.i)!, ok: p.ok }))
    return list
  }

  const bin = (b: 0 | 1) => (
    <motion.button
      data-bin={b}
      onClick={(e) => send(b, e.currentTarget)}
      disabled={locked}
      className="flex min-h-[15rem] flex-col items-stretch gap-2 rounded-[1.6rem] p-3 text-left disabled:cursor-default"
      style={{
        background: b === 0 ? 'linear-gradient(180deg,#6fc3ff,#1d5fe0)' : 'linear-gradient(180deg,#ff7cbc,#de1d7a)',
        boxShadow: `0 .35rem 0 ${b === 0 ? '#1a3a8f' : '#8f1150'}, 0 .8rem 1.4rem rgb(0 0 0 / .3), inset 0 2px 0 rgb(255 255 255 / .4)`,
      }}
      whileHover={locked ? undefined : { scale: 1.02 }}
      whileTap={locked ? undefined : { scale: 0.97 }}
    >
      <span className="font-display text-center text-[clamp(1.8rem,3.4vw,2.6rem)] leading-none text-white drop-shadow-[0_3px_0_rgb(0_0_0/.25)]">
        {b === 0 ? '⬅️ ' : ''}
        {q.bins[b]}
        {b === 1 ? ' ➡️' : ''}
      </span>
      <div className="flex flex-col gap-1.5">
        {binList(b).map(({ it, ok }) => (
          <motion.span
            key={it.i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[0.98rem] font-extrabold ${ok ? 'bg-white/90 text-ink' : 'bg-[#ffe1e7] text-[#9f1239]'}`}
          >
            {ok ? '✓' : '✗'} {it.text}
          </motion.span>
        ))}
      </div>
    </motion.button>
  )

  return (
    <div className="flex flex-col gap-4">
      <PromptCard label="🗂️ Clasifica rápido" text={q.prompt}>
        <div className="mt-2 flex items-center justify-center gap-4 text-[1rem] font-extrabold text-ink-soft">
          <span>
            Tarjeta {Math.min(idx + 1, items.length)} de {items.length} · toquen el lado correcto (o ← →)
          </span>
          {!revealed && <Lives lives={lives} />}
        </div>
      </PromptCard>
      <div className="grid grid-cols-[1fr_minmax(0,1.1fr)_1fr] items-start gap-3 sm:gap-4">
        {bin(0)}
        <div className="grid min-h-[15rem] place-items-center">
          <AnimatePresence mode="popLayout">
            {!revealed && cur && !done ? (
              <motion.div
                key={`${cur.i}-${shakeN}`}
                className="card-white grid min-h-[9rem] w-full place-items-center px-4 py-5 text-center text-[clamp(1.2rem,2vw,1.7rem)] font-black leading-tight"
                initial={{ y: -60, scale: 0.7, opacity: 0, rotate: -6 }}
                animate={fly !== null ? { x: fly === 0 ? '-120%' : '120%', scale: 0.5, opacity: 0, rotate: fly === 0 ? -20 : 20 } : { y: 0, x: [0, 0], scale: 1, opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {cur.text}
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[4rem]" aria-hidden>
                🗂️
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {bin(1)}
      </div>
    </div>
  )
}
