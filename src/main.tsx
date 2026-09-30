import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ClockProvider, GameProvider, UIProvider } from './game/GameContext'
import { FxProvider } from './lib/fx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <UIProvider>
        <ClockProvider>
          <FxProvider>
            <App />
          </FxProvider>
        </ClockProvider>
      </UIProvider>
    </GameProvider>
  </StrictMode>,
)
