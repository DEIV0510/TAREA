import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type CSSProperties } from 'react'
import { sfx } from '../lib/sound'

export type Tone = 'sun' | 'bubble' | 'sky' | 'mint' | 'grape' | 'white' | 'ghost' | 'danger'

interface Props extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  tone?: Tone
  sound?: boolean
  /** Colores propios (p. ej. el color del equipo) */
  colors?: { a: string; b: string; lip: string; text?: string }
}

export const CandyButton = forwardRef<HTMLButtonElement, Props>(function CandyButton(
  { tone = 'grape', sound = true, colors, className = '', style, onClick, children, disabled, ...rest },
  ref,
) {
  const custom = colors
    ? ({ '--b1': colors.a, '--b2': colors.b, '--lip': colors.lip, '--fg': colors.text ?? '#fff' } as CSSProperties)
    : undefined
  return (
    <motion.button
      ref={ref}
      type="button"
      className={`btn-candy is-${tone} ${className}`}
      style={{ ...custom, ...style }}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      disabled={disabled}
      onClick={(e) => {
        if (sound) sfx.click()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
})
