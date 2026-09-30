import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle, Music2, Radio, Send, Share2 } from 'lucide-react'
import { l2Option, type Product } from '../data/level2'
import type { L2Picks } from '../types'

const TONE_STYLE: Record<string, { bg?: string; fg: string; accent: string; ctaBg: string; ctaFg: string; font: string }> = {
  fun: { fg: '#ffffff', accent: '#ffd23f', ctaBg: '#ffd23f', ctaFg: '#1b1036', font: 'font-display' },
  elegant: { bg: 'linear-gradient(160deg,#141022,#2b2140 60%,#4a3712)', fg: '#f7e7b4', accent: '#e9c46a', ctaBg: '#e9c46a', ctaFg: '#141022', font: 'font-sans uppercase tracking-[0.18em] font-extrabold' },
  emotional: { bg: 'linear-gradient(165deg,#ffb88c,#ff6a88 55%,#b84fd6)', fg: '#ffffff', accent: '#fff1c1', ctaBg: '#ffffff', ctaFg: '#b8325b', font: 'font-display' },
  rebel: { bg: 'linear-gradient(165deg,#0b0b0f,#1b1b24)', fg: '#b7ff3c', accent: '#ff3ea5', ctaBg: '#b7ff3c', ctaFg: '#0b0b0f', font: 'font-display uppercase -rotate-2' },
}

