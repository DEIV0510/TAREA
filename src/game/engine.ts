import { L1_BANK, TYPE_ORDER } from '../data/level1'
import { PRODUCTS } from '../data/level2'
import { BRIEFS } from '../data/level3'
import { BADGE_COINS, HAND_MAX, POWERS, POWER_IDS, QUICK_BONUS, STEAL_AMOUNT } from '../data/powers'
import { TEAM_PRESETS } from '../data/teams'
import type {
  BadgeId,
  ColorKey,
  Duration,
  GameEvent,
  GameState,
  GroupResult,
  Mods,
  Pace,
  Plan,
  PowerId,
  ResultLine,
  Settings,
  Team,
  TurnResult,
} from '../types'
import { mulberry32, pickWith, shuffle, uid } from './random'
import { evaluateL2, evaluateL3 } from './scoring'

export const NO_MODS: Mods = { double: false, time: false, quick: false }
const EMPTY_PLAN: Plan = { l1: [], l2: PRODUCTS[0].id, l3: BRIEFS[0].id }
export const EXTRA_TIME = 15
/** Segundos que tienen todas las agencias para decidir en los niveles 2 y 3 */
export const GROUP_TIME = 60
/** Premio para la mejor campaña de los niveles 2 y 3 */
export const BEST_BONUS = 150

/* ───────────────────────── Equipos ───────────────────────── */

function blankStats(): Omit<Team, 'id' | 'name' | 'members' | 'emoji' | 'color'> {
  return {
    points: 0,
    coins: 0,
    coinsEarned: 0,
    streak: 0,
    maxStreak: 0,
    correct: 0,
    played: 0,
    fast: 0,
    l1Correct: 0,
    l1Played: 0,
    cards: [],
    badges: [],
    wasLast: false,
    l2: null,
    l3: null,
  }
}

export function makeTeam(p: { name: string; emoji: string; color: ColorKey; members?: string; id?: string; photo?: string | null }): Team {
  return { id: p.id ?? uid(), name: p.name, members: p.members ?? '', emoji: p.emoji, photo: p.photo ?? null, color: p.color, ...blankStats() }
}

function resetStats(t: Team): Team {
  return { ...t, ...blankStats() }
}

/* ───────────────────────── Consultas ───────────────────────── */

export function initialState(settings?: Partial<Settings>): GameState {
  return {
    v: 2,
    gameId: '',
    timeUp: false,
    group: null,
    status: 'setup',
    teams: [],
    settings: { duration: 10, pace: 'normal', ...settings },
    level: 1,
    stage: 'levelIntro',
    round: 0,
    turn: 0,
    order: [],
    plan: EMPTY_PLAN,
    mods: NO_MODS,
    seq: 0,
    last: null,
    event: null,
    levelSnap: {},
    levelMaxCombo: {},
    gift: null,
  }
}

export function ranking(teams: Team[]): Team[] {
  return teams.slice().sort((a, b) => b.points - a.points || b.coins - a.coins || a.name.localeCompare(b.name))
}

export function rankOf(teams: Team[], id: string): number {
  return ranking(teams).findIndex((t) => t.id === id) + 1
}

/** Puesto real: 1 + equipos con más puntos. Los empatados comparten puesto. */
export function standing(teams: Team[], id: string): number {
  const me = teams.find((t) => t.id === id)
  if (!me) return teams.length
  return 1 + teams.filter((t) => t.points > me.points).length
}

export function turnKey(s: GameState): string {
  return `${s.level}-${s.round}-${s.turn}`
}

export function currentTeam(s: GameState): Team | undefined {
  const id = s.order[s.turn]
  return s.teams.find((t) => t.id === id)
}

function slotOf(s: GameState, team: Team): number {
  return Math.max(0, s.teams.findIndex((t) => t.id === team.id))
}

export function roundsL1(s: GameState): number {
  return s.plan.l1.length
}

export function questionIdFor(s: GameState, team: Team): string | null {
  const pool = s.plan.l1[s.round]
  if (!pool?.length) return null
  return pool[slotOf(s, team) % pool.length]
}

