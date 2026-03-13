import { useEffect } from 'react'

function PlatformModal({ isOpen, onClose, title, message, type = 'info', buttonText = 'OK', showCancel = false, onConfirm }) {
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Cores baseadas no tipo
  const typeStyles = {
    success: {
      icon: '✅',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      buttonBg: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: '❌',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const style = typeStyles[type] || typeStyles.info

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Ícone */}
          <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-2xl">{style.icon}</span>
          </div>

          {/* Título */}
          <h3 className={`text-xl font-bold text-center mb-3 ${style.titleColor}`}>
            {title}
          </h3>

          {/* Mensagem */}
          <p className="text-slate-600 text-center mb-6">
            {message}
          </p>

          {/* Botões */}
          <div className={`flex gap-3 ${showCancel ? 'justify-end' : 'justify-center'}`}>
            {showCancel && (
              <button
                onClick={onClose}
                className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-6 py-2 text-white rounded-lg transition font-medium ${style.buttonBg}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformModal
