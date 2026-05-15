import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GolfApp from './GolfApp.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GolfApp />
  </StrictMode>,
)
