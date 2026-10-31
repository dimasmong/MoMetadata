import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './i18n'
import { MetadataProvider } from './context/MetadataContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <MetadataProvider>
          <App />
        </MetadataProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
