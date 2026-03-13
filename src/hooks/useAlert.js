import { useState } from 'react'

/**
 * Hook customizado para gerenciar alertas modais
 *
 * Uso:
 * const { alertState, showAlert, hideAlert } = useAlert()
 *
 * showAlert({
 *   title: 'Sucesso!',
 *   message: 'Operação realizada com sucesso',
 *   type: 'success'
 * })
 */
export function useAlert() {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    buttonText: 'OK'
  })

  const showAlert = ({ title = '', message, type = 'info', buttonText = 'OK' }) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      buttonText
    })
  }

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  return {
    alertState,
    showAlert,
    hideAlert
  }
}
