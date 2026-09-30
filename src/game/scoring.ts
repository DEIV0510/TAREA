import { AUD_CH, AUD_TONE, L2_FIELDS, OBJ_CH, OBJ_CTA, PRODUCT_BY_ID, l2Option } from '../data/level2'
import { BRIEF_BY_ID, DIMS, L3_STEPS, type L3Option } from '../data/level3'
import type { Dim, L2Eval, L2Field, L2Picks, L3Eval, L3Picks, L3Step } from '../types'
import { mulberry32 } from './random'

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

function bestKey(table: Record<string, number>): string {
  return Object.entries(table).sort((a, b) => b[1] - a[1])[0][0]
}

/* ───────────────────────── Nivel 2: índice de campaña ───────────────────────── */

export function evaluateL2(productId: string, raw: L2Picks, rand: number): L2Eval {
  const p = PRODUCT_BY_ID[productId]
  // Si se acabó el tiempo, el cliente completa al azar lo que faltó.
  const r = mulberry32(Math.floor(rand * 1e9))
  const autoFilled: L2Field[] = []
  const picks = {} as Record<L2Field, string>
  for (const f of L2_FIELDS) {
    const v = raw[f.key]
    if (v) picks[f.key] = v
    else {
      picks[f.key] = f.options[Math.floor(r() * f.options.length)].id
      autoFilled.push(f.key)
    }
  }
  const { objective: o, audience: a, tone: t, channel: c, cta } = picks

  const parts = {
    aud: p.aud[a],
    ch: AUD_CH[a][c],
    tone: Math.round((p.tone[t] + AUD_TONE[a][t]) / 2),
    obj: p.obj[o],
    cta: OBJ_CTA[o][cta],
    objch: OBJ_CH[o][c],
  }
  const raw100 = 0.24 * parts.aud + 0.2 * parts.ch + 0.2 * parts.tone + 0.12 * parts.obj + 0.14 * parts.cta + 0.1 * parts.objch
  const index = Math.round(clamp(100 * Math.pow(raw100 / 100, 1.3)))

  const L = (field: L2Field, id: string) => l2Option(field, id)?.label ?? id
  const aud = L('audience', a)
  const ch = L('channel', c)
  const tone = L('tone', t)
  const obj = L('objective', o)
  const ctaL = L('cta', cta)

  const praise: string[] = []
  if (parts.aud >= 85 && parts.ch >= 85 && parts.tone >= 85) praise.push('Excelente combinación entre público, tono y canal.')
  else {
    if (parts.aud >= 85) praise.push(`${aud} es el público ideal para ${p.name}.`)
    if (parts.ch >= 85) praise.push(`${ch} es justo donde ${lower(aud)} pasan su tiempo.`)
    if (parts.tone >= 85) praise.push(`El tono ${lower(tone)} encaja con la personalidad de la marca.`)
  }
  if (parts.cta >= 85) praise.push('Tu llamado a la acción empuja justo el objetivo elegido.')

  // Tono ideal = el que mejor equilibra la marca y el público elegido.
  const toneScore = (x: string) => (p.tone[x] + AUD_TONE[a][x]) / 2
  const bestTone = Object.keys(AUD_TONE[a]).sort((x, y) => toneScore(y) - toneScore(x))[0]
  const toneWhy =
    p.tone[t] < AUD_TONE[a][t] ? `no va con la personalidad de ${p.name}` : `se siente lejano para ${lower(aud)}`
  const bestCh = Object.keys(AUD_CH[a]).sort((x, y) => AUD_CH[a][y] + OBJ_CH[o][y] - (AUD_CH[a][x] + OBJ_CH[o][x]))[0]

  // Cada consejo solo aparece si propone algo distinto de lo que el equipo ya eligió.
  const weak: { score: number; text: string; same: boolean }[] = [
    {
      score: parts.aud,
      same: bestKey(p.aud) === a,
      text: `${p.name} no le habla naturalmente a ${lower(aud)}. Su público ideal: ${lower(L('audience', bestKey(p.aud)))}.`,
    },
    {
      score: parts.ch,
      same: bestCh === c,
      text: `El público elegido no coincide completamente con el canal: ${lower(aud)} casi no están en ${ch}. Mejor: ${L('channel', bestCh)}.`,
    },
    {
      score: parts.tone,
      same: bestTone === t,
      text: `El tono ${lower(tone)} ${toneWhy}. Encaja mejor un tono ${lower(L('tone', bestTone))}.`,
    },
    {
      score: parts.obj,
      same: bestKey(p.obj) === o,
      text: `${p.name} es ${p.stage}: la prioridad debería ser ${lower(L('objective', bestKey(p.obj)))}.`,
    },
    {
      score: parts.cta,
      same: bestKey(OBJ_CTA[o]) === cta,
      text: `«${ctaL}» no empuja un objetivo de ${lower(obj)}. Mejor: «${L('cta', bestKey(OBJ_CTA[o]))}».`,
    },
    { score: parts.objch, same: false, text: `${ch} no es el canal más fuerte para ${lower(obj)}.` },
  ]
  const tips = weak
    .filter((w) => w.score < 65 && !w.same)
    .sort((x, y) => x.score - y.score)
    .slice(0, 2)
    .map((w) => w.text)

  if (!praise.length && index >= 60) praise.push('Buena base: las piezas principales tienen sentido.')

  const verdict =
    index >= 90 ? '¡CAMPAÑA BRILLANTE!' : index >= 75 ? '¡MUY BUENA CAMPAÑA!' : index >= 55 ? 'BUENA IDEA, HAY QUE AJUSTAR' : 'EL CLIENTE ESTÁ CONFUNDIDO'

  return { productId, picks, index, parts, verdict, praise: praise.slice(0, 2), tips, autoFilled }
}

