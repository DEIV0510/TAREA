export type ColorKey = 'purple' | 'pink' | 'blue' | 'yellow' | 'green' | 'orange' | 'cyan' | 'red'

export type PowerId = 'double' | 'time' | 'shield' | 'steal' | 'quick'

export type BadgeId =
  | 'first'
  | 'streak3'
  | 'streak5'
  | 'fast3'
  | 'detective'
  | 'strategist'
  | 'clientFav'
  | 'creative'
  | 'untouchable'
  | 'sly'
  | 'comeback'
  | 'tycoon'

export interface Team {
  id: string
  name: string
  members: string
  emoji: string
  /** Foto de avatar (id de PHOTO_AVATARS); si no hay, se muestra el emoji */
  photo?: string | null
  color: ColorKey
  points: number
  coins: number
  coinsEarned: number
  streak: number
  maxStreak: number
  correct: number
  played: number
  fast: number
  l1Correct: number
  l1Played: number
  cards: PowerId[]
  badges: BadgeId[]
  wasLast: boolean
  l2: { productId: string; index: number } | null
  l3: { briefId: string; final: number; creativity: number } | null
}

export type Level = 1 | 2 | 3
export type Stage = 'levelIntro' | 'turnIntro' | 'play' | 'levelComplete' | 'shop' | 'final'
export type Pace = 'normal' | 'relaxed' | 'unlimited'
/** Duración máxima de la partida, en minutos */
export type Duration = 6 | 10

export interface Settings {
  duration: Duration
  pace: Pace
}

/* ───────── Nivel 1 ───────── */

export type L1Type = 'quiz' | 'ad' | 'tf' | 'match' | 'case' | 'sort' | 'odd' | 'order'

export interface AdSpec {
  format: 'poster' | 'post' | 'billboard' | 'story'
  brand: string
  headline: string
  sub?: string
  art: string
  bg: string
  fg?: string
  extra?:
    | { kind: 'stars'; text: string }
    | { kind: 'countdown'; text: string }
    | { kind: 'price'; before: string; now: string }
    | { kind: 'badge'; text: string }
}

/** Diapositiva de la exposición de la que sale el reto */
interface FromSlide {
  slide?: number
}

export interface ChoiceQ extends FromSlide {
  id: string
  type: 'quiz' | 'ad' | 'odd' | 'case'
  prompt: string
  /** La primera opción es la correcta; se barajan al mostrarse. */
  options: string[]
  explain: string
  ad?: AdSpec
  scenario?: string
}

export interface TrueFalseQ extends FromSlide {
  id: string
  type: 'tf'
  statement: string
  truth: boolean
  explain: string
}

export interface MatchQ extends FromSlide {
  id: string
  type: 'match'
  prompt: string
  pairs: [string, string][]
  explain: string
}

export interface OrderQ extends FromSlide {
  id: string
  type: 'order'
  prompt: string
  steps: string[]
  explain: string
}

export interface SortQ extends FromSlide {
  id: string
  type: 'sort'
  prompt: string
  bins: [string, string]
  items: { text: string; bin: 0 | 1 }[]
  explain: string
}

export type L1Question = ChoiceQ | TrueFalseQ | MatchQ | OrderQ | SortQ

/* ───────── Nivel 2 ───────── */

export type L2Field = 'objective' | 'audience' | 'tone' | 'channel' | 'cta'
export type L2Picks = Partial<Record<L2Field, string>>

export interface L2Eval {
  productId: string
  picks: Record<L2Field, string>
  index: number
  parts: { aud: number; ch: number; tone: number; obj: number; cta: number; objch: number }
  verdict: string
  praise: string[]
  tips: string[]
  autoFilled: L2Field[]
}

/* ───────── Nivel 3 ───────── */

export type L3Step = 'concept' | 'audience' | 'channel' | 'message' | 'cta' | 'budget'
export type L3Picks = Partial<Record<L3Step, string>>
export type Dim = 'creatividad' | 'estrategia' | 'publico' | 'canal' | 'conversion'

export interface L3Eval {
  briefId: string
  picks: L3Picks
  dims: Record<Dim, number>
  final: number
  verdict: string
  best: string | null
  worst: string | null
  combos: string[]
  missing: L3Step[]
}

/* ───────── Turnos y resultados ───────── */

export interface ResultLine {
  label: string
  value: number
  tone: 'base' | 'bonus' | 'combo' | 'double' | 'time'
}

export interface TurnResult {
  seq: number
  key: string
  teamId: string
  level: Level
  correct: boolean
  timeout: boolean
  answer: string | null
  elapsed: number
  lines: ResultLine[]
  total: number
  coins: number
  streak: number
  shieldSaved: boolean
  card: PowerId | null
  cardToCoins: boolean
  badges: BadgeId[]
  rankBefore: number
  rankAfter: number
  l2?: L2Eval
  l3?: L3Eval
}

export type GameEvent =
  | { seq: number; kind: 'steal'; thiefId: string; targetId: string; amount: number; rankBefore: number; rankAfter: number; badges: BadgeId[] }
  | { seq: number; kind: 'blocked'; thiefId: string; targetId: string; badges: BadgeId[] }
  | { seq: number; kind: 'gift'; teamId: string; card: PowerId }
  | { seq: number; kind: 'buy'; teamId: string; card: PowerId }
  | { seq: number; kind: 'activate'; teamId: string; card: PowerId }

export interface Mods {
  double: boolean
  time: boolean
  quick: boolean
}

export interface Plan {
  /** Nivel 1: [ronda][equipo] = id de la pregunta */
  l1: string[][]
  /** Nivel 2: producto (el mismo para todas las agencias) */
  l2: string
  /** Nivel 3: brief (el mismo para todas las agencias) */
  l3: string
}

/* ───────── Niveles 2 y 3: todas las agencias juegan a la vez ───────── */

export interface GroupResult {
  teamId: string
  score: number
  total: number
  coins: number
  doubled: boolean
  bonus: number
  card: PowerId | null
  badges: BadgeId[]
  rankBefore: number
  rankAfter: number
  l2?: L2Eval
  l3?: L3Eval
}

export interface GroupState {
  level: 2 | 3
  phase: 'think' | 'input' | 'reveal'
  /** picks[teamId][campo] = id de la opción */
  picks: Record<string, Record<string, string>>
  /** Equipos que usan su carta 🔥 Doble puntos en esta campaña */
  doubles: string[]
  results: GroupResult[] | null
}

export interface GameState {
  v: 2
  gameId: string
  /** Se acabó el reloj de la partida: lo siguiente es la Gran Final */
  timeUp: boolean
  group: GroupState | null
  status: 'setup' | 'playing' | 'finished'
  teams: Team[]
  settings: Settings
  level: Level
  stage: Stage
  round: number
  turn: number
  order: string[]
  plan: Plan
  mods: Mods
  seq: number
  last: TurnResult | null
  event: GameEvent | null
  levelSnap: Record<string, { points: number; coins: number }>
  levelMaxCombo: Record<string, number>
  gift: { teamId: string; card: PowerId } | null
}
