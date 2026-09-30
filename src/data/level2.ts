import type { L2Field } from '../types'

export interface L2Option {
  id: string
  label: string
  emoji: string
  hint: string
}

export interface L2FieldInfo {
  key: L2Field
  label: string
  emoji: string
  question: string
  options: L2Option[]
}

export const L2_FIELDS: L2FieldInfo[] = [
  {
    key: 'objective',
    label: 'OBJETIVO',
    emoji: '🎯',
    question: '¿Qué estrategia usamos según el objetivo?',
    options: [
      { id: 'informar', label: 'Informar', emoji: '📢', hint: 'Dar a conocer algo nuevo o una mejora' },
      { id: 'persuadir', label: 'Persuadir', emoji: '🥊', hint: 'Que nos elijan sobre otra marca' },
      { id: 'recordar', label: 'Recordar', emoji: '🧠', hint: 'Mantener la marca en la mente' },
      { id: 'emocionar', label: 'Emocionar', emoji: '💞', hint: 'Familia, amistad, alegría o nostalgia' },
    ],
  },
  {
    key: 'audience',
    label: 'PÚBLICO',
    emoji: '👥',
    question: '¿A quién le hablamos?',
    options: [
      { id: 'teens', label: 'Adolescentes', emoji: '🧑‍🎤', hint: '13 a 17 años' },
      { id: 'uni', label: 'Jóvenes universitarios', emoji: '🎓', hint: '18 a 25 años' },
      { id: 'parents', label: 'Padres', emoji: '👨‍👩‍👧', hint: '30 a 50 años, con hijos' },
      { id: 'seniors', label: 'Adultos mayores', emoji: '👵', hint: '60 años o más' },
    ],
  },
  {
    key: 'tone',
    label: 'TONO',
    emoji: '🎭',
    question: '¿Con qué personalidad hablamos?',
    options: [
      { id: 'fun', label: 'Divertido', emoji: '😂', hint: 'Humor y buena vibra' },
      { id: 'elegant', label: 'Elegante', emoji: '🥂', hint: 'Sobrio y premium' },
      { id: 'emotional', label: 'Emocional', emoji: '🥹', hint: 'Toca el corazón' },
      { id: 'rebel', label: 'Rebelde', emoji: '🤘', hint: 'Rompe las reglas' },
    ],
  },
  {
    key: 'channel',
    label: 'CANAL',
    emoji: '📡',
    question: '¿Dónde lo vamos a mostrar?',
    options: [
      { id: 'tiktok', label: 'TikTok', emoji: '🎵', hint: 'Video vertical y tendencias' },
      { id: 'instagram', label: 'Instagram', emoji: '📸', hint: 'Reels, historias y posts' },
      { id: 'radio', label: 'Radio', emoji: '📻', hint: 'Cuñas y menciones' },
      { id: 'billboard', label: 'Vallas', emoji: '🏙️', hint: 'Publicidad en la calle' },
    ],
  },
  {
    key: 'cta',
    label: 'LLAMADO A LA ACCIÓN',
    emoji: '👉',
    question: '¿Qué le pedimos al público?',
    options: [
      { id: 'buy', label: 'Comprar ahora', emoji: '🛒', hint: 'Directo a la venta' },
      { id: 'discover', label: 'Descubre más', emoji: '🔍', hint: 'Despierta curiosidad' },
      { id: 'follow', label: 'Síguenos', emoji: '➕', hint: 'Suma comunidad' },
      { id: 'try', label: 'Pruébalo', emoji: '😋', hint: 'Invita a la primera vez' },
    ],
  },
]

export const L2_FIELD_BY_KEY = Object.fromEntries(L2_FIELDS.map((f) => [f.key, f])) as Record<L2Field, L2FieldInfo>

export function l2Option(field: L2Field, id: string | undefined): L2Option | undefined {
  return L2_FIELD_BY_KEY[field].options.find((o) => o.id === id)
}

type Table = Record<string, Record<string, number>>

