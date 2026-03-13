import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PixPayment from '../components/PixPayment'
import BoletoPayment from '../components/BoletoPayment'
import CreditCardPayment from '../components/CreditCardPayment'

function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}`)
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Erro ao carregar pedido:', error)
    }
    setLoading(false)
  }

  const handlePaymentComplete = (paymentData) => {
    // Redirecionar para página de sucesso
    window.location.href = `/payment-success/${orderId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Pedido não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pedido Confirmado!</h1>
                <p className="text-gray-600">Pedido #{order.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produto</p>
                  <p className="font-semibold text-gray-800">
                    {order.productName}
                    {order.selectedPlanName && ` - ${order.selectedPlanName}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                  <p className="font-semibold text-gray-800 text-xl">
                    R$ {order.totalValue.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Componente de Pagamento baseado no método selecionado */}
          {order.paymentMethod === 'pix' && (
            <PixPayment
              orderId={order.id}
              totalValue={order.totalValue}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {order.paymentMethod === 'boleto' && (
            <BoletoPayment
              orderId={order.id}
              totalValue={order.totalValue}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {order.paymentMethod === 'creditCard' && (
            <CreditCardPayment
              orderId={order.id}
              totalValue={order.totalValue}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {order.paymentMethod === 'afterPay' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Receba e Pague</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Seu pedido foi confirmado! Você receberá o código de rastreio e mais informações em seu whatsapp.
                </p>

                {/* Ícones de Segurança */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-gray-700">Dados Protegidos</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-gray-700">Ambiente Criptografado</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-gray-700">Compra 100% Segura</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
