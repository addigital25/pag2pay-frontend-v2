import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import config from '../config'

export default function ChurnRate() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState([])
  const [stats, setStats] = useState({
    avgChurnRate: 0,
    totalChurned: 0,
    totalNew: 0,
    currentTotal: 0,
    netGrowth: 0
  })

  useEffect(() => {
    fetchChurnData()
  }, [])

  const fetchChurnData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.apiUrl}/api/reports/churn`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Churn data received:', result)

        if (result.success) {
          setMonthlyData(result.data || [])
          setStats(result.stats || {
            avgChurnRate: 0,
            totalChurned: 0,
            totalNew: 0,
            currentTotal: 0,
            netGrowth: 0
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de churn:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Churn Rate</h1>
          <p className="text-gray-600">Taxa de cancelamento e reembolso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Taxa Média de Churn</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.avgChurnRate?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Últimos 12 meses</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Usuários Perdidos</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats.totalChurned || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total no período</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Novos Usuários</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalNew || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total no período</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Atual</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.currentTotal || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Usuários ativos</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Evolução Mensal de Churn</h3>
            <p className="text-sm text-gray-600 mt-1">Dados dos últimos 12 meses</p>
          </div>

          {monthlyData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">📊</p>
              <p>Nenhum dado disponível</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Início do Mês
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Novos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perdidos (Churn)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Final
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa de Churn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyData.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {month.startOfMonth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        +{month.newUsers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        -{month.churnedUsers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {month.totalUsers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          month.churnRate === 0 ? 'bg-green-100 text-green-800' :
                          month.churnRate < 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {month.churnRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
