import foto1 from '../assets/avatars/foto-1.webp'
import foto2 from '../assets/avatars/foto-2.webp'
import foto3 from '../assets/avatars/foto-3.webp'
import foto4 from '../assets/avatars/foto-4.webp'
import foto5 from '../assets/avatars/foto-5.webp'
import type { ColorKey } from '../types'

/** Fotos de avatar que eligió el usuario (carpeta «publi»). */
export const PHOTO_AVATARS: { id: string; src: string }[] = [
  { id: 'foto-1', src: foto1 },
  { id: 'foto-2', src: foto2 },
  { id: 'foto-3', src: foto3 },
  { id: 'foto-4', src: foto4 },
  { id: 'foto-5', src: foto5 },
]

export const PHOTO_BY_ID: Record<string, string> = Object.fromEntries(PHOTO_AVATARS.map((p) => [p.id, p.src]))

export interface Swatch {
  name: string
  /** Color claro del degradado */
  a: string
  /** Color principal del degradado */
  b: string
  /** "Labio" inferior del botón 3D */
  lip: string
  /** Texto sobre el degradado */
  text: string
}

export const TEAM_COLORS: Record<ColorKey, Swatch> = {
  purple: { name: 'Morado', a: '#b594ff', b: '#7c3aed', lip: '#4c1d95', text: '#ffffff' },
  pink: { name: 'Rosa', a: '#ff84bf', b: '#e11d74', lip: '#9d174d', text: '#ffffff' },
  blue: { name: 'Azul', a: '#6cc0ff', b: '#1d5fe0', lip: '#1e3a8a', text: '#ffffff' },
  yellow: { name: 'Amarillo', a: '#ffe36e', b: '#f5a300', lip: '#a15c07', text: '#1b1036' },
  green: { name: 'Verde', a: '#62f0b6', b: '#0e9f68', lip: '#065f46', text: '#ffffff' },
  orange: { name: 'Naranja', a: '#ffb27a', b: '#f0580a', lip: '#9a3412', text: '#ffffff' },
  cyan: { name: 'Turquesa', a: '#6fe9f7', b: '#0891b2', lip: '#155e75', text: '#ffffff' },
  red: { name: 'Rojo', a: '#ff8f9f', b: '#e11d48', lip: '#881337', text: '#ffffff' },
}

export const COLOR_KEYS = Object.keys(TEAM_COLORS) as ColorKey[]

export const AVATARS = [
  '🚀', '🔥', '💡', '🐸', '⚡', '🦄', '🐙', '🦊', '🐼', '🦁', '🐯', '🐵',
  '🦖', '👾', '🤖', '🎯', '🎨', '📣', '💎', '🍕', '🌮', '🌈', '⭐', '🍀',
  '🐝', '🦋', '🐬', '🦉', '🎸', '🧠', '👑', '🥑',
]

export const TEAM_PRESETS: { name: string; emoji: string; color: ColorKey; photo?: string }[] = [
  { name: 'Los Creativos', emoji: '🚀', color: 'purple', photo: 'foto-1' },
  { name: 'Los Campañeros', emoji: '🔥', color: 'orange', photo: 'foto-2' },
  { name: 'Brain Ads', emoji: '💡', color: 'yellow', photo: 'foto-3' },
  { name: 'Los Publicistas', emoji: '🐸', color: 'green', photo: 'foto-4' },
  { name: 'Ad Squad', emoji: '⚡', color: 'blue', photo: 'foto-5' },
  { name: 'Viral Kings', emoji: '🦄', color: 'pink' },
]

export const MAX_TEAMS = 6
export const MIN_TEAMS = 2