/**
 * Retos del Nivel 1 por equipo, para que la partida quepa en la duración elegida:
 * los niveles 2 y 3 se juegan en simultáneo, así que el Nivel 1 es el que se ajusta.
 */
export function roundsFor(teams: number, duration: Duration): number {
  const n = Math.max(1, teams)
  return duration === 6 ? Math.max(1, Math.min(2, Math.floor(5 / n))) : Math.max(1, Math.min(4, Math.floor(9 / n)))
}

export function paceFactor(pace: Pace): number | null {
  return pace === 'unlimited' ? null : pace === 'relaxed' ? 1.5 : 1
}

/** Segundos del reloj para el reto actual (null = sin límite). */
export function timeLimit(s: GameState, base: number): number | null {
  const f = paceFactor(s.settings.pace)
  if (f === null) return null
  return Math.round(base * f) + (s.mods.time ? EXTRA_TIME : 0)
}

function orderFor(teams: Team[], round: number): string[] {
  const ids = teams.map((t) => t.id)
  if (!ids.length) return []
  const k = round % ids.length
  return [...ids.slice(k), ...ids.slice(0, k)]
}

function snap(teams: Team[]): GameState['levelSnap'] {
  return Object.fromEntries(teams.map((t) => [t.id, { points: t.points, coins: t.coins }]))
}

function makePlan(settings: Settings, teams: number): Plan {
  const rounds = roundsFor(teams, settings.duration)
  const types = shuffle(TYPE_ORDER)
  const pools = Object.fromEntries(TYPE_ORDER.map((t) => [t, shuffle(L1_BANK.filter((q) => q.type === t).map((q) => q.id))]))
  const used: Record<string, number> = {}
  const l1: string[][] = []
  for (let r = 0; r < rounds; r++) {
    const row: string[] = []
    for (let slot = 0; slot < Math.max(1, teams); slot++) {
      // Cada equipo recibe un minijuego distinto; a lo largo de la partida salen todos.
      const type = types[(r * teams + slot) % types.length]
      const pool = pools[type]
      const k = used[type] ?? 0
      used[type] = k + 1
      row.push(pool[k % pool.length])
    }
    l1.push(row)
  }
  return { l1, l2: pickWith(PRODUCTS, Math.random()).id, l3: pickWith(BRIEFS, Math.random()).id }
}

/** Marca como «estuvo de último» al equipo que va solo en el fondo (para la insignia Remontada). */
function markLast(teams: Team[]): Team[] {
  if (teams.length < 2) return teams
  const r = ranking(teams)
  const last = r[r.length - 1]
  if (last.wasLast || last.points >= r[r.length - 2].points) return teams
  return teams.map((t) => (t.id === last.id ? { ...t, wasLast: true } : t))
}

function giveBadge(t: Team, id: BadgeId, list: BadgeId[]) {
  if (t.badges.includes(id)) return
  t.badges = [...t.badges, id]
  t.coins += BADGE_COINS
  t.coinsEarned += BADGE_COINS
  list.push(id)
}

/* ───────────────────────── Acciones ───────────────────────── */

export type SettleInput = {
  level: 1
  correct: boolean
  timeout: boolean
  elapsed: number
  answer: string | null
  fastLimit: number
  quickLimit: number
  rand: number
}

export type Action =
  | { type: 'setTeams'; teams: Team[]; settings?: Partial<Settings> }
  | { type: 'setSettings'; settings: Partial<Settings> }
  | { type: 'startGame' }
  | { type: 'beginLevel' }
  | { type: 'startTurn' }
  | { type: 'activate'; card: PowerId; targetId?: string }
  | { type: 'deactivate'; card: PowerId }
  | { type: 'settle'; input: SettleInput }
  | { type: 'next' }
  | { type: 'skip' }
  | { type: 'endLevel' }
  | { type: 'groupPhase'; phase: 'think' | 'input' }
  | { type: 'groupPick'; teamId: string; field: string; id: string }
  | { type: 'groupDouble'; teamId: string }
  | { type: 'groupEvaluate'; rand: number }
  | { type: 'toShop'; rand: number }
  | { type: 'buy'; teamId: string; card: PowerId }
  | { type: 'nextLevel'; rand: number }
  | { type: 'timeUp' }
  | { type: 'adjust'; teamId: string; points?: number; coins?: number }
  | { type: 'giveCard'; teamId: string; card: PowerId }
  | { type: 'resetRanking' }
  | { type: 'newGame' }
  | { type: 'hydrate'; state: GameState }

