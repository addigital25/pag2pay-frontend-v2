import { useEffect, useState } from 'react'

export default function TurbinaVendas({ score = 0, showLabel = true, size = 'md' }) {
  const [currentScore, setCurrentScore] = useState(0)

  // Animação suave ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScore(score)
    }, 100)
    return () => clearTimeout(timer)
  }, [score])

  // Garantir que score está entre 0 e 150
  const validScore = Math.min(150, Math.max(0, currentScore))
  const percentage = (validScore / 150) * 100

  // Determinar nível e configurações
  const getLevel = () => {
    if (validScore <= 30) return {
      name: 'Devagar',
      emoji: '🐌',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    }
    if (validScore <= 60) return {
      name: 'Andando',
      emoji: '🏃',
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300'
    }
    if (validScore <= 90) return {
      name: 'Acelerando',
      emoji: '🏎️',
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300'
    }
    if (validScore <= 120) return {
      name: 'Turbo',
      emoji: '🚀',
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300'
    }
    return {
      name: 'HIPER SPEED!',
      emoji: '⚡',
      color: 'from-yellow-400 via-orange-400 to-yellow-500',
      bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
      textColor: 'text-orange-700',
      borderColor: 'border-yellow-400',
      animate: true
    }
  }

  const level = getLevel()

  // Tamanhos
  const sizeClasses = {
    sm: {
      height: 'h-2',
      container: 'p-2',
      text: 'text-xs',
      emoji: 'text-sm'
    },
    md: {
      height: 'h-4',
      container: 'p-3',
      text: 'text-sm',
      emoji: 'text-base'
    },
    lg: {
      height: 'h-6',
      container: 'p-4',
      text: 'text-base',
      emoji: 'text-lg'
    }
  }

  const sizeConfig = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`${sizeConfig.container} ${level.bgColor} rounded-lg border-2 ${level.borderColor} ${level.animate ? 'animate-pulse' : ''}`}>
      {/* Label e Score */}
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={sizeConfig.emoji}>{level.emoji}</span>
            <span className={`font-bold ${level.textColor} ${sizeConfig.text}`}>
              Turbina de Vendas: {level.name}
            </span>
          </div>
          <span className={`font-bold ${level.textColor} ${sizeConfig.text}`}>
            {validScore}/150
          </span>
        </div>
      )}

      {/* Barra de Progresso */}
      <div className={`w-full ${sizeConfig.height} bg-white rounded-full overflow-hidden border border-gray-200 relative`}>
        {/* Barra de fundo (track) */}
        <div className="absolute inset-0 bg-gray-100"></div>

        {/* Barra de progresso com gradiente */}
        <div
          className={`${sizeConfig.height} bg-gradient-to-r ${level.color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Efeito shimmer para HIPER SPEED */}
          {level.animate && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          )}
        </div>
      </div>

      {/* Marcadores de níveis (opcional, apenas para tamanho lg) */}
      {size === 'lg' && (
        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs text-gray-500">0</span>
          <span className="text-xs text-gray-500">30</span>
          <span className="text-xs text-gray-500">60</span>
          <span className="text-xs text-gray-500">90</span>
          <span className="text-xs text-gray-500">120</span>
          <span className="text-xs text-gray-500">150</span>
        </div>
      )}
    </div>
  )
}
