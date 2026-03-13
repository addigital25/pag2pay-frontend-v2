import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function PaymentSuccess() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Animação de Sucesso */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 shadow-lg animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Pagamento Confirmado!</h1>
            <p className="text-xl text-gray-600">Obrigado pela sua compra 🎉</p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Informações do Pedido */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalhes da Compra</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Número do Pedido</p>
                  <p className="font-bold text-lg text-gray-800">#{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data do Pagamento</p>
                  <p className="font-bold text-lg text-gray-800">
                    {new Date(order.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Produto</p>
                  <p className="font-semibold text-gray-800">{order.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Pago</p>
                  <p className="font-bold text-2xl text-green-600">
                    R$ {order.totalValue.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações de Pagamento */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Método de Pagamento
              </h3>
              <p className="text-gray-700 text-lg">
                {order.paymentMethod === 'pix' && '💳 PIX'}
                {order.paymentMethod === 'boleto' && '🏦 Boleto Bancário'}
                {order.paymentMethod === 'creditCard' && `💳 Cartão de Crédito ${order.paymentDetails?.cardBrand ? `(${order.paymentDetails.cardBrand})` : ''}`}
                {order.paymentMethod === 'afterPay' && '📦 Receba e Pague'}
              </p>
              {order.paymentDetails?.authorizationCode && (
                <p className="text-sm text-gray-600 mt-2">
                  Código de Autorização: <span className="font-mono font-semibold">{order.paymentDetails.authorizationCode}</span>
                </p>
              )}
            </div>

            {/* Cliente */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-gray-800 mb-3">Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nome</p>
                  <p className="font-semibold text-gray-800">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Telefone</p>
                  <p className="font-semibold text-gray-800">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">CPF</p>
                  <p className="font-semibold text-gray-800">{order.customer.cpf}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>

            <Link
              to="/dashboard"
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ir para Dashboard
            </Link>
          </div>

          {/* Informação Adicional */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Próximos Passos
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Você receberá um email com o comprovante de pagamento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>O produtor será notificado e iniciará o processamento do seu pedido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Você pode acompanhar o status do pedido no dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