const sum = (lines: ResultLine[]) => lines.reduce((a, l) => a + l.value, 0)

function toFinal(s: GameState): GameState {
  return { ...s, stage: 'final', status: 'finished', mods: NO_MODS, last: null, group: null }
}

function settle(s: GameState, input: SettleInput): GameState {
  const team = currentTeam(s)
  const key = turnKey(s)
  if (!team || s.stage !== 'play' || s.level !== 1 || s.last?.key === key) return s

  const rankBefore = standing(s.teams, team.id)
  const t: Team = { ...team, cards: [...team.cards], badges: [...team.badges] }
  const lines: ResultLine[] = []
  const badges: BadgeId[] = []
  let coins = 0
  let card: PowerId | null = null
  let cardToCoins = false
  let shieldSaved = false

  t.played += 1
  t.l1Played += 1
  if (input.correct) {
    t.streak += 1
    t.correct += 1
    t.l1Correct += 1
    lines.push({ label: 'Respuesta correcta', value: 100, tone: 'base' })
    const fast = input.elapsed <= input.fastLimit
    if (fast) {
      lines.push({ label: '¡Respuesta rápida!', value: 50, tone: 'bonus' })
      t.fast += 1
    }
    if (t.streak >= 2) lines.push({ label: `Combo x${t.streak}`, value: 50 * (Math.min(t.streak, 4) - 1), tone: 'combo' })
    if (s.mods.quick && input.elapsed <= input.quickLimit) lines.push({ label: '⚡ Carta respuesta rápida', value: QUICK_BONUS, tone: 'bonus' })
    coins += 10 + (fast ? 5 : 0) + (t.streak >= 2 ? 5 : 0)
    // Partida corta: la racha de 2 ya premia con una carta.
    if (t.streak === 2 || t.streak === 4) card = pickWith(POWER_IDS, input.rand)
  } else if (t.streak > 0 && t.cards.includes('shield')) {
    t.cards.splice(t.cards.indexOf('shield'), 1)
    shieldSaved = true
  } else {
    t.streak = 0
  }

  const subtotal = sum(lines)
  if (s.mods.double && subtotal > 0) lines.push({ label: '🔥 Doble puntos', value: subtotal, tone: 'double' })
  const total = sum(lines)

  t.points += total
  t.coins += coins
  t.coinsEarned += coins
  t.maxStreak = Math.max(t.maxStreak, t.streak)

  if (card) {
    if (t.cards.length < HAND_MAX) t.cards.push(card)
    else {
      cardToCoins = true
      t.coins += 20
      t.coinsEarned += 20
      coins += 20
    }
  }

  if (input.correct) giveBadge(t, 'first', badges)
  if (t.streak >= 3) giveBadge(t, 'streak3', badges)
  if (t.streak >= 5) giveBadge(t, 'streak5', badges)
  if (t.fast >= 3) giveBadge(t, 'fast3', badges)
  if (t.l1Played >= roundsL1(s) && t.l1Correct === t.l1Played) giveBadge(t, 'detective', badges)
  if (shieldSaved) giveBadge(t, 'untouchable', badges)

  const rankAfter = standing(
    s.teams.map((x) => (x.id === t.id ? t : x)),
    t.id,
  )
  if (rankAfter === 1 && rankBefore > 1 && t.wasLast && s.teams.length >= 3) giveBadge(t, 'comeback', badges)
  if (t.coinsEarned >= 150) giveBadge(t, 'tycoon', badges)
  const teams = markLast(s.teams.map((x) => (x.id === t.id ? t : x)))

  const seq = s.seq + 1
  const result: TurnResult = {
    seq,
    key,
    teamId: t.id,
    level: 1,
    correct: input.correct,
    timeout: input.timeout,
    answer: input.answer,
    elapsed: input.elapsed,
    lines,
    total,
    coins,
    streak: t.streak,
    shieldSaved,
    card,
    cardToCoins,
    badges,
    rankBefore,
    rankAfter,
  }

  return {
    ...s,
    teams,
    seq,
    last: result,
    levelMaxCombo: { ...s.levelMaxCombo, [t.id]: Math.max(s.levelMaxCombo[t.id] ?? 0, t.streak) },
  }
}

