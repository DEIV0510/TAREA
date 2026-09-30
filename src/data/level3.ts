import type { Dim, L3Step } from '../types'

export interface L3Option {
  id: string
  title: string
  emoji: string
  desc?: string
  /** Qué tan bien resuelve el brief (0-100) */
  s: number
  /** Creatividad (conceptos y mensajes) */
  c?: number
  /** Capacidad de convertir (canales) */
  v?: number
  /** Presupuesto: reparto para las barras */
  split?: [string, number][]
  why: string
}

export interface L3Combo {
  a: string
  b: string
  dims: Partial<Record<Dim, number>>
  note: string
}

export interface Brief {
  id: string
  client: string
  emoji: string
  product: string
  budget: string
  objective: string
  audience: string
  problem: string
  bg: string
  steps: Record<L3Step, L3Option[]>
  combos: L3Combo[]
}

export const L3_STEPS: { key: L3Step; label: string; emoji: string; question: string }[] = [
  { key: 'concept', label: 'Concepto creativo', emoji: '💡', question: '¿Cuál es la gran idea?' },
  { key: 'audience', label: 'Público', emoji: '👥', question: '¿A quién le hablamos?' },
  { key: 'channel', label: 'Canal', emoji: '📡', question: '¿Dónde lo mostramos?' },
  { key: 'message', label: 'Mensaje', emoji: '💬', question: '¿Qué decimos?' },
  { key: 'cta', label: 'CTA', emoji: '👉', question: '¿Qué le pedimos al público?' },
  { key: 'budget', label: 'Presupuesto', emoji: '💰', question: '¿Cómo repartimos la plata?' },
]

export const DIMS: { key: Dim; label: string; emoji: string; color: string }[] = [
  { key: 'creatividad', label: 'CREATIVIDAD', emoji: '🎨', color: '#ff4fa3' },
  { key: 'estrategia', label: 'ESTRATEGIA', emoji: '🧠', color: '#8b5cf6' },
  { key: 'publico', label: 'PÚBLICO', emoji: '👥', color: '#38a3ff' },
  { key: 'canal', label: 'CANAL', emoji: '📡', color: '#22d98f' },
  { key: 'conversion', label: 'CONVERSIÓN', emoji: '💸', color: '#ffb800' },
]