/* ───────────────────────── Nivel 3: evaluación del brief ───────────────────────── */

const MISSING: L3Option = { id: '-', title: 'Sin decidir', emoji: '❔', s: 20, c: 15, v: 15, why: 'Faltó tomar esta decisión.' }

export function evaluateL3(briefId: string, picks: L3Picks): L3Eval {
  const brief = BRIEF_BY_ID[briefId]
  const missing: L3Step[] = []
  const get = (step: L3Step): L3Option => {
    const o = brief.steps[step].find((x) => x.id === picks[step])
    if (!o) {
      missing.push(step)
      return MISSING
    }
    return o
  }
  const concept = get('concept')
  const audience = get('audience')
  const channel = get('channel')
  const message = get('message')
  const cta = get('cta')
  const budget = get('budget')

  const dims: Record<Dim, number> = {
    creatividad: 0.55 * (concept.c ?? concept.s) + 0.45 * (message.c ?? message.s),
    estrategia: 0.35 * concept.s + 0.4 * budget.s + 0.25 * audience.s,
    publico: 0.6 * audience.s + 0.25 * message.s + 0.15 * channel.s,
    canal: 0.65 * channel.s + 0.35 * budget.s,
    conversion: 0.5 * cta.s + 0.3 * (channel.v ?? channel.s) + 0.2 * message.s,
  }

  const chosen = new Set(Object.values(picks))
  const combos: string[] = []
  for (const combo of brief.combos) {
    if (chosen.has(combo.a) && chosen.has(combo.b)) {
      combos.push(combo.note)
      for (const [k, v] of Object.entries(combo.dims) as [Dim, number][]) dims[k] += v
    }
  }
  for (const d of DIMS) dims[d.key] = Math.round(clamp(dims[d.key]))

  const final = Math.round(DIMS.reduce((sum, d) => sum + dims[d.key], 0) / DIMS.length)

  const decided = L3_STEPS.filter((s) => !missing.includes(s.key)).map((s) => get(s.key))
  const sorted = decided.slice().sort((x, y) => y.s - x.s)
  const best = sorted.length ? sorted[0].why : null
  const low = sorted.length ? sorted[sorted.length - 1] : null
  const worst = missing.length
    ? `Faltó decidir: ${missing.map((m) => L3_STEPS.find((s) => s.key === m)!.label.toLowerCase()).join(', ')}.`
    : low && low.s < 80
      ? low.why
      : null

  const verdict =
    final >= 90
      ? '«¡Me encanta! Firmemos hoy mismo.»'
      : final >= 75
        ? '«Muy buena propuesta. Ajustemos detalles y arrancamos.»'
        : final >= 55
          ? '«Tiene cosas buenas, pero no me convence del todo.»'
          : '«Mmm… esto no es lo que buscaba.»'

  return { briefId, picks, dims, final, verdict, best, worst, combos, missing }
}

export function creativityLabel(n: number): string {
  if (n >= 90) return 'Genio creativo'
  if (n >= 75) return 'Muy creativa'
  if (n >= 55) return 'Creativa'
  if (n > 0) return 'Con potencial'
  return 'Sin medir'
}