/** ¿Qué tanto consume cada público cada canal? */
export const AUD_CH: Table = {
  teens: { tiktok: 100, instagram: 85, radio: 25, billboard: 50 },
  uni: { tiktok: 90, instagram: 100, radio: 40, billboard: 60 },
  parents: { tiktok: 45, instagram: 80, radio: 85, billboard: 75 },
  seniors: { tiktok: 15, instagram: 35, radio: 100, billboard: 70 },
}

/** ¿Qué tono le llega a cada público? */
export const AUD_TONE: Table = {
  teens: { fun: 100, elegant: 30, emotional: 60, rebel: 95 },
  uni: { fun: 95, elegant: 55, emotional: 70, rebel: 85 },
  parents: { fun: 70, elegant: 80, emotional: 100, rebel: 30 },
  seniors: { fun: 60, elegant: 75, emotional: 100, rebel: 15 },
}

/** ¿El llamado a la acción empuja el objetivo? */
export const OBJ_CTA: Table = {
  informar: { buy: 50, discover: 100, follow: 60, try: 85 },
  persuadir: { buy: 100, discover: 55, follow: 35, try: 90 },
  recordar: { buy: 45, discover: 60, follow: 100, try: 50 },
  emocionar: { buy: 40, discover: 75, follow: 95, try: 70 },
}

/** ¿El canal es fuerte para ese objetivo? */
export const OBJ_CH: Table = {
  informar: { tiktok: 85, instagram: 90, radio: 75, billboard: 70 },
  persuadir: { tiktok: 85, instagram: 95, radio: 65, billboard: 60 },
  recordar: { tiktok: 75, instagram: 80, radio: 85, billboard: 100 },
  emocionar: { tiktok: 100, instagram: 95, radio: 70, billboard: 60 },
}

export interface Product {
  id: string
  name: string
  emoji: string
  desc: string
  /** Situación de la marca, para explicar el objetivo ideal */
  stage: string
  bg: string
  aud: Record<string, number>
  tone: Record<string, number>
  obj: Record<string, number>
  /** Titular del anuncio según el tono elegido */
  lines: Record<string, string>
}

