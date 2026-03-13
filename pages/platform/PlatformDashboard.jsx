import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import * as api from '../../services/api'
import config from '../../config'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import authenticatedFetch from '../../utils/authenticatedFetch'

export default function PlatformDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersChange: 0,
    totalProducts: 0,
    productsChange: 0,
    totalVolume: 0,
    volumeChange: 0,
    platformCommission: 0,
    commissionChange: 0,
    pendingApprovals: 0,
    activeSplitAccounts: 0,
    monthlyRevenue: 0
  })
  const [salesData, setSalesData] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Carregar estatísticas da API
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      console.log('🔍 [PLATFORM DASHBOARD] Iniciando carregamento de stats...')
      console.log('🔍 [PLATFORM DASHBOARD] API URL:', config.apiUrl)

      // Buscar estatísticas básicas
      console.log('🔍 [PLATFORM DASHBOARD] Buscando stats básicas...')
      const basicStats = await api.getPlatformStats()
      console.log('✅ [PLATFORM DASHBOARD] Stats básicas recebidas:', basicStats)

      // Buscar estatísticas financeiras detalhadas
      console.log('🔍 [PLATFORM DASHBOARD] Buscando financial stats...')
      const financialUrl = `${config.apiUrl}/api/platform/financial-stats`
      console.log('🔍 [PLATFORM DASHBOARD] Financial URL:', financialUrl)

      const financialResponse = await authenticatedFetch(financialUrl)
      console.log('✅ [PLATFORM DASHBOARD] Financial response status:', financialResponse.status)

      if (!financialResponse.ok) {
        throw new Error(`Financial stats failed: ${financialResponse.status}`)
      }

      const financialData = await financialResponse.json()
      console.log('✅ [PLATFORM DASHBOARD] Financial data recebido:', financialData)

      if (financialData.success) {
        setStats({
          totalUsers: basicStats.totalUsers || 0,
          pendingUsers: basicStats.pendingUsers || 0,
          approvedUsers: basicStats.approvedUsers || 0,
          totalProducts: basicStats.totalProducts || 0,
          pendingProducts: basicStats.pendingProducts || 0,
          activeProducts: basicStats.activeProducts || 0,
          totalVolume: financialData.stats.totalRevenue || 0,
          platformCommission: financialData.stats.platformCommission || 0,
          pendingApprovals: (basicStats.pendingUsers || 0) + (basicStats.pendingProducts || 0),
          monthlyRevenue: financialData.stats.monthlyRevenue || 0,
          usersChange: financialData.stats.monthlyGrowth > 0 ? Math.abs(financialData.stats.monthlyGrowth).toFixed(1) : 0,
          productsChange: financialData.stats.monthlyGrowth > 0 ? Math.abs(financialData.stats.monthlyGrowth).toFixed(1) : 0,
          volumeChange: financialData.stats.monthlyGrowth > 0 ? Math.abs(financialData.stats.monthlyGrowth).toFixed(1) : 0,
          commissionChange: financialData.stats.monthlyGrowth > 0 ? Math.abs(financialData.stats.monthlyGrowth).toFixed(1) : 0,
          activeSplitAccounts: basicStats.totalUsers || 0
        })

        // Atualizar dados dos gráficos e tabelas
        setSalesData(financialData.salesData || [])
        setRecentUsers(financialData.recentUsers || [])
        setTopProducts(financialData.topProducts || [])
      }
    } catch (err) {
      console.error('❌ [PLATFORM DASHBOARD] Erro ao carregar estatísticas:', err)
      console.error('❌ [PLATFORM DASHBOARD] Erro detalhado:', err.message)
      console.error('❌ [PLATFORM DASHBOARD] Stack:', err.stack)
      // Manter valores vazios se API falhar
      setStats({
        totalUsers: 0,
        usersChange: 0,
        totalProducts: 0,
        productsChange: 0,
        totalVolume: 0,
        volumeChange: 0,
        platformCommission: 0,
        commissionChange: 0,
        pendingApprovals: 0,
        activeSplitAccounts: 0,
        monthlyRevenue: 0,
        pendingUsers: 0,
        approvedUsers: 0,
        pendingProducts: 0,
        activeProducts: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const userStatusData = [
    { name: 'Aprovados', value: stats.approvedUsers || 1, color: '#10B981' },
    { name: 'Pendentes', value: stats.pendingUsers || 1, color: '#F59E0B' },
    { name: 'Rejeitados', value: 1, color: '#EF4444' }
  ]

  const productStatusData = [
    { name: 'Ativos', value: stats.activeProducts || 2, color: '#3B82F6' },
    { name: 'Pendentes', value: stats.pendingProducts || 2, color: '#F59E0B' },
    { name: 'Suspensos', value: 1, color: '#6B7280' }
  ]

  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando estatísticas...</p>
          </div>
        </div>
      </PlatformLayout>
    )
  }


  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-600">Visão geral da plataforma Pag2Pay</p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Usuários */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                +{stats.usersChange}%
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Usuários Ativos</p>
              <p className="text-3xl font-bold text-slate-800">
                {stats.totalUsers.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Total de Produtos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                +{stats.productsChange}%
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Produtos na Plataforma</p>
              <p className="text-3xl font-bold text-slate-800">
                {stats.totalProducts.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Volume Total */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                +{stats.volumeChange}%
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Volume Total</p>
              <p className="text-3xl font-bold text-slate-800">
                R$ {(stats.totalVolume / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>

          {/* Comissão da Plataforma */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                +{stats.commissionChange}%
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Comissão (3%)</p>
              <p className="text-3xl font-bold text-slate-800">
                R$ {(stats.platformCommission / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        {/* Cards Secundários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aprovações Pendentes */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-3xl font-bold">{stats.pendingApprovals}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Aprovações Pendentes</p>
            <button className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs font-medium">
              Ver Pendências →
            </button>
          </div>

          {/* Contas Split Ativas */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-3xl font-bold">{stats.activeSplitAccounts}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Contas Split Conectadas</p>
            <p className="text-xs opacity-75 mt-1">Pagarme integrado</p>
          </div>

          {/* Receita Mensal */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-2xl font-bold">R$ {(stats.monthlyRevenue / 1000).toFixed(0)}K</span>
            </div>
            <p className="text-sm font-medium opacity-90">Receita Este Mês</p>
            <p className="text-xs opacity-75 mt-1">Comissões acumuladas</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Vendas */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Vendas Mensais</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="vendas" stroke="#3B82F6" strokeWidth={2} name="Vendas" />
                <Line yAxisId="right" type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={2} name="Receita (R$)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Status de Usuários */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Status dos Usuários</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Status de Produtos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Status dos Produtos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {productStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Comissões */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Evolução de Comissões</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receita" fill="#10B981" name="Receita Total (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuários Recentes */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Usuários Recentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                            {user.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.status === 'pending' ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Aprovado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">
                        Nenhum usuário cadastrado ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Produtos */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Produtos Mais Vendidos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.length > 0 ? (
                    topProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.seller}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {product.sales}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">
                        Nenhuma venda realizada ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PlatformLayout>
  )
}
