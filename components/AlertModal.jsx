import { useEffect } from 'react'

/**
 * Componente de Modal de Alerta Reutilizável
 *
 * @param {boolean} isOpen - Controla se o modal está visível
 * @param {function} onClose - Função chamada ao fechar o modal
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem do modal
 * @param {string} type - Tipo do alerta: 'success', 'error', 'warning', 'info'
 * @param {string} buttonText - Texto do botão (padrão: 'OK')
 */
export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) {
  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Permitir fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Configurações de estilo por tipo
  const typeConfig = {
    success: {
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const config = typeConfig[type] || typeConfig.info

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone */}
        <div className="mb-4">
          <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center ${config.iconColor}`}>
            {config.icon}
          </div>
        </div>

        {/* Título */}
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
        )}

        {/* Mensagem */}
        <p className="text-gray-600 mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* Botão */}
        <button
          onClick={onClose}
          className={`w-full ${config.buttonColor} text-white py-3 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
