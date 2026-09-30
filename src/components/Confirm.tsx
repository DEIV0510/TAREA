import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CandyButton } from './CandyButton'

type Ask = (message: string, opts?: { yes?: string; no?: string; danger?: boolean }) => Promise<boolean>

const Ctx = createContext<Ask>(async () => false)

/** Confirmación dentro del juego (los diálogos del navegador no siempre están disponibles). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<{ message: string; yes: string; no: string; danger: boolean } | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)
  const yesRef = useRef<HTMLButtonElement>(null)

  const ask = useCallback<Ask>((message, opts) => {
    resolver.current?.(false)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
      setReq({ message, yes: opts?.yes ?? 'Sí, continuar', no: opts?.no ?? 'Cancelar', danger: opts?.danger ?? false })
    })
  }, [])

  const close = (v: boolean) => {
    resolver.current?.(v)
    resolver.current = null
    setReq(null)
  }

  useEffect(() => {
    if (!req) return
    const t = window.setTimeout(() => yesRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req])

  return (
    <Ctx.Provider value={ask}>
      {children}
      <AnimatePresence>
        {req && (
          <motion.div className="fixed inset-0 z-[120] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="Cancelar" className="absolute inset-0 cursor-default bg-[#0b0520]/70" onClick={() => close(false)} />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-msg"
              className="card-white relative w-full max-w-lg p-6 text-center"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            >
              <div className="text-[2.6rem] leading-none" aria-hidden>
                {req.danger ? '⚠️' : '🤔'}
              </div>
              <p id="confirm-msg" className="mt-2 text-[1.3rem] font-black leading-snug text-ink">
                {req.message}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <CandyButton tone="white" className="text-[1.15rem]" onClick={() => close(false)}>
                  {req.no}
                </CandyButton>
                <CandyButton ref={yesRef} tone={req.danger ? 'danger' : 'sun'} className="text-[1.15rem]" onClick={() => close(true)}>
                  {req.yes}
                </CandyButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

export function useConfirm(): Ask {
  return useContext(Ctx)
}
