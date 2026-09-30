import type { BadgeId, PowerId } from '../types'

export interface PowerInfo {
  id: PowerId
  name: string
  emoji: string
  desc: string
  price: number
  a: string
  b: string
  lip: string
  /** Se activa sola (no hay que tocarla) */
  passive?: boolean
}

export const POWERS: Record<PowerId, PowerInfo> = {
  double: {
    id: 'double',
    name: 'DOBLE PUNTOS',
    emoji: '🔥',
    desc: 'Duplica los puntos del siguiente reto.',
    price: 45,
    a: '#ffb36b',
    b: '#ef3b2d',
    lip: '#8f1d14',
  },
  time: {
    id: 'time',
    name: '+15 SEGUNDOS',
    emoji: '⏰',
    desc: 'Obtén 15 segundos adicionales en tu próximo reto.',
    price: 20,
    a: '#7fd0ff',
    b: '#1d5fe0',
    lip: '#1e3a8a',
  },
  shield: {
    id: 'shield',
    name: 'ESCUDO',
    emoji: '🛡️',
    desc: 'Se activa sola: bloquea un robo o salva tu combo si fallas.',
    price: 25,
    a: '#6ff5bf',
    b: '#0e9f68',
    lip: '#065f46',
    passive: true,
  },
  steal: {
    id: 'steal',
    name: 'ROBO DE PUNTOS',
    emoji: '🎯',
    desc: 'Quítale 150 puntos a otro equipo.',
    price: 35,
    a: '#ff8cc6',
    b: '#c0267a',
    lip: '#831843',
  },
  quick: {
    id: 'quick',
    name: 'RESPUESTA RÁPIDA',
    emoji: '⚡',
    desc: 'Si aciertas en menos de 5 s, ganas +150 extra.',
    price: 25,
    a: '#ffe36e',
    b: '#f59e0b',
    lip: '#92400e',
  },
}

export const POWER_IDS = Object.keys(POWERS) as PowerId[]
export const HAND_MAX = 4
export const STEAL_AMOUNT = 150
export const QUICK_BONUS = 150

export interface BadgeInfo {
  id: BadgeId
  name: string
  emoji: string
  desc: string
}

export const BADGES: Record<BadgeId, BadgeInfo> = {
  first: { id: 'first', name: 'Primer acierto', emoji: '🎯', desc: 'Acertaron su primer reto.' },
  streak3: { id: 'streak3', name: 'En racha', emoji: '🔥', desc: 'Llegaron a COMBO x3.' },
  streak5: { id: 'streak5', name: 'Imparables', emoji: '💥', desc: 'Llegaron a COMBO x5.' },
  fast3: { id: 'fast3', name: 'Rayo', emoji: '⚡', desc: '3 respuestas rápidas.' },
  detective: { id: 'detective', name: 'Detectives', emoji: '🔎', desc: 'Nivel 1 sin errores.' },
  strategist: { id: 'strategist', name: 'Estrategas', emoji: '🧠', desc: 'Índice de campaña de 85 o más.' },
  clientFav: { id: 'clientFav', name: 'Favoritos del cliente', emoji: '👑', desc: 'Brief final con 85 o más.' },
  creative: { id: 'creative', name: 'Mente creativa', emoji: '🎨', desc: 'Creatividad de 90 o más.' },
  untouchable: { id: 'untouchable', name: 'Intocables', emoji: '🛡️', desc: 'Su escudo los salvó.' },
  sly: { id: 'sly', name: 'Astutos', emoji: '🦊', desc: 'Robaron puntos con éxito.' },
  comeback: { id: 'comeback', name: 'Remontada', emoji: '🚀', desc: 'Del último lugar al #1.' },
  tycoon: { id: 'tycoon', name: 'Magnates', emoji: '💰', desc: 'Ganaron 150 monedas.' },
}

export const BADGE_COINS = 10
