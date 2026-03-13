import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import config from '../config'

export default function BankMovements() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('order') // 'order' ou 'date'
  const [loading, setLoading] = useState(true)
  const [futureReleases, setFutureReleases] = useState([])
  const [availableBalance, setAvailableBalance] = useState(0)
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)

  // Buscar dados reais do backend
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Buscar pedidos pagos do usuário com sincronização automática das datas do Pagar.me
        const ordersResponse = await fetch(`${config.apiUrl}/api/orders?userId=${user.id}&syncReleaseDate=true`)
        const ordersData = await ordersResponse.json()

        // Filtrar apenas pedidos pagos
        const paidOrders = ordersData.filter(order =>
          order.paymentStatus === 'paid' &&
          order.producerId === user.id
        )

        // Transformar pedidos em lançamentos futuros
        // Usa a data de liberação fornecida pelo gateway ou calcula se não disponível
        const releases = paidOrders.map(order => ({
          id: order.id,
          orderId: order.id,
          customer: order.customer?.name || 'Cliente',
          amount: order.producerCommission || order.totalValue,
          releaseDate: order.releaseDate || order.availableAt || calculateReleaseDate(order.paidAt),
          product: order.productName
        }))

        setFutureReleases(releases)

        // Calcular estatísticas (valores exemplo - ajustar conforme regra de negócio)
        const totalFuture = releases.reduce((sum, r) => sum + r.amount, 0)
        setAvailableBalance(0) // Saldo disponível para saque
        setPendingWithdrawals(0) // Saques em análise
        setTotalWithdrawn(0) // Total já sacado

      } catch (error) {
        console.error('Erro ao buscar movimentações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Calcular data de liberação como fallback caso o gateway não forneça
  // NOTA: Esta função é usada apenas se o gateway não retornar a data
  const calculateReleaseDate = (paidAt) => {
    if (!paidAt) return new Date().toISOString().split('T')[0]

    const paidDate = new Date(paidAt)
    paidDate.setDate(paidDate.getDate() + 30) // Fallback: 30 dias após pagamento
    return paidDate.toISOString().split('T')[0]
  }

  // Saldo a liberar (total de valores futuros)
  const balanceToRelease = futureReleases.reduce((sum, release) => sum + release.amount, 0)

  // Agrupar lançamentos por data
  const groupedByDate = futureReleases.reduce((acc, release) => {
    const date = release.releaseDate
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(release)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort()

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Movimentações</h2>
          <p className="text-sm text-gray-600">Acompanhe seus lançamentos futuros</p>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Saldo Disponível */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Saldo Disponível</p>
                <p className="text-3xl font-bold text-emerald-600">
                  R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Saque em Análise */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Saque em Análise</p>
                <p className="text-3xl font-bold text-yellow-600">
                  R$ {pendingWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Já Sacado */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Já Sacado</p>
                <p className="text-3xl font-bold text-blue-600">
                  R$ {totalWithdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-gray-600">Carregando movimentações...</p>
          </div>
        ) : (
          <>
            {/* Abas */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('order')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                      activeTab === 'order'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Por Pedido
                  </button>
                  <button
                    onClick={() => setActiveTab('date')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                      activeTab === 'date'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Por Data de Liberação
                  </button>
                </div>
              </div>

              {/* Empty State */}
              {futureReleases.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação futura</h3>
                  <p className="text-gray-600">Você ainda não possui lançamentos futuros a receber.</p>
                </div>
              ) : (
                <>
                  {/* Conteúdo da aba: Por Pedido */}
                  {activeTab === 'order' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data de Liberação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {futureReleases.map((release) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{release.orderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{release.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{release.product}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                        R$ {release.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(release.releaseDate).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">
                      Total a Receber:
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                      R$ {balanceToRelease.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Conteúdo da aba: Por Data */}
          {activeTab === 'date' && (
            <div className="p-6 space-y-6">
              {sortedDates.map((date) => {
                const releases = groupedByDate[date]
                const totalForDate = releases.reduce((sum, r) => sum + r.amount, 0)

                return (
                  <div key={date} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {new Date(date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Total do dia: </span>
                        <span className="font-bold text-emerald-600">
                          R$ {totalForDate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {releases.map((release) => (
                        <div key={release.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <span className="font-medium text-gray-900">{release.orderId}</span>
                              <span className="text-sm text-gray-600">{release.customer}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{release.product}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-emerald-600">
                              R$ {release.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