/** Niveles 2 y 3: el cliente evalúa todas las campañas a la vez. */
function evaluateGroup(s: GameState, rand: number): GameState {
  const g = s.group
  if (!g || g.phase === 'reveal' || s.stage !== 'play') return s
  const r = mulberry32(Math.floor(rand * 1e9))

  const scored = s.teams.map((team) => {
    const picks = g.picks[team.id] ?? {}
    if (g.level === 2) {
      const ev = evaluateL2(s.plan.l2, picks, r())
      return { team, score: ev.index, l2: ev }
    }
    const ev = evaluateL3(s.plan.l3, picks)
    return { team, score: ev.final, l3: ev }
  })
  const best = Math.max(...scored.map((x) => x.score))

  let teams = s.teams.map((t) => ({ ...t, cards: [...t.cards], badges: [...t.badges] }))
  const before = new Map(s.teams.map((t) => [t.id, standing(s.teams, t.id)]))
  const results: GroupResult[] = []

  for (const x of scored) {
    const t = teams.find((y) => y.id === x.team.id)!
    const badges: BadgeId[] = []
    const base = x.score * (g.level === 2 ? 10 : 15)
    const doubled = g.doubles.includes(t.id) && t.cards.includes('double')
    if (doubled) t.cards.splice(t.cards.indexOf('double'), 1)
    const bonus = x.score === best && best > 0 ? BEST_BONUS : 0
    const total = base * (doubled ? 2 : 1) + bonus
    const coins = Math.round(x.score / (g.level === 2 ? 5 : 4))
    let card: PowerId | null = null
    if (g.level === 2 && x.score >= 90 && t.cards.length < HAND_MAX) {
      card = pickWith(POWER_IDS, r())
      t.cards.push(card)
    }
    t.points += total
    t.coins += coins
    t.coinsEarned += coins
    t.played += 1
    if (x.score >= 70) {
      t.correct += 1
      giveBadge(t, 'first', badges)
    }
    if (x.l2) {
      t.l2 = { productId: s.plan.l2, index: x.l2.index }
      if (x.l2.index >= 85) giveBadge(t, 'strategist', badges)
    }
    if (x.l3) {
      t.l3 = { briefId: s.plan.l3, final: x.l3.final, creativity: x.l3.dims.creatividad }
      if (x.l3.final >= 85) giveBadge(t, 'clientFav', badges)
      if (x.l3.dims.creatividad >= 90) giveBadge(t, 'creative', badges)
    }
    if (t.coinsEarned >= 150) giveBadge(t, 'tycoon', badges)
    results.push({ teamId: t.id, score: x.score, total, coins, doubled, bonus, card, badges, rankBefore: before.get(t.id) ?? 1, rankAfter: 1, l2: x.l2, l3: x.l3 })
  }

  for (const res of results) {
    res.rankAfter = standing(teams, res.teamId)
    const t = teams.find((y) => y.id === res.teamId)!
    if (res.rankAfter === 1 && res.rankBefore > 1 && t.wasLast && teams.length >= 3) giveBadge(t, 'comeback', res.badges)
  }
  teams = markLast(teams)
  results.sort((a, b) => b.score - a.score || b.total - a.total)

  // Lo que una agencia no alcanzó a elegir: al azar en el Nivel 2, «sin decidir» en el Nivel 3.
  return { ...s, teams, seq: s.seq + 1, group: { ...g, phase: 'reveal', results } }
}

