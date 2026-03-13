import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'

export default function Abandoned() {
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [abandoned, setAbandoned] = useState([])
  const [stats, setStats] = useState({
    totalValue: 0,
    totalCount: 0,
    abandonmentRate: 0
  })

  useEffect(() => {
    fetchAbandonedCarts()
  }, [])

  const fetchAbandonedCarts = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = user?.id
      const url = userId
        ? `${config.apiUrl}/api/reports/abandoned?userId=${userId}`
        : `${config.apiUrl}/api/reports/abandoned`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAbandoned(data.abandoned || [])
        setStats(data.stats || {
          totalValue: 0,
          totalCount: 0,
          abandonmentRate: 0
        })
      }
    } catch (error) {
      console.error('Erro ao carregar carrinhos abandonados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async (abandonedId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.apiUrl}/api/abandoned/${abandonedId}/reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        showAlert({
          title: 'Sucesso!',
          message: 'Lembrete enviado com sucesso!',
          type: 'success'
        })
      } else {
        showAlert({
          title: 'Erro',
          message: 'Erro ao enviar lembrete',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao enviar lembrete',
        type: 'error'
      })
    }
  }

  const getStepLabel = (step) => {
    const steps = {
      checkout: 'Checkout',
      payment: 'Pagamento',
      confirmation: 'Confirmação'
    }
    return steps[step] || step
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Abandonos</h1>
          <p className="text-gray-600">Carrinhos e checkouts abandonados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Abandonado</p>
            <p className="text-3xl font-bold text-orange-600">
              R$ {stats.totalValue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Carrinhos Abandonados</p>
            <p className="text-3xl font-bold text-red-600">{stats.totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Taxa de Abandono</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.abandonmentRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Média mensal</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Etapa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Abandonado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {abandoned.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum carrinho abandonado encontrado
                  </td>
                </tr>
              ) : (
                abandoned.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.customer?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.customer?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                      R$ {item.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {getStepLabel(item.step)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.abandonedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleSendReminder(item.id)}
                        className="text-emerald-600 hover:text-emerald-900 font-medium"
                      >
                        Enviar Lembrete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Dica de Recuperação</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Envie emails automáticos para clientes que abandonaram o carrinho com descontos especiais ou lembretes. Estudos mostram que 30% dos carrinhos abandonados podem ser recuperados com follow-up adequado.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </AdminLayout>
  )
}