export const BRIEFS: Brief[] = [
  {
    id: 'snacky',
    client: 'SNACKY',
    emoji: '🥜',
    product: 'Snack saludable para universitarios',
    budget: '$5.000.000',
    objective: 'Conseguir reconocimiento y ventas',
    audience: '18–25 años',
    problem: 'La marca es poco conocida',
    bg: 'linear-gradient(150deg,#f59e0b,#ef4444)',
    steps: {
      concept: [
        { id: 'sn-c1', title: 'Combustible de parcial', emoji: '📚', desc: 'Snacky te salva en semana de exámenes.', s: 95, c: 92, why: 'Nace de un insight real: el hambre en época de parciales.' },
        { id: 'sn-c2', title: 'El snack del mes', emoji: '🏷️', desc: 'Cada mes, un descuento distinto.', s: 50, c: 35, why: 'Los descuentos venden, pero no construyen marca.' },
        { id: 'sn-c3', title: 'Como el de la abuela', emoji: '👵', desc: 'Receta tradicional y nostálgica.', s: 40, c: 60, why: 'La nostalgia no es lo que busca un universitario en un snack.' },
        { id: 'sn-c4', title: 'Snacky Gold', emoji: '✨', desc: 'Snack gourmet y exclusivo.', s: 30, c: 55, why: 'Lo gourmet choca con el bolsillo universitario.' },
      ],
      audience: [
        { id: 'sn-a1', title: 'Universitarios que estudian y trabajan', emoji: '🎓', s: 95, why: 'Es exactamente el público del brief.' },
        { id: 'sn-a2', title: 'Mamás que arman la lonchera', emoji: '👩‍👧', s: 35, why: 'No es el público que pidió el cliente.' },
        { id: 'sn-a3', title: 'Deportistas de alto rendimiento', emoji: '🏋️', s: 55, why: 'Cercano, pero muy nicho para darse a conocer.' },
        { id: 'sn-a4', title: 'Todo el mundo, sin segmentar', emoji: '🌎', s: 15, why: 'Hablarle a todo el mundo es hablarle a nadie.' },
      ],
      channel: [
        { id: 'sn-h1', title: 'TikTok + creadores universitarios', emoji: '📱', s: 92, v: 75, why: 'Alcance masivo justo donde está el público.' },
        { id: 'sn-h2', title: 'Activación en campus + redes', emoji: '🏫', s: 90, v: 95, why: 'La gente prueba el producto y lo comparte.' },
        { id: 'sn-h3', title: 'Comercial en TV nacional', emoji: '📺', s: 30, v: 40, why: 'La TV nacional se come el presupuesto en un día.' },
        { id: 'sn-h4', title: 'Aviso en periódico impreso', emoji: '📰', s: 15, v: 20, why: 'Casi ningún joven de 18 a 25 lee prensa impresa.' },
      ],
      message: [
        { id: 'sn-m1', title: '«Energía real para noches de parcial»', emoji: '🌙', s: 95, c: 90, why: 'Mensaje claro, cercano y fácil de recordar.' },
        { id: 'sn-m2', title: '«Sin azúcar añadida. Con todo el sabor.»', emoji: '🍯', s: 80, c: 65, why: 'Beneficio claro, aunque menos emocional.' },
        { id: 'sn-m3', title: '«El snack más barato del mercado»', emoji: '💲', s: 40, c: 30, why: 'Hablar de «barato» daña la imagen saludable.' },
        { id: 'sn-m4', title: '«20 años de experiencia nos respaldan»', emoji: '🏛️', s: 20, c: 20, why: 'Es falso: la marca es nueva y poco conocida.' },
      ],
      cta: [
        { id: 'sn-t1', title: 'Pruébalo gratis en tu campus', emoji: '😋', s: 95, why: 'Quita el miedo de probar una marca nueva.' },
        { id: 'sn-t2', title: 'Compra hoy con 20% OFF en la app', emoji: '🛒', s: 82, why: 'Empuja la venta; ideal como segundo paso.' },
        { id: 'sn-t3', title: 'Síguenos para más contenido', emoji: '➕', s: 55, why: 'Suma seguidores, pero no vende.' },
        { id: 'sn-t4', title: 'Llama ya a la línea 01-8000', emoji: '☎️', s: 15, why: 'Nadie de 20 años llama a una línea 01-8000.' },
      ],
      budget: [
        { id: 'sn-b1', title: 'Digital + muestras + producción', emoji: '⚖️', split: [['Pauta digital', 60], ['Muestras en campus', 25], ['Producción', 15]], s: 95, why: 'Balance entre alcance, prueba de producto y calidad.' },
        { id: 'sn-b2', title: 'Influencer famoso + pauta', emoji: '🌟', split: [['Influencer famoso', 50], ['Pauta digital', 50]], s: 60, why: 'Un solo influencer caro se come la mitad del dinero.' },
        { id: 'sn-b3', title: 'Un video épico', emoji: '🎬', split: [['Producción', 80], ['Pauta digital', 20]], s: 40, why: 'Un gran video que casi nadie verá.' },
        { id: 'sn-b4', title: 'Todo en una valla', emoji: '🏙️', split: [['Valla por un mes', 100]], s: 30, why: 'Poca segmentación y sin forma de medir ventas.' },
      ],
    },
    combos: [
      { a: 'sn-c1', b: 'sn-m1', dims: { creatividad: 6 }, note: 'El concepto y el mensaje cuentan la misma historia.' },
      { a: 'sn-h2', b: 'sn-t1', dims: { conversion: 8 }, note: 'Activación en campus + «pruébalo gratis»: combinación ganadora.' },
    ],
  },
  {
    id: 'volta',
    client: 'VOLTA',
    emoji: '⚡',
    product: 'Bebida energética natural con guaraná y frutas',
    budget: '$8.000.000',
    objective: 'Diferenciarse de las energéticas tradicionales',
    audience: '16–24 años, gamers y estudiantes',
    problem: 'Las marcas gigantes dominan la categoría',
    bg: 'linear-gradient(150deg,#84cc16,#0f766e)',
    steps: {
      concept: [
        { id: 'vo-c1', title: 'Energía sin bajón', emoji: '🔋', desc: 'Energía natural que no te deja tirado después.', s: 95, c: 85, why: 'Diferencia clara frente a los gigantes.' },
        { id: 'vo-c2', title: 'Más barata que la competencia', emoji: '💲', desc: 'Mismo efecto, menor precio.', s: 45, c: 25, why: 'Pelear por precio contra gigantes es perder.' },
        { id: 'vo-c3', title: 'Energía para ejecutivos', emoji: '💼', desc: 'Para largas jornadas de oficina.', s: 30, c: 40, why: 'No coincide con el público del brief.' },
        { id: 'vo-c4', title: 'Deportes extremos, como el líder', emoji: '🪂', desc: 'Copiar el estilo de la marca más grande.', s: 25, c: 20, why: 'Imitar al líder te vuelve invisible.' },
      ],
      audience: [
        { id: 'vo-a1', title: 'Gamers y estudiantes de 16 a 24', emoji: '🎮', s: 95, why: 'Justo el público del brief.' },
        { id: 'vo-a2', title: 'Deportistas extremos profesionales', emoji: '🏂', s: 45, why: 'Es el terreno de la marca líder.' },
        { id: 'vo-a3', title: 'Adultos de 40+ que trabajan de noche', emoji: '🌃', s: 35, why: 'No es el público que pidió el cliente.' },
        { id: 'vo-a4', title: 'Niños de 8 a 12 años', emoji: '🧒', s: 5, why: 'Las energéticas no se dirigen a niños. ¡Error ético!' },
      ],
      channel: [
        { id: 'vo-h1', title: 'Twitch + streamers de videojuegos', emoji: '🕹️', s: 95, v: 80, why: 'El hábitat natural de los gamers.' },
        { id: 'vo-h2', title: 'TikTok con retos de energía', emoji: '🎵', s: 85, v: 70, why: 'Mucho alcance joven y formato viral.' },
        { id: 'vo-h3', title: 'Revista de negocios', emoji: '📖', s: 15, v: 20, why: 'Su lector no es gamer ni estudiante.' },
        { id: 'vo-h4', title: 'Cuñas en radio AM', emoji: '📻', s: 20, v: 25, why: 'Los jóvenes casi no escuchan radio AM.' },
      ],
      message: [
        { id: 'vo-m1', title: '«Sube de nivel sin el bajón»', emoji: '⬆️', s: 95, c: 90, why: 'Habla el idioma gamer y resalta la diferencia.' },
        { id: 'vo-m2', title: '«100% natural, con guaraná y frutas»', emoji: '🍊', s: 75, c: 55, why: 'Buen argumento racional, poco emocional.' },
        { id: 'vo-m3', title: '«Somos casi iguales a la marca líder»', emoji: '🪞', s: 15, c: 10, why: 'Nunca digas que eres igual al líder.' },
        { id: 'vo-m4', title: '«La bebida de los campeones de golf»', emoji: '⛳', s: 20, c: 30, why: 'No conecta con gamers ni estudiantes.' },
      ],
      cta: [
        { id: 'vo-t1', title: 'Pruébala gratis en el próximo torneo', emoji: '🏆', s: 92, why: 'Primera prueba en el lugar perfecto.' },
        { id: 'vo-t2', title: 'Cómprala con el código del streamer', emoji: '🎟️', s: 88, why: 'Genera ventas y permite medir cada creador.' },
        { id: 'vo-t3', title: 'Lee nuestra historia corporativa', emoji: '📜', s: 30, why: 'A nadie le importa la historia corporativa.' },
        { id: 'vo-t4', title: 'Visita nuestra oficina', emoji: '🏢', s: 10, why: '¿Quién va a la oficina de una bebida?' },
      ],
      budget: [
        { id: 'vo-b1', title: 'Streamers + pauta + muestras', emoji: '⚖️', split: [['Streamers', 45], ['Pauta digital', 35], ['Muestras en torneos', 20]], s: 95, why: 'Presencia donde está el público y prueba de producto.' },
        { id: 'vo-b2', title: 'Un comercial de TV', emoji: '📺', split: [['Comercial de TV', 90], ['Redes', 10]], s: 30, why: 'Carísimo y lejos de los gamers.' },
        { id: 'vo-b3', title: 'Todo en descuentos', emoji: '🏷️', split: [['Descuentos', 100]], s: 40, why: 'Descuentos sin comunicación no diferencian.' },
        { id: 'vo-b4', title: 'Vallas y prensa', emoji: '🗞️', split: [['Vallas', 50], ['Prensa', 50]], s: 20, why: 'Medios lejanos a este público.' },
      ],
    },
    combos: [
      { a: 'vo-c1', b: 'vo-m1', dims: { creatividad: 6 }, note: '«Sin bajón» es una diferencia clara y memorable.' },
      { a: 'vo-h1', b: 'vo-t2', dims: { conversion: 8 }, note: 'Streamer + código propio = ventas medibles.' },
    ],
  },
  {
    id: 'petpal',
    client: 'PETPAL',
    emoji: '🐶',
    product: 'App para contratar paseadores de perros verificados',
    budget: '$6.000.000',
    objective: 'Descargas de la app y confianza',
    audience: '25–40 años, profesionales con mascota',
    problem: 'A la gente le da miedo dejar su perro con un extraño',
    bg: 'linear-gradient(150deg,#fb923c,#db2777)',
    steps: {
      concept: [
        { id: 'pe-c1', title: 'En buenas patas', emoji: '🐾', desc: 'Paseadores verificados, con GPS y fotos en vivo.', s: 95, c: 90, why: 'Ataca de frente el miedo del público.' },
        { id: 'pe-c2', title: 'El paseo más barato', emoji: '💰', desc: 'Precios imbatibles.', s: 40, c: 25, why: 'El problema es la confianza, no el precio.' },
        { id: 'pe-c3', title: 'Adopta un perro', emoji: '🏠', desc: 'Campaña de adopción.', s: 35, c: 60, why: 'Noble, pero es otro objetivo.' },
        { id: 'pe-c4', title: 'Perros famosos de internet', emoji: '🤳', desc: 'Memes con perritos virales.', s: 55, c: 70, why: 'Llama la atención, pero no genera confianza.' },
      ],
      audience: [
        { id: 'pe-a1', title: 'Profesionales de 25 a 40 con perro', emoji: '👩‍💻', s: 95, why: 'Tienen mascota, poco tiempo y pagan por el servicio.' },
        { id: 'pe-a2', title: 'Veterinarios', emoji: '🩺', s: 45, why: 'Pueden ser aliados, pero no son los usuarios.' },
        { id: 'pe-a3', title: 'Niños que quieren un perro', emoji: '🧒', s: 10, why: 'No tienen perro ni pagan la app.' },
        { id: 'pe-a4', title: 'Personas sin mascota', emoji: '🙅', s: 5, why: 'No necesitan el servicio.' },
      ],
      channel: [
        { id: 'pe-h1', title: 'Instagram + reseñas de dueños reales', emoji: '📸', s: 92, v: 85, why: 'Las reseñas reales construyen confianza.' },
        { id: 'pe-h2', title: 'Alianza con veterinarias', emoji: '🏪', s: 85, v: 75, why: 'Suma credibilidad con aliados expertos.' },
        { id: 'pe-h3', title: 'Comercial de cine', emoji: '🎬', s: 35, v: 30, why: 'Caro y difícil de convertir en descargas.' },
        { id: 'pe-h4', title: 'Volantes en semáforos', emoji: '📄', s: 25, v: 20, why: 'Poco confiable y casi nadie los lee.' },
      ],
      message: [
        { id: 'pe-m1', title: '«Tu perro feliz. Tú tranquilo.»', emoji: '🐕', s: 95, c: 85, why: 'Resume el beneficio emocional en seis palabras.' },
        { id: 'pe-m2', title: '«Paseadores verificados y GPS en vivo»', emoji: '📍', s: 85, c: 60, why: 'Da pruebas concretas de seguridad.' },
        { id: 'pe-m3', title: '«Descarga ya, ya, ya»', emoji: '📢', s: 25, c: 15, why: 'Presiona sin dar ninguna razón.' },
        { id: 'pe-m4', title: '«Somos la app número 1 del mundo»', emoji: '🥇', s: 15, c: 20, why: 'Afirmación falsa y poco creíble.' },
      ],
      cta: [
        { id: 'pe-t1', title: 'Descarga y recibe tu primer paseo gratis', emoji: '🎁', s: 95, why: 'Quita el riesgo de la primera vez.' },
        { id: 'pe-t2', title: 'Conoce a los paseadores de tu barrio', emoji: '👀', s: 85, why: 'Genera confianza antes de contratar.' },
        { id: 'pe-t3', title: 'Síguenos para ver perritos', emoji: '➕', s: 55, why: 'Entretiene, pero no genera descargas.' },
        { id: 'pe-t4', title: 'Envíanos un fax', emoji: '📠', s: 5, why: 'Nadie tiene fax desde hace años.' },
      ],
      budget: [
        { id: 'pe-b1', title: 'Pauta + alianzas + paseos gratis', emoji: '⚖️', split: [['Pauta en Instagram', 50], ['Alianzas', 30], ['Paseos gratis', 20]], s: 95, why: 'Alcance, confianza y prueba sin riesgo.' },
        { id: 'pe-b2', title: 'Todo en un influencer de mascotas', emoji: '🌟', split: [['Influencer', 100]], s: 55, why: 'Buen alcance, pero todo en una sola carta.' },
        { id: 'pe-b3', title: 'Video de alta producción', emoji: '🎬', split: [['Producción', 70], ['Pauta', 30]], s: 45, why: 'Se ve lindo, pero pocos lo verán.' },
        { id: 'pe-b4', title: 'Solo volantes impresos', emoji: '📄', split: [['Volantes', 100]], s: 20, why: 'No genera descargas medibles.' },
      ],
    },
    combos: [
      { a: 'pe-c1', b: 'pe-m2', dims: { estrategia: 6 }, note: 'Concepto y mensaje resuelven el miedo con pruebas.' },
      { a: 'pe-h1', b: 'pe-t1', dims: { conversion: 6 }, note: 'Reseñas reales + primer paseo gratis = descargas.' },
    ],
  },
  {
    id: 'terra',
    client: 'TERRA',
    emoji: '🌱',
    product: 'Ropa sostenible hecha con materiales reciclados',
    budget: '$7.000.000',
    objective: 'Cambiar la percepción y vender la colección',
    audience: '20–30 años',
    problem: 'La gente cree que la moda sostenible es cara y aburrida',
    bg: 'linear-gradient(150deg,#16a34a,#0e7490)',
    steps: {
      concept: [
        { id: 'te-c1', title: 'Reciclado nunca se vio tan bien', emoji: '🔥', desc: 'Moda con estilo que además cuida el planeta.', s: 95, c: 90, why: 'Rompe el prejuicio de «aburrida».' },
        { id: 'te-c2', title: 'Culpa ecológica', emoji: '😢', desc: 'Mostrar basura y océanos contaminados.', s: 45, c: 50, why: 'La culpa aleja; no vende estilo.' },
        { id: 'te-c3', title: 'Liquidación total', emoji: '🏷️', desc: 'Todo con 50% de descuento.', s: 40, c: 20, why: 'Refuerza que es «ropa de descuento».' },
        { id: 'te-c4', title: 'Moda de pasarela europea', emoji: '🗼', desc: 'Estética de alta costura.', s: 50, c: 60, why: 'Aspiracional, pero la hace ver cara.' },
      ],
      audience: [
        { id: 'te-a1', title: 'Jóvenes de 20 a 30 que siguen tendencias', emoji: '🛍️', s: 95, why: 'Es el público del brief.' },
        { id: 'te-a2', title: 'Solo activistas ambientales', emoji: '🌍', s: 55, why: 'Ya están convencidos: hay que llegar a más gente.' },
        { id: 'te-a3', title: 'Empresas textiles', emoji: '🏭', s: 20, why: 'Son proveedores, no compradores.' },
        { id: 'te-a4', title: 'Adultos mayores', emoji: '👴', s: 15, why: 'No es el público del brief.' },
      ],
      channel: [
        { id: 'te-h1', title: 'Instagram + TikTok con creadores de moda', emoji: '👗', s: 95, v: 85, why: 'Donde nacen las tendencias.' },
        { id: 'te-h2', title: 'Pop-up store en un festival de música', emoji: '🎪', s: 88, v: 90, why: 'La gente ve, toca y compra ahí mismo.' },
        { id: 'te-h3', title: 'Radio tradicional', emoji: '📻', s: 30, v: 25, why: 'La moda se ve, no se escucha.' },
        { id: 'te-h4', title: 'Catálogo impreso por correo', emoji: '✉️', s: 20, v: 25, why: 'Costoso y poco sostenible, ¡justo para esta marca!' },
      ],
      message: [
        { id: 'te-m1', title: '«Estilo que no le cuesta al planeta»', emoji: '🌎', s: 95, c: 88, why: 'Une estilo y propósito en una frase.' },
        { id: 'te-m2', title: '«Hecha con 12 botellas recicladas»', emoji: '♻️', s: 80, c: 70, why: 'Dato concreto y sorprendente.' },
        { id: 'te-m3', title: '«Ropa barata y resistente»', emoji: '💲', s: 40, c: 20, why: 'Compite por precio y no por estilo.' },
        { id: 'te-m4', title: '«Si no la compras, destruyes el planeta»', emoji: '☠️', s: 25, c: 30, why: 'Culpar al público genera rechazo.' },
      ],
      cta: [
        { id: 'te-t1', title: 'Compra el drop de lanzamiento', emoji: '🛒', s: 92, why: 'Exclusividad + venta directa.' },
        { id: 'te-t2', title: 'Arma tu outfit en la web', emoji: '👕', s: 85, why: 'Interactivo y cerca de la compra.' },
        { id: 'te-t3', title: 'Dona tu ropa vieja', emoji: '♻️', s: 60, why: 'Buena acción, pero no vende la colección.' },
        { id: 'te-t4', title: 'Lee nuestro informe anual', emoji: '📊', s: 15, why: 'Nadie compra ropa por un informe anual.' },
      ],
      budget: [
        { id: 'te-b1', title: 'Creadores + pauta + pop-up', emoji: '⚖️', split: [['Creadores', 40], ['Pauta digital', 35], ['Pop-up', 25]], s: 95, why: 'Tendencia, alcance y experiencia de compra.' },
        { id: 'te-b2', title: 'Catálogo de lujo', emoji: '📕', split: [['Producción de catálogo', 80], ['Pauta', 20]], s: 40, why: 'Mucho en producción, poco en que la gente lo vea.' },
        { id: 'te-b3', title: 'Desfile en un hotel', emoji: '🏨', split: [['Desfile', 100]], s: 35, why: 'Refuerza la idea de moda cara y lejana.' },
        { id: 'te-b4', title: 'Radio y prensa', emoji: '🗞️', split: [['Radio', 50], ['Prensa', 50]], s: 20, why: 'Medios lejanos a este público.' },
      ],
    },
    combos: [
      { a: 'te-c1', b: 'te-h1', dims: { creatividad: 5 }, note: 'La idea brilla en manos de creadores de moda.' },
      { a: 'te-h2', b: 'te-t1', dims: { conversion: 6 }, note: 'Pop-up + drop exclusivo = ventas en el momento.' },
    ],
  },
  {
    id: 'ritmofit',
    client: 'RITMO FIT',
    emoji: '💃',
    product: 'Gimnasio de baile nuevo en el barrio',
    budget: '$3.000.000',
    objective: '200 inscripciones en el primer mes',
    audience: '30–55 años que viven cerca',
    problem: 'Nadie conoce el gimnasio y hay mucha competencia',
    bg: 'linear-gradient(150deg,#ec4899,#8b5cf6)',
    steps: {
      concept: [
        { id: 'ri-c1', title: 'Ejercicio que se siente como fiesta', emoji: '🎉', desc: 'Entrenar bailando, sin sentirlo.', s: 95, c: 90, why: 'Convierte el ejercicio en algo que se disfruta.' },
        { id: 'ri-c2', title: 'Cuerpo perfecto en 7 días', emoji: '⏱️', desc: 'Resultados inmediatos.', s: 20, c: 30, why: 'Promesa falsa: destruye la confianza.' },
        { id: 'ri-c3', title: 'El gimnasio más tecnológico', emoji: '🤖', desc: 'Máquinas inteligentes.', s: 40, c: 45, why: 'No es su diferencial real.' },
        { id: 'ri-c4', title: 'Entrena como atleta olímpico', emoji: '🥇', desc: 'Rutinas de alto rendimiento.', s: 35, c: 40, why: 'Intimida al público del barrio.' },
      ],
      audience: [
        { id: 'ri-a1', title: 'Adultos de 30 a 55 que viven a 10 min', emoji: '🏘️', s: 95, why: 'Cercanía = facilidad para inscribirse.' },
        { id: 'ri-a2', title: 'Atletas profesionales', emoji: '🏃', s: 20, why: 'Buscan otro tipo de entrenamiento.' },
        { id: 'ri-a3', title: 'Adolescentes de todo el país', emoji: '🧑‍🎤', s: 15, why: 'Ni son del barrio ni son el público.' },
        { id: 'ri-a4', title: 'Turistas', emoji: '🧳', s: 10, why: 'No se van a inscribir un mes entero.' },
      ],
      channel: [
        { id: 'ri-h1', title: 'Redes segmentadas por barrio', emoji: '📍', s: 92, v: 85, why: 'Solo le pagas a quien vive cerca.' },
        { id: 'ri-h2', title: 'Clase gratis en el parque del barrio', emoji: '🌳', s: 90, v: 95, why: 'La gente lo vive y se inscribe ahí mismo.' },
        { id: 'ri-h3', title: 'Comercial en TV nacional', emoji: '📺', s: 10, v: 15, why: 'Imposible con $3.000.000 y desperdicia alcance.' },
        { id: 'ri-h4', title: 'Valla en otra ciudad', emoji: '🏙️', s: 5, v: 5, why: 'Le habla a gente que no puede ir.' },
      ],
      message: [
        { id: 'ri-m1', title: '«Ven a bailar, sal renovado»', emoji: '💃', s: 92, c: 85, why: 'Alegre, cercano y con beneficio claro.' },
        { id: 'ri-m2', title: '«Primera clase gratis, a 5 minutos de tu casa»', emoji: '🏠', s: 90, c: 60, why: 'Claro, cercano y sin riesgo.' },
        { id: 'ri-m3', title: '«Máquinas importadas de alta gama»', emoji: '🏋️', s: 35, c: 20, why: 'No es lo que ofrece un gimnasio de baile.' },
        { id: 'ri-m4', title: '«El gimnasio de los famosos»', emoji: '🌟', s: 25, c: 35, why: 'Poco creíble para un gimnasio de barrio.' },
      ],
      cta: [
        { id: 'ri-t1', title: 'Reserva tu clase gratis por WhatsApp', emoji: '💬', s: 95, why: 'Fácil, inmediato y medible.' },
        { id: 'ri-t2', title: 'Inscríbete con un amigo: 2x1', emoji: '👯', s: 90, why: 'Cada inscrito trae a otro.' },
        { id: 'ri-t3', title: 'Visita nuestra web corporativa', emoji: '🌐', s: 35, why: 'Un paso extra que enfría la decisión.' },
        { id: 'ri-t4', title: 'Síguenos en LinkedIn', emoji: '💼', s: 10, why: 'Nadie busca clases de baile en LinkedIn.' },
      ],
      budget: [
        { id: 'ri-b1', title: 'Pauta local + clase en el parque', emoji: '⚖️', split: [['Pauta local', 50], ['Clase en el parque', 30], ['Referidos', 20]], s: 95, why: 'Todo el dinero trabaja en el barrio.' },
        { id: 'ri-b2', title: 'Uniformes y regalos', emoji: '🎁', split: [['Uniformes y regalos', 70], ['Pauta', 30]], s: 40, why: 'Regalos antes de tener clientes.' },
        { id: 'ri-b3', title: 'Una sola valla', emoji: '🏙️', split: [['Valla', 100]], s: 35, why: 'Poco alcance local y nada medible.' },
        { id: 'ri-b4', title: 'Influencer nacional', emoji: '🌟', split: [['Influencer', 100]], s: 30, why: 'Su audiencia no vive en el barrio.' },
      ],
    },
    combos: [
      { a: 'ri-h2', b: 'ri-t1', dims: { conversion: 8 }, note: 'Clase en el parque + reserva por WhatsApp: inscripciones en el acto.' },
      { a: 'ri-c1', b: 'ri-m1', dims: { creatividad: 5 }, note: 'La idea de fiesta se siente en el mensaje.' },
    ],
  },
  {
    id: 'nube',
    client: 'BANCO NUBE',
    emoji: '☁️',
    product: 'Banco 100% digital sin cuota de manejo',
    budget: '$10.000.000',
    objective: 'Aperturas de cuenta',
    audience: '22–30 años, en su primer empleo',
    problem: 'Los jóvenes desconfían de los bancos y sus cobros ocultos',
    bg: 'linear-gradient(150deg,#38bdf8,#6366f1)',
    steps: {
      concept: [
        { id: 'nu-c1', title: 'Cero letras pequeñas', emoji: '🔍', desc: 'Todo claro: sin cobros ocultos, nunca.', s: 95, c: 88, why: 'Responde directo a la desconfianza.' },
        { id: 'nu-c2', title: 'Tu primer sueldo merece un plan', emoji: '💼', desc: 'Acompañarte desde tu primer empleo.', s: 85, c: 75, why: 'Conecta con el momento de vida del público.' },
        { id: 'nu-c3', title: 'Tradición y solidez desde 1920', emoji: '🏛️', desc: 'Un banco de toda la vida.', s: 25, c: 30, why: 'Es falso y no conecta con jóvenes.' },
        { id: 'nu-c4', title: 'Hazte millonario rápido', emoji: '🤑', desc: 'Promesas de riqueza.', s: 15, c: 35, why: 'Promesa irresponsable para un banco.' },
      ],
      audience: [
        { id: 'nu-a1', title: 'Jóvenes de 22 a 30 en su primer empleo', emoji: '👩‍💼', s: 95, why: 'Es el público del brief.' },
        { id: 'nu-a2', title: 'Grandes empresas', emoji: '🏢', s: 25, why: 'Es otro negocio, con otras necesidades.' },
        { id: 'nu-a3', title: 'Pensionados', emoji: '👴', s: 20, why: 'No es el público del brief.' },
        { id: 'nu-a4', title: 'Niños', emoji: '🧒', s: 5, why: 'No pueden abrir una cuenta.' },
      ],
      channel: [
        { id: 'nu-h1', title: 'YouTube + creadores de finanzas', emoji: '▶️', s: 92, v: 80, why: 'Expertos que el público ya escucha.' },
        { id: 'nu-h2', title: 'TikTok con mitos de los bancos', emoji: '🎵', s: 88, v: 70, why: 'Educa y entretiene al público joven.' },
        { id: 'nu-h3', title: 'Periódico económico impreso', emoji: '📰', s: 25, v: 20, why: 'Los de 22 a 30 casi no lo leen.' },
        { id: 'nu-h4', title: 'Oficinas físicas con pendones', emoji: '🏦', s: 20, v: 30, why: '¿Un banco digital promocionado en oficinas?' },
      ],
      message: [
        { id: 'nu-m1', title: '«Tu plata es tuya. Sin cobros escondidos.»', emoji: '☁️', s: 95, c: 85, why: 'Directo al miedo del público.' },
        { id: 'nu-m2', title: '«Abre tu cuenta en 5 minutos desde el celular»', emoji: '📲', s: 88, c: 60, why: 'Beneficio claro y práctico.' },
        { id: 'nu-m3', title: '«Tasas competitivas del mercado financiero»', emoji: '📈', s: 40, c: 20, why: 'Suena igual que cualquier banco.' },
        { id: 'nu-m4', title: '«Somos el banco más grande»', emoji: '🏆', s: 20, c: 15, why: 'Falso y no genera confianza.' },
      ],
      cta: [
        { id: 'nu-t1', title: 'Abre tu cuenta gratis en 5 minutos', emoji: '📲', s: 95, why: 'Directo al objetivo: aperturas.' },
        { id: 'nu-t2', title: 'Descarga la app y recibe $20.000', emoji: '🎁', s: 88, why: 'Incentivo claro para la primera vez.' },
        { id: 'nu-t3', title: 'Síguenos para tips', emoji: '➕', s: 55, why: 'Suma comunidad, no cuentas.' },
        { id: 'nu-t4', title: 'Agenda una cita en oficina', emoji: '📅', s: 15, why: 'Contradice ser 100% digital.' },
      ],
      budget: [
        { id: 'nu-b1', title: 'Creadores + pauta + bono', emoji: '⚖️', split: [['Creadores de finanzas', 50], ['Pauta digital', 35], ['Bono de bienvenida', 15]], s: 95, why: 'Confianza, alcance e incentivo medible.' },
        { id: 'nu-b2', title: 'Pauta en Google sin creatividad', emoji: '🔎', split: [['Google Ads', 100]], s: 55, why: 'Capta búsquedas, pero no cambia la percepción.' },
        { id: 'nu-b3', title: 'TV en el partido de la selección', emoji: '⚽', split: [['Comercial de TV', 100]], s: 45, why: 'Mucho alcance, poca conversión digital.' },
        { id: 'nu-b4', title: 'Oficinas decoradas y volantes', emoji: '🎈', split: [['Oficinas', 60], ['Volantes', 40]], s: 20, why: 'Invierte en lo que el banco no tiene.' },
      ],
    },
    combos: [
      { a: 'nu-c1', b: 'nu-m1', dims: { creatividad: 5 }, note: 'Concepto y mensaje hablan de transparencia.' },
      { a: 'nu-h1', b: 'nu-t1', dims: { conversion: 6 }, note: 'Creadores de finanzas + apertura en 5 minutos.' },
    ],
  },
]

export const BRIEF_BY_ID: Record<string, Brief> = Object.fromEntries(BRIEFS.map((b) => [b.id, b]))

export function briefOption(brief: Brief, step: L3Step, id: string | undefined): L3Option | undefined {
  return brief.steps[step].find((o) => o.id === id)
}
