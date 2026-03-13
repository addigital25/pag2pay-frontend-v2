import { useState } from 'react'
import AlertModal from './AlertModal'
import { useAlert } from '../hooks/useAlert'

export default function PaymentSimulator({ orderId, onPaymentConfirmed }) {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [simulating, setSimulating] = useState(false)

  const simulatePayment = async () => {
    setSimulating(true)

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/payments/simulate-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const result = await response.json()

      if (response.ok) {
        showAlert({
          title: 'Sucesso!',
          message: 'Pagamento confirmado com sucesso!',
          type: 'success'
        })
        if (onPaymentConfirmed) {
          onPaymentConfirmed(result)
        }
      } else {
        showAlert({
          title: 'Erro',
          message: 'Erro ao simular pagamento',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao simular pagamento:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao conectar com o servidor',
        type: 'error'
      })
    } finally {
      setSimulating(false)
    }
  }

  return (
    <>
      <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-300 border-dashed rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-purple-800">Modo de Teste</p>
            <p className="text-sm text-purple-600">Simular confirmação de pagamento</p>
          </div>
        </div>
        <button
          onClick={simulatePayment}
          disabled={simulating}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {simulating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Simulando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Simular Pagamento
            </>
          )}
        </button>
      </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </>
  )
}
