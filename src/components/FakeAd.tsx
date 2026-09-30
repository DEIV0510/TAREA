import { Heart, MessageCircle, Send, Star } from 'lucide-react'
import type { AdSpec } from '../types'

/** Pieza publicitaria ficticia dibujada con CSS (póster, post, valla o historia). */
export function FakeAd({ ad, className = '' }: { ad: AdSpec; className?: string }) {
  const fg = ad.fg ?? '#ffffff'
  const extra = ad.extra

  const extraEl = extra ? (
    extra.kind === 'stars' ? (
      <div className="flex items-center justify-center gap-[0.25em] rounded-full bg-white/85 px-[0.8em] py-[0.25em] text-[0.9em] font-black text-ink">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="size-[1em]" fill="#f5a300" color="#f5a300" />
        ))}
        <span className="ml-1">{extra.text}</span>
      </div>
    ) : extra.kind === 'countdown' ? (
      <div className="rounded-[0.7em] bg-black/35 px-[0.8em] py-[0.35em] text-center">
        <div className="text-[0.7em] font-black uppercase tracking-widest opacity-90">Termina en</div>
        <div className="font-display tabular text-[1.9em] leading-none">⏰ {extra.text}</div>
      </div>
    ) : extra.kind === 'price' ? (
      <div className="flex items-end gap-[0.6em]">
        <span className="text-[1.1em] font-black line-through opacity-70">{extra.before}</span>
        <span className="font-display rounded-[0.35em] bg-[#e11d48] px-[0.35em] py-[0.1em] text-[2em] leading-none text-white shadow-[0_.1em_0_#881337]">
          {extra.now}
        </span>
      </div>
    ) : (
      <div className="font-display rotate-[-4deg] rounded-[0.6em] bg-white px-[0.7em] py-[0.2em] text-[1.1em] text-ink shadow-[0_.15em_0_rgb(0_0_0/.25)]">
        {extra.text}
      </div>
    )
  ) : null

  if (ad.format === 'billboard') {
    return (
      <figure className={`@container mx-auto w-full max-w-[34rem] ${className}`} aria-label={`Valla publicitaria de ${ad.brand}`}>
        <div className="rounded-[1.1rem] bg-[#2a2140] p-2 shadow-[0_.6rem_1.4rem_rgb(0_0_0/.4)]">
          <div className="relative flex aspect-[16/8] items-center gap-[4cqi] overflow-hidden rounded-[0.8rem] px-[5cqi] pt-[5cqi] text-[3.3cqi]" style={{ background: ad.bg, color: fg }}>
            <div className="max-w-[40%] break-all text-[11cqi] leading-none drop-shadow-[0_4px_0_rgb(0_0_0/.2)]" aria-hidden>
              {ad.art}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-[2cqi]">
              <div className="font-display text-[6.4cqi] leading-[1.05]">{ad.headline}</div>
              {ad.sub && <div className="text-[3.4cqi] font-extrabold opacity-90">{ad.sub}</div>}
              {extraEl}
            </div>
            <div className="font-display absolute right-[2.5cqi] top-[2cqi] rounded-lg bg-white/90 px-[1.5cqi] py-[0.3cqi] text-[3.2cqi] text-ink">{ad.brand}</div>
          </div>
        </div>
        <div className="mx-auto flex w-2/3 justify-between px-6" aria-hidden>
          <div className="h-8 w-3 rounded-b bg-[#2a2140]" />
          <div className="h-8 w-3 rounded-b bg-[#2a2140]" />
        </div>
      </figure>
    )
  }

  if (ad.format === 'post') {
    return (
      <figure className={`mx-auto w-full max-w-[20rem] overflow-hidden rounded-[1.2rem] bg-white text-ink shadow-[0_.6rem_1.4rem_rgb(0_0_0/.4)] ${className}`} aria-label={`Publicación de ${ad.brand}`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="size-8 rounded-full bg-gradient-to-br from-sun via-bubble to-grape p-[2px]">
            <span className="block size-full rounded-full bg-white" />
          </span>
          <div className="leading-tight">
            <div className="text-[0.85rem] font-black">{ad.brand}</div>
            <div className="text-[0.7rem] font-bold text-ink-soft">Patrocinado</div>
          </div>
        </div>
        <div className="flex aspect-square flex-col items-center justify-center gap-3 px-4 text-center" style={{ background: ad.bg, color: fg }}>
          <div className="text-[4.2rem] leading-none" aria-hidden>
            {ad.art}
          </div>
          <div className="font-display text-[1.6rem] leading-[1.05]">{ad.headline}</div>
          {ad.sub && <div className="text-[0.9rem] font-extrabold opacity-90">{ad.sub}</div>}
          {extraEl}
        </div>
        <div className="flex items-center gap-3 px-3 py-2" aria-hidden>
          <Heart className="size-5" fill="#ff4f6d" color="#ff4f6d" />
          <MessageCircle className="size-5" />
          <Send className="size-5" />
        </div>
      </figure>
    )
  }

  if (ad.format === 'story') {
    return (
      <figure
        className={`relative mx-auto flex aspect-[9/14] w-full max-w-[15rem] flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.6rem] border-[6px] border-[#1b1036] px-4 text-center shadow-[0_.6rem_1.4rem_rgb(0_0_0/.4)] ${className}`}
        style={{ background: ad.bg, color: fg }}
        aria-label={`Historia de ${ad.brand}`}
      >
        <div className="absolute inset-x-3 top-2 flex gap-1" aria-hidden>
          <span className="h-1 flex-1 rounded bg-white" />
          <span className="h-1 flex-1 rounded bg-white/50" />
          <span className="h-1 flex-1 rounded bg-white/50" />
        </div>
        <div className="font-display absolute left-3 top-4 text-[0.9rem]">{ad.brand}</div>
        <div className="text-[3.6rem] leading-none" aria-hidden>
          {ad.art}
        </div>
        <div className="font-display text-[1.5rem] leading-[1.05]">{ad.headline}</div>
        {ad.sub && <div className="text-[0.85rem] font-extrabold opacity-90">{ad.sub}</div>}
        {extraEl}
      </figure>
    )
  }

  return (
    <figure
      className={`relative mx-auto flex aspect-[4/5] w-full max-w-[17rem] flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.2rem] px-5 text-center shadow-[0_.6rem_1.4rem_rgb(0_0_0/.4)] ring-4 ring-white/80 ${className}`}
      style={{ background: ad.bg, color: fg }}
      aria-label={`Afiche de ${ad.brand}`}
    >
      <div className="text-[4rem] leading-none" aria-hidden>
        {ad.art}
      </div>
      <div className="font-display text-[1.55rem] leading-[1.05]">{ad.headline}</div>
      {ad.sub && <div className="text-[0.9rem] font-extrabold opacity-90">{ad.sub}</div>}
      {extraEl}
      <div className="font-display absolute bottom-3 text-[1.1rem] tracking-wider opacity-95">{ad.brand}</div>
    </figure>
  )
}