/** Vista previa en vivo del anuncio mientras el equipo arma su campaña. */
export function AdPreview({ product, picks, className = '', stamp }: { product: Product; picks: L2Picks; className?: string; stamp?: { text: string; good: boolean } | null }) {
  const tone = picks.tone ? TONE_STYLE[picks.tone] : null
  const bg = tone?.bg ?? product.bg
  const fg = tone?.fg ?? '#ffffff'
  const headline = picks.tone ? product.lines[picks.tone] : `${product.name}: ${product.desc.toLowerCase()}`
  const cta = l2Option('cta', picks.cta)
  const aud = l2Option('audience', picks.audience)
  const obj = l2Option('objective', picks.objective)
  const channel = picks.channel

  const art = (
    <motion.div
      key={picks.tone ?? 'none'}
      className="text-[2.6rem] leading-none drop-shadow-[0_4px_0_rgb(0_0_0/.2)]"
      initial={{ scale: 0.4, rotate: -20 }}
      animate={{ scale: 1, rotate: picks.tone === 'rebel' ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
      aria-hidden
    >
      {product.emoji}
      {picks.tone === 'fun' && '🎉'}
      {picks.tone === 'emotional' && '💖'}
      {picks.tone === 'rebel' && '🤘'}
      {picks.tone === 'elegant' && '✨'}
    </motion.div>
  )

  const body = (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center" style={{ color: fg }}>
      {art}
      <AnimatePresence mode="wait">
        <motion.div
          key={headline}
          className={`${tone?.font ?? 'font-display'} text-[1.15rem] leading-[1.1]`}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
        >
          {headline}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {cta && (
          <motion.span
            key={cta.id}
            className="font-display rounded-full px-4 py-1.5 text-[1.05rem] shadow-[0_.2rem_0_rgb(0_0_0/.3)]"
            style={{ background: tone?.ctaBg ?? '#ffffff', color: tone?.ctaFg ?? '#1b1036' }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            exit={{ scale: 0 }}
          >
            {cta.label} →
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )

  let frame
  if (channel === 'tiktok') {
    frame = (
      <div className="relative mx-auto aspect-[9/15] w-[10.5rem] overflow-hidden rounded-[1.8rem] border-[6px] border-[#0b0b10] shadow-[0_.8rem_1.6rem_rgb(0_0_0/.45)]" style={{ background: bg }}>
        {body}
        <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3 text-white" aria-hidden>
          <Heart className="size-6" fill="#fff" />
          <MessageCircle className="size-6" />
          <Share2 className="size-6" />
        </div>
        <div className="absolute inset-x-3 bottom-3 text-left text-[0.8rem] font-extrabold text-white" aria-hidden>
          <div>@{product.name.toLowerCase().replace(/\s/g, '')}</div>
          <div className="flex items-center gap-1 opacity-90">
            <Music2 className="size-3.5" /> sonido original · {product.name}
          </div>
        </div>
      </div>
    )
  } else if (channel === 'instagram') {
    frame = (
      <div className="mx-auto w-[13rem] overflow-hidden rounded-[1.2rem] bg-white text-ink shadow-[0_.8rem_1.6rem_rgb(0_0_0/.45)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="size-7 rounded-full bg-gradient-to-br from-sun via-bubble to-grape p-[2px]">
            <span className="grid size-full place-items-center rounded-full bg-white text-[0.8rem]">{product.emoji}</span>
          </span>
          <div className="leading-tight">
            <div className="text-[0.8rem] font-black">{product.name.toLowerCase().replace(/\s/g, '')}</div>
            <div className="text-[0.65rem] font-bold text-ink-soft">Patrocinado</div>
          </div>
        </div>
        <div className="aspect-square" style={{ background: bg }}>
          {body}
        </div>
        <div className="flex gap-3 px-3 py-2" aria-hidden>
          <Heart className="size-5" fill="#ff4f6d" color="#ff4f6d" />
          <MessageCircle className="size-5" />
          <Send className="size-5" />
        </div>
      </div>
    )
  } else if (channel === 'radio') {
    frame = (
      <div className="mx-auto w-[17rem]">
        <div className="relative rounded-[1.6rem] bg-gradient-to-b from-[#f59e0b] to-[#c2410c] p-3 shadow-[0_.5rem_0_#7c2d12,0_.8rem_1.6rem_rgb(0_0_0/.45)]">
          <div className="absolute -top-8 right-10 h-10 w-1.5 origin-bottom rotate-[18deg] rounded bg-[#44403c]" aria-hidden />
          <div className="flex items-center gap-3 rounded-xl bg-[#1c1917] p-3 text-left">
            <Radio className="size-10 shrink-0 text-sun" />
            <div className="min-w-0">
              <div className="text-[0.7rem] font-black uppercase tracking-widest text-sun">🎙️ Cuña de 30 s</div>
              <div className="text-[1.05rem] font-extrabold leading-tight text-white">«{headline}»</div>
              {cta && <div className="mt-1 text-[0.9rem] font-black text-mint">{cta.label}</div>}
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <motion.span
                key={i}
                className="w-2 rounded-full bg-[#fde68a]"
                animate={{ height: ['0.4rem', `${0.6 + (i % 3) * 0.5}rem`, '0.4rem'] }}
                transition={{ duration: 0.6 + i * 0.07, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  } else if (channel === 'billboard') {
    frame = (
      <div className="mx-auto w-full max-w-[19rem]">
        <div className="rounded-[1rem] bg-[#2a2140] p-2 shadow-[0_.6rem_1.4rem_rgb(0_0_0/.45)]">
          <div className="aspect-[16/8] overflow-hidden rounded-[0.7rem]" style={{ background: bg }}>
            {body}
          </div>
        </div>
        <div className="mx-auto flex w-2/3 justify-between px-6" aria-hidden>
          <div className="h-10 w-3 rounded-b bg-[#2a2140]" />
          <div className="h-10 w-3 rounded-b bg-[#2a2140]" />
        </div>
      </div>
    )
  } else {
    frame = (
      <div className="mx-auto grid aspect-square w-[12rem] place-items-center overflow-hidden rounded-[1.6rem] border-[3px] border-dashed border-white/50" style={{ background: bg }}>
        {body}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div key={channel ?? 'none'} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.28 }} style={{ transformPerspective: 900 }}>
          {frame}
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[0.85rem]">
        {obj && <span className="chip bg-white/15 text-white">🎯 {obj.label}</span>}
        {aud && (
          <span className="chip bg-white/15 text-white">
            {aud.emoji} Para: {aud.label}
          </span>
        )}
      </div>
      <AnimatePresence>
        {stamp && (
          <motion.div
            className="font-display pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 whitespace-nowrap rounded-2xl border-[5px] px-5 py-2 text-[2.2rem] leading-none"
            style={{ color: stamp.good ? '#0e9f68' : '#e11d48', borderColor: stamp.good ? '#0e9f68' : '#e11d48', background: 'rgb(255 255 255 / .92)' }}
            initial={{ scale: 3, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: -12, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 1.3 }}
          >
            {stamp.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
