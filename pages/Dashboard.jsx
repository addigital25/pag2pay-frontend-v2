import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'

function Dashboard() {
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    Promise.all([
      fetch(`${config.apiUrl}/api/dashboard/stats?userId=${user.id}&role=${user.role}`).then(res => res.json()),
      fetch(`${config.apiUrl}/api/orders?userId=${user.id}`).then(res => res.json())
    ])
      .then(([statsData, ordersData]) => {
        setStats(statsData)
        setOrders(ordersData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar dashboard:', err)
        setLoading(false)
      })
  }, [user])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order =>
          order.id === orderId ? updatedOrder : order
        ))

        const statsResponse = await fetch(`${config.apiUrl}/api/dashboard/stats?userId=${user.id}&role=${user.role}`)
        const newStats = await statsResponse.json()
        setStats(newStats)
      }
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err)
      showAlert({
        title: 'Erro ao Atualizar Pedido',
        message: 'Não foi possível atualizar o status do pedido. Por favor, tente novamente.',
        type: 'error'
      })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      shipped: { color: 'bg-blue-100 text-blue-800', text: 'Enviado' },
      delivered: { color: 'bg-purple-100 text-purple-800', text: 'Entregue' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Pago' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'shipped',
      shipped: 'delivered',
      delivered: 'paid',
      paid: null
    }
    return statusFlow[currentStatus]
  }

  const getNextStatusText = (currentStatus) => {
    const statusText = {
      pending: 'Marcar como Enviado',
      shipped: 'Marcar como Entregue',
      delivered: 'Marcar como Pago',
      paid: 'Concluído'
    }
    return statusText[currentStatus]
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Administrativo</h1>

      {/* Banner de Alerta - Documentos Pendentes */}
      {user && (!user.status || user.status === 'pending' || user.status === 'awaiting_adjustment') && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  📋 Aguardando Preenchimento dos Documentos
                </h3>
                <p className="text-gray-700 mb-4">
                  Sua conta ainda não foi verificada. Para começar a vender, você precisa completar o envio dos seus documentos e informações de verificação.
                </p>
                <Link
                  to="/documents"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Preencher Documentos Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total de Pedidos</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pedidos Pagos</p>
              <p className="text-3xl font-bold text-green-600">{stats.paidOrders}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Receita Confirmada</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Receita Pendente</p>
              <p className="text-3xl font-bold text-yellow-600">
                R$ {stats.pendingRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Todos os Pedidos</h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Nenhum pedido encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      R$ {order.productPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          {getNextStatusText(order.status)}
                        </button>
                      )}
                      {order.status === 'paid' && (
                        <span className="text-green-600 font-medium">✓ Concluído</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Fluxo de Status dos Pedidos</h2>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="bg-yellow-100 text-yellow-800 rounded-full px-4 py-2 inline-block font-semibold">
              Pendente
            </div>
            <p className="text-sm text-gray-600 mt-2">Pedido criado</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center flex-1">
            <div className="bg-blue-100 text-blue-800 rounded-full px-4 py-2 inline-block font-semibold">
              Enviado
            </div>
            <p className="text-sm text-gray-600 mt-2">Produto em trânsito</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center flex-1">
            <div className="bg-purple-100 text-purple-800 rounded-full px-4 py-2 inline-block font-semibold">
              Entregue
            </div>
            <p className="text-sm text-gray-600 mt-2">Cliente recebeu</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center flex-1">
            <div className="bg-green-100 text-green-800 rounded-full px-4 py-2 inline-block font-semibold">
              Pago
            </div>
            <p className="text-sm text-gray-600 mt-2">Pagamento confirmado</p>
          </div>
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
    </div>
  )
}

export default Dashboard