export const PRODUCTS: Product[] = [
  {
    id: 'bubblepop',
    name: 'BubblePop',
    emoji: '🫧',
    desc: 'Bebida gaseosa para jóvenes',
    stage: 'una marca nueva que nadie conoce todavía',
    bg: 'linear-gradient(150deg,#ff5fa8,#7c3aed 55%,#22d3ee)',
    aud: { teens: 90, uni: 100, parents: 35, seniors: 10 },
    tone: { fun: 100, elegant: 35, emotional: 60, rebel: 90 },
    obj: { informar: 85, persuadir: 70, recordar: 40, emocionar: 100 },
    lines: {
      fun: '¡Burbujas que te hacen reír!',
      elegant: 'Burbujas finas para momentos únicos',
      emotional: 'Cada burbuja, un recuerdo con tus amigos',
      rebel: 'Rompe la rutina. Destapa la tuya.',
    },
  },
  {
    id: 'facilfono',
    name: 'FácilFono',
    emoji: '📱',
    desc: 'Celular con botones grandes y botón SOS',
    stage: 'un producto nuevo que necesita vender su primer lote',
    bg: 'linear-gradient(150deg,#38bdf8,#1d4ed8)',
    aud: { teens: 5, uni: 10, parents: 75, seniors: 100 },
    tone: { fun: 55, elegant: 60, emotional: 100, rebel: 5 },
    obj: { informar: 100, persuadir: 70, recordar: 30, emocionar: 85 },
    lines: {
      fun: 'Tan fácil que hasta da risa',
      elegant: 'Tecnología clara, diseño sereno',
      emotional: 'Para que siempre te escuchen los que amas',
      rebel: '¿Quién dijo que la tecnología es solo para jóvenes?',
    },
  },
  {
    id: 'luxaura',
    name: 'LuxAura',
    emoji: '💎',
    desc: 'Perfume premium unisex',
    stage: 'una marca de lujo que quiere vender más',
    bg: 'linear-gradient(150deg,#1f1147,#a16207 120%)',
    aud: { teens: 20, uni: 75, parents: 100, seniors: 45 },
    tone: { fun: 30, elegant: 100, emotional: 75, rebel: 50 },
    obj: { informar: 40, persuadir: 80, recordar: 70, emocionar: 100 },
    lines: {
      fun: 'Huele tan bien que te van a seguir',
      elegant: 'La elegancia no se explica. Se siente.',
      emotional: 'El aroma que recordarán de ti',
      rebel: 'No sigas tendencias. Déjalas en el aire.',
    },
  },
  {
    id: 'minichef',
    name: 'MiniChef',
    emoji: '🥪',
    desc: 'Loncheras saludables listas para el colegio',
    stage: 'una marca que ya tiene clientes y quiere que repitan',
    bg: 'linear-gradient(150deg,#34d399,#f59e0b)',
    aud: { teens: 30, uni: 25, parents: 100, seniors: 40 },
    tone: { fun: 85, elegant: 30, emotional: 95, rebel: 15 },
    obj: { informar: 55, persuadir: 65, recordar: 95, emocionar: 100 },
    lines: {
      fun: 'La lonchera que vuelve feliz',
      elegant: 'Nutrición cuidada en cada detalle',
      emotional: 'Porque los cuidas incluso cuando no estás',
      rebel: 'Adiós a la lonchera aburrida',
    },
  },
  {
    id: 'fitquest',
    name: 'FitQuest',
    emoji: '🏃',
    desc: 'App de ejercicio con retos tipo videojuego',
    stage: 'una app nueva que necesita crear comunidad',
    bg: 'linear-gradient(150deg,#22c55e,#0ea5e9 60%,#6366f1)',
    aud: { teens: 85, uni: 100, parents: 50, seniors: 20 },
    tone: { fun: 100, elegant: 25, emotional: 65, rebel: 85 },
    obj: { informar: 90, persuadir: 80, recordar: 45, emocionar: 80 },
    lines: {
      fun: 'Sudar nunca fue tan divertido',
      elegant: 'Tu mejor versión, paso a paso',
      emotional: 'Cada reto te acerca a quien quieres ser',
      rebel: 'El gimnasio es aburrido. Esto no.',
    },
  },
  {
    id: 'ecobici',
    name: 'EcoBici',
    emoji: '🚲',
    desc: 'Alquiler de bicicletas eléctricas por app',
    stage: 'un servicio que acaba de llegar a la ciudad',
    bg: 'linear-gradient(150deg,#a3e635,#10b981 50%,#0f766e)',
    aud: { teens: 45, uni: 100, parents: 65, seniors: 20 },
    tone: { fun: 85, elegant: 45, emotional: 70, rebel: 90 },
    obj: { informar: 100, persuadir: 80, recordar: 35, emocionar: 70 },
    lines: {
      fun: 'Llega sin sudar y con estilo',
      elegant: 'Movilidad silenciosa y limpia',
      emotional: 'Redescubre tu ciudad',
      rebel: 'El trancón es para otros',
    },
  },
  {
    id: 'raices',
    name: 'Café Raíces',
    emoji: '☕',
    desc: 'Café colombiano de origen para la familia',
    stage: 'una marca tradicional con clientes fieles',
    bg: 'linear-gradient(150deg,#92400e,#451a03)',
    aud: { teens: 10, uni: 45, parents: 95, seniors: 100 },
    tone: { fun: 45, elegant: 80, emotional: 100, rebel: 20 },
    obj: { informar: 40, persuadir: 55, recordar: 100, emocionar: 95 },
    lines: {
      fun: 'Despierta hasta al gallo',
      elegant: 'Origen, aroma y tradición',
      emotional: 'El sabor de las mañanas en familia',
      rebel: 'Nada de café aguado',
    },
  },
]

export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))
