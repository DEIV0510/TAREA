import type { Level } from '../types'

export interface LevelInfo {
  n: Level
  title: string
  emoji: string
  theme: string
  a: string
  b: string
  bullets: string[]
  done: string
}

export const LEVELS: Record<Level, LevelInfo> = {
  1: {
    n: 1,
    title: 'DETECTIVE PUBLICITARIO',
    emoji: '🔎',
    theme: 'Reconoce la estrategia',
    a: '#38a3ff',
    b: '#6d28d9',
    bullets: [
      'Todo sale de la exposición: qué es la publicidad, características, cifras y estrategias.',
      'Minijuegos por turnos. Correcta +100 · Rápida +50 · Rachas = COMBO x2, x3, x4.',
      'Fallar no resta puntos. ¡Arriesguen!',
    ],
    done: 'Tu equipo ya piensa como una agencia.',
  },
  2: {
    n: 2,
    title: 'CREADORES DE CAMPAÑAS',
    emoji: '🎨',
    theme: 'Todas las agencias, el mismo producto',
    a: '#ff4fa3',
    b: '#f59e0b',
    bullets: [
      'Todas las agencias juegan a la vez con el mismo producto: 60 segundos para decidir.',
      'Elijan objetivo (informar, persuadir, recordar o emocionar), público, tono, canal y llamado a la acción.',
      'ÍNDICE DE CAMPAÑA × 10 = puntos. La mejor campaña gana +150 🏆.',
    ],
    done: 'Ya saben crear campañas que conectan.',
  },
  3: {
    n: 3,
    title: 'EL CLIENTE FINAL',
    emoji: '👑',
    theme: 'Un brief, 60 segundos, todas las agencias',
    a: '#ffd23f',
    b: '#ef4444',
    bullets: [
      'Llega un brief con cliente, presupuesto y problema. Todas las agencias lo resuelven a la vez.',
      '6 decisiones en 60 segundos: concepto, público, canal, mensaje, CTA y presupuesto.',
      'Puntuación × 15 + 🏆 150 a la mejor campaña.',
    ],
    done: 'La campaña está lista para el cliente.',
  },
}
