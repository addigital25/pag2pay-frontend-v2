import { useState, useEffect } from 'react'

export default function Logo({ className = "", textClass = "" }) {
  const [customLogo, setCustomLogo] = useState(null)
  const [customTitle, setCustomTitle] = useState('PAG2PAY')

  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings')
        if (response.ok) {
          const settings = await response.json()

          if (settings.images?.logoUrl) {
            setCustomLogo(settings.images.logoUrl)
          }

          if (settings.texts?.siteTitle) {
            setCustomTitle(settings.texts.siteTitle)
          }
        }
      } catch (error) {
        console.log('Usando logo padrão')
      }
    }

    loadPlatformSettings()
  }, [])

  // Se houver logo customizado, mostrar apenas a imagem
  if (customLogo) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={customLogo}
          alt={customTitle}
          className="h-12 w-auto object-contain"
          style={{ maxWidth: '200px' }}
        />
      </div>
    )
  }

  // Logo padrão SVG
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ícone circular com "2" */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Círculos concêntricos */}
        <circle cx="24" cy="24" r="22" stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.3"/>
        <circle cx="24" cy="24" r="17" stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.5"/>
        <circle cx="24" cy="24" r="12" stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.7"/>

        {/* Forma de localização (pin) */}
        <path
          d="M24 8C16.8 8 11 13.8 11 21C11 30 24 40 24 40C24 40 37 30 37 21C37 13.8 31.2 8 24 8Z"
          fill="#16A34A"
          opacity="0.9"
        />

        {/* Número "2" no centro */}
        <text
          x="24"
          y="28"
          fontSize="20"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          2
        </text>
      </svg>

      {/* Texto PAG2PAY */}
      <span className={`font-bold tracking-tight ${textClass}`} style={{ color: '#16A34A' }}>
        PAG<span style={{ color: '#22C55E' }}>2</span>PAY
      </span>
    </div>
  )
}
