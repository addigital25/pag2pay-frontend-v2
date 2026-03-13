import { createContext, useContext, useState } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, duration) => showToast(message, 'success', duration)
  const error = (message, duration) => showToast(message, 'error', duration)
  const warning = (message, duration) => showToast(message, 'warning', duration)
  const info = (message, duration) => showToast(message, 'info', duration)

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {/* Container de Toasts - Posição fixa no topo da tela */}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  )
}