function advance(s: GameState): GameState {
  if (s.timeUp) return toFinal(s)
  const base: GameState = { ...s, mods: NO_MODS, last: null }
  if (s.level !== 1) {
    // Niveles 2 y 3: una sola jugada en grupo.
    return s.level === 3 ? toFinal(base) : { ...base, group: null, stage: 'levelComplete' }
  }
  if (s.turn + 1 < s.order.length) return { ...base, turn: s.turn + 1, stage: 'turnIntro' }
  if (s.round + 1 < roundsL1(s)) {
    return { ...base, round: s.round + 1, turn: 0, order: orderFor(s.teams, s.round + 1), stage: 'turnIntro' }
  }
  return { ...base, stage: 'levelComplete' }
}

function startGame(s: GameState): GameState {
  // Todas las agencias arrancan con una carta de poder de regalo.
  const teams = s.teams.map((t) => ({ ...resetStats(t), cards: [pickWith(POWER_IDS, Math.random())] }))
  return {
    ...initialState(s.settings),
    gameId: uid(),
    teams,
    status: 'playing',
    plan: makePlan(s.settings, teams.length),
    levelSnap: snap(teams),
    seq: s.seq + 1,
  }
}

type EventInput = GameEvent extends infer E ? (E extends GameEvent ? Omit<E, 'seq'> : never) : never

function withEvent(s: GameState, ev: EventInput): Pick<GameState, 'seq' | 'event'> {
  const seq = s.seq + 1
  return { seq, event: { ...ev, seq } as GameEvent }
}

/** Regalo de remontada: una carta para el equipo que va solo en el último lugar. */
function withGift(s: GameState, rand: number): GameState {
  if (s.gift) return s
  const r = ranking(s.teams)
  if (r.length < 2 || r[r.length - 1].points >= r[r.length - 2].points) return s
  const last = r[r.length - 1]
  if (last.cards.length >= HAND_MAX) return s
  const card = pickWith(POWER_IDS, rand)
  const teams = s.teams.map((t) => (t.id === last.id ? { ...t, cards: [...t.cards, card] } : t))
  return { ...s, teams, gift: { teamId: last.id, card }, ...withEvent(s, { kind: 'gift', teamId: last.id, card }) }
}

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'hydrate':
      return a.state

    case 'setTeams': {
      const settings = { ...s.settings, ...a.settings }
      if (s.status !== 'playing') return { ...s, teams: a.teams, settings }
      // Partida en curso: se conservan puntos de los equipos que siguen.
      const byId = new Map(s.teams.map((t) => [t.id, t]))
      const teams = a.teams.map((t) => {
        const prev = byId.get(t.id)
        return prev ? { ...prev, name: t.name, members: t.members, emoji: t.emoji, photo: t.photo ?? null, color: t.color } : t
      })
      const ids = new Set(teams.map((t) => t.id))
      const currentId = s.order[s.turn]
      let order = s.order.filter((id) => ids.has(id))
      if (s.level === 1) for (const t of teams) if (!order.includes(t.id)) order = [...order, t.id]
      let turn = currentId && ids.has(currentId) ? order.indexOf(currentId) : Math.min(s.turn, Math.max(0, order.length - 1))
      if (turn < 0) turn = 0
      const lostCurrent = !!currentId && !ids.has(currentId) && s.level === 1
      const stage = lostCurrent && (s.stage === 'play' || s.stage === 'turnIntro') ? 'turnIntro' : s.stage
      const levelSnap = { ...snap(teams), ...s.levelSnap }
      return { ...s, teams, order, turn, stage, levelSnap, settings: { ...settings, duration: s.settings.duration }, last: lostCurrent ? null : s.last }
    }

    case 'setSettings': {
      const settings = { ...s.settings, ...a.settings }
      if (s.status === 'playing') settings.duration = s.settings.duration
      return { ...s, settings }
    }

    case 'startGame':
      return s.teams.length >= 2 ? startGame(s) : s

    case 'beginLevel':
      if (s.stage !== 'levelIntro') return s
      if (s.timeUp) return toFinal(s)
      if (s.level === 1) return { ...s, stage: 'turnIntro', turn: 0, round: 0, order: orderFor(s.teams, 0), mods: NO_MODS, last: null }
      return {
        ...s,
        stage: 'play',
        turn: 0,
        round: 0,
        order: s.teams.map((t) => t.id),
        mods: NO_MODS,
        last: null,
        group: { level: s.level, phase: 'think', picks: {}, doubles: [], results: null },
      }

    case 'startTurn':
      return s.stage === 'turnIntro' && s.level === 1 && currentTeam(s) ? { ...s, stage: 'play' } : s

    case 'activate': {
      const team = currentTeam(s)
      if (!team || s.stage !== 'turnIntro' || !team.cards.includes(a.card)) return s
      const cards = [...team.cards]
      cards.splice(cards.indexOf(a.card), 1)

      if (a.card === 'steal') {
        const target = s.teams.find((t) => t.id === a.targetId)
        if (!target || target.id === team.id) return s
        const rankBefore = standing(s.teams, team.id)
        if (target.cards.includes('shield')) {
          const tCards = [...target.cards]
          tCards.splice(tCards.indexOf('shield'), 1)
          const tt: Team = { ...target, cards: tCards }
          const badges: BadgeId[] = []
          giveBadge(tt, 'untouchable', badges)
          const teams = s.teams.map((x) => (x.id === team.id ? { ...team, cards } : x.id === tt.id ? tt : x))
          return { ...s, teams, ...withEvent(s, { kind: 'blocked', thiefId: team.id, targetId: target.id, badges }) }
        }
        const amount = Math.min(STEAL_AMOUNT, target.points)
        const thief: Team = { ...team, cards, points: team.points + amount, badges: [...team.badges] }
        const badges: BadgeId[] = []
        if (amount > 0) giveBadge(thief, 'sly', badges)
        let teams = s.teams.map((x) => (x.id === thief.id ? thief : x.id === target.id ? { ...target, points: target.points - amount } : x))
        const rankAfter = standing(teams, thief.id)
        if (rankAfter === 1 && rankBefore > 1 && thief.wasLast && teams.length >= 3) {
          giveBadge(thief, 'comeback', badges)
          teams = teams.map((x) => (x.id === thief.id ? thief : x))
        }
        teams = markLast(teams)
        return {
          ...s,
          teams,
          ...withEvent(s, { kind: 'steal', thiefId: thief.id, targetId: target.id, amount, rankBefore, rankAfter, badges }),
        }
      }

      if (POWERS[a.card].passive || s.mods[a.card as keyof Mods]) return s
      if (a.card === 'time' && paceFactor(s.settings.pace) === null) return s
      const teams = s.teams.map((x) => (x.id === team.id ? { ...team, cards } : x))
      return { ...s, teams, mods: { ...s.mods, [a.card]: true }, ...withEvent(s, { kind: 'activate', teamId: team.id, card: a.card }) }
    }

    case 'deactivate': {
      const team = currentTeam(s)
      const k = a.card as keyof Mods
      if (!team || s.stage !== 'turnIntro' || !(k in s.mods) || !s.mods[k]) return s
      const teams = s.teams.map((x) => (x.id === team.id ? { ...team, cards: [...team.cards, a.card] } : x))
      return { ...s, teams, mods: { ...s.mods, [k]: false } }
    }

    case 'settle':
      return settle(s, a.input)

    case 'next':
      if (s.stage === 'play' && s.group && s.group.phase !== 'reveal') return s
      return s.stage === 'play' || s.stage === 'turnIntro' ? advance(s) : s

    case 'skip':
      if (s.level !== 1 || (s.stage !== 'play' && s.stage !== 'turnIntro')) return s
      // Devuelve las cartas activadas y pasa al siguiente turno sin tocar puntos ni combo.
      if (s.last?.key !== turnKey(s)) {
        const team = currentTeam(s)
        const back = (Object.keys(s.mods) as (keyof Mods)[]).filter((k) => s.mods[k]) as PowerId[]
        if (team && back.length) {
          const teams = s.teams.map((x) => (x.id === team.id ? { ...team, cards: [...team.cards, ...back] } : x))
          return advance({ ...s, teams })
        }
      }
      return advance(s)

    case 'endLevel':
      if (s.status !== 'playing') return s
      if (s.level === 3 || s.timeUp) return toFinal(s)
      return { ...s, stage: 'levelComplete', mods: NO_MODS, last: null, group: null }

    case 'groupPhase':
      if (!s.group || s.group.phase === 'reveal') return s
      return { ...s, group: { ...s.group, phase: a.phase } }

    case 'groupPick': {
      if (!s.group || s.group.phase === 'reveal') return s
      const cur = s.group.picks[a.teamId] ?? {}
      return { ...s, group: { ...s.group, picks: { ...s.group.picks, [a.teamId]: { ...cur, [a.field]: a.id } } } }
    }

    case 'groupDouble': {
      if (!s.group || s.group.phase === 'reveal') return s
      const team = s.teams.find((t) => t.id === a.teamId)
      if (!team?.cards.includes('double')) return s
      const on = s.group.doubles.includes(a.teamId)
      return { ...s, group: { ...s.group, doubles: on ? s.group.doubles.filter((x) => x !== a.teamId) : [...s.group.doubles, a.teamId] } }
    }

    case 'groupEvaluate':
      return evaluateGroup(s, a.rand)

    case 'toShop':
      if (s.stage !== 'levelComplete') return s
      if (s.timeUp) return toFinal(s)
      return { ...withGift(s, a.rand), stage: 'shop' }

    case 'buy': {
      if (s.stage !== 'shop') return s
      const p = POWERS[a.card]
      const team = s.teams.find((t) => t.id === a.teamId)
      if (!team || team.coins < p.price || team.cards.length >= HAND_MAX) return s
      const teams = s.teams.map((t) => (t.id === team.id ? { ...t, coins: t.coins - p.price, cards: [...t.cards, a.card] } : t))
      return { ...s, teams, ...withEvent(s, { kind: 'buy', teamId: team.id, card: a.card }) }
    }

    case 'nextLevel': {
      if ((s.stage !== 'shop' && s.stage !== 'levelComplete') || s.level === 3) return s
      if (s.timeUp) return toFinal(s)
      const g = s.stage === 'levelComplete' ? withGift(s, a.rand) : s
      return {
        ...g,
        level: (s.level + 1) as 2 | 3,
        stage: 'levelIntro',
        round: 0,
        turn: 0,
        order: [],
        mods: NO_MODS,
        last: null,
        gift: null,
        group: null,
        levelSnap: snap(g.teams),
        levelMaxCombo: {},
      }
    }

    case 'timeUp': {
      if (s.status !== 'playing' || s.timeUp) return s
      const t = { ...s, timeUp: true }
      // Si nadie está en medio de una jugada, vamos directo a la Gran Final.
      if (s.stage === 'levelIntro' || s.stage === 'levelComplete' || s.stage === 'shop' || s.stage === 'turnIntro') return toFinal(t)
      return t
    }

    case 'adjust': {
      const teams = markLast(
        s.teams.map((t) =>
          t.id === a.teamId ? { ...t, points: Math.max(0, t.points + (a.points ?? 0)), coins: Math.max(0, t.coins + (a.coins ?? 0)) } : t,
        ),
      )
      return { ...s, teams }
    }

    case 'giveCard': {
      const teams = s.teams.map((t) => (t.id === a.teamId && t.cards.length < HAND_MAX ? { ...t, cards: [...t.cards, a.card] } : t))
      return { ...s, teams }
    }

    case 'resetRanking': {
      const teams = s.teams.map(resetStats)
      return { ...s, teams, levelSnap: snap(teams), levelMaxCombo: {}, mods: NO_MODS }
    }

    case 'newGame':
      return initialState(s.settings)
  }
}

/* ───────────────────────── Persistencia ───────────────────────── */

export const STORAGE_KEY = 'adbattle:game:v2'

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const s = JSON.parse(raw) as GameState
    if (s?.v !== 2 || !Array.isArray(s.teams)) return initialState()
    // Equipos guardados antes de las fotos: reciben la foto de su equipo de ejemplo.
    const teams = s.teams.map((t) => (t.photo === undefined ? { ...t, photo: TEAM_PRESETS.find((p) => p.name === t.name)?.photo ?? null } : t))
    return { ...initialState(), ...s, teams, event: null }
  } catch {
    return initialState()
  }
}

export function saveState(s: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* modo privado o almacenamiento lleno: el juego sigue en memoria */
  }
}
