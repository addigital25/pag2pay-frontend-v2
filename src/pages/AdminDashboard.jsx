import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useDemoMode } from '../hooks/useDemoMode'
import { generateDemoDashboard, generateDemoSales, DemoBanner } from '../utils/demoData.jsx'
import config from '../config'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDemoMode, loading: demoLoading } = useDemoMode()

  useEffect(() => {
    if (demoLoading) return

    if (isDemoMode) {
      // Modo Demo: Usar dados fictícios
      const demoData = generateDemoDashboard()
      const demoOrders = generateDemoSales(5)

      setStats({
        totalRevenue: demoData.revenue.total / 100,
        totalOrders: demoData.sales.total,
        pendingOrders: demoData.products.pending,
        totalProducts: demoData.products.total
      })
      setOrders(demoOrders)
      setLoading(false)
    } else {
      // Modo Normal: Buscar dados reais
      const loadDashboard = async () => {
        try {
          const token = localStorage.getItem('token')
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }

          const [statsRes, ordersRes] = await Promise.all([
            fetch(`${config.apiUrl}/api/dashboard/stats`, { headers }),
            fetch(`${config.apiUrl}/api/orders`, { headers })
          ])

          if (statsRes.ok && ordersRes.ok) {
            const statsData = await statsRes.json()
            const ordersData = await ordersRes.json()

            setStats(statsData)
            setOrders(ordersData.slice(0, 5))
          } else {
            console.error('Erro nas respostas:', statsRes.status, ordersRes.status)
          }
        } catch (err) {
          console.error('Erro ao carregar dashboard:', err)
        } finally {
          setLoading(false)
        }
      }

      loadDashboard()
    }
  }, [isDemoMode, demoLoading])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: 'Receita Total',
      value: `R$ ${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: '💰',
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      title: 'Total de Pedidos',
      value: stats?.totalOrders || 0,
      icon: '📦',
      color: 'bg-blue-500',
      change: '+5.2%'
    },
    {
      title: 'Pedidos Pendentes',
      value: stats?.pendingOrders || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
      change: '-2.1%'
    },
    {
      title: 'Pedidos Pagos',
      value: stats?.paidOrders || 0,
      icon: '✅',
      color: 'bg-purple-500',
      change: '+8.3%'
    }
  ]

  return (
    <AdminLayout>
      {/* Banner Modo Demo */}
      {isDemoMode && <DemoBanner className="mb-6" />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Pedidos Recentes</h3>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Ver todos →
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum pedido encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.productName}</p>
                      <p className="text-sm text-gray-500">{order.customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">R$ {order.productPrice.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' :
                      order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'paid' ? 'Pago' :
                       order.status === 'delivered' ? 'Entregue' :
                       order.status === 'shipped' ? 'Enviado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Receitas</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Confirmada</span>
                <span className="font-semibold">R$ {(stats?.totalRevenue || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pendente</span>
                <span className="font-semibold">R$ {(stats?.pendingRevenue || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '35%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
