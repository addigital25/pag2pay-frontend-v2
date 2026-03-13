import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import config from '../config'

export default function AfterPayReports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [affiliates, setAffiliates] = useState([])
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [metrics, setMetrics] = useState({
    delivered: { count: 0, value: 0 },
    scheduled: { count: 0, value: 0 },
    waiting: { count: 0, value: 0 }
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (affiliates.length > 0) {
      calculateMetrics()
    }
  }, [affiliates, selectedProduct])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Buscar produtos do usuário
      const productsRes = await fetch(`${config.apiUrl}/api/products?userId=${user.id}&type=my-products`)
      const productsData = await productsRes.json()
      setProducts(productsData)

      // Buscar todos os pedidos do usuário
      const ordersRes = await fetch(`${config.apiUrl}/api/orders?userId=${user.id}`)
      const ordersData = await ordersRes.json()

      // Filtrar apenas pedidos AfterPay
      const afterPayOrders = ordersData.filter(order => order.paymentMethod === 'afterPay')

      // Agrupar vendas por afiliado
      const affiliateMap = new Map()

      afterPayOrders.forEach(order => {
        if (order.affiliateId) {
          const key = order.affiliateId
          if (!affiliateMap.has(key)) {
            affiliateMap.set(key, {
              id: order.affiliateId,
              name: order.affiliateName || 'Afiliado',
              email: order.affiliateEmail || 'N/A',
              sales: [],
              totalSales: 0,
              totalValue: 0,
              frustrationRate: 0,
              status: 'Aprovada'
            })
          }
          const affiliate = affiliateMap.get(key)
          affiliate.sales.push(order)
          affiliate.totalSales++
          affiliate.totalValue += order.totalValue || 0
        }
      })

      // Calcular taxa de frustração (pedidos cancelados/total)
      affiliateMap.forEach(affiliate => {
        const canceledCount = affiliate.sales.filter(s => s.status === 'canceled' || s.status === 'failed').length
        affiliate.frustrationRate = affiliate.totalSales > 0
          ? ((canceledCount / affiliate.totalSales) * 100).toFixed(1)
          : 0
      })

      // Converter para array e ordenar por número de vendas
      const affiliatesArray = Array.from(affiliateMap.values())
      affiliatesArray.sort((a, b) => b.totalSales - a.totalSales)

      setAffiliates(affiliatesArray)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  const calculateMetrics = () => {
    const filteredAffiliates = selectedProduct === 'all'
      ? affiliates
      : affiliates.map(aff => ({
          ...aff,
          sales: aff.sales.filter(s => s.productId === selectedProduct)
        })).filter(aff => aff.sales.length > 0)

    const delivered = { count: 0, value: 0 }
    const scheduled = { count: 0, value: 0 }
    const waiting = { count: 0, value: 0 }

    filteredAffiliates.forEach(affiliate => {
      affiliate.sales.forEach(sale => {
        if (sale.status === 'delivered' || sale.status === 'paid') {
          delivered.count++
          delivered.value += sale.totalValue || 0
        } else if (sale.status === 'scheduled') {
          scheduled.count++
          scheduled.value += sale.totalValue || 0
        } else if (sale.status === 'pending' || sale.status === 'waiting') {
          waiting.count++
          waiting.value += sale.totalValue || 0
        }
      })
    })

    setMetrics({ delivered, scheduled, waiting })
  }

  const getFilteredAffiliates = () => {
    if (selectedProduct === 'all') {
      return affiliates
    }

    return affiliates.map(aff => {
      const filteredSales = aff.sales.filter(s => s.productId === selectedProduct)
      return {
        ...aff,
        sales: filteredSales,
        totalSales: filteredSales.length,
        totalValue: filteredSales.reduce((sum, s) => sum + (s.totalValue || 0), 0)
      }
    }).filter(aff => aff.totalSales > 0)
      .sort((a, b) => b.totalSales - a.totalSales)
  }

  const filteredAffiliates = getFilteredAffiliates()

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ranking de Afiliados After Pay
          </h1>
          <p className="text-gray-600 mt-1">Acompanhe o desempenho dos seus afiliados</p>
        </div>

        {/* Filtro de Produto */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por produto
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full md:w-80 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="all">Todos os produtos</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Entregues e Pagos */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-green-700">Entregues e Pagos</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-green-700">R$ {metrics.delivered.value.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1">{metrics.delivered.count} vendas</p>
            </div>
          </div>

          {/* Agendados */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-700">Agendados</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-blue-700">R$ {metrics.scheduled.value.toFixed(2)}</p>
              <p className="text-sm text-blue-600 mt-1">{metrics.scheduled.count} vendas</p>
            </div>
          </div>

          {/* Aguardando Pagamento */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-yellow-700">Aguardando Pagamento</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-yellow-700">R$ {metrics.waiting.value.toFixed(2)}</p>
              <p className="text-sm text-yellow-600 mt-1">{metrics.waiting.count} vendas</p>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAffiliates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum afiliado encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedProduct === 'all'
                ? 'Vendas de afiliados com AfterPay aparecerão aqui.'
                : 'Nenhum afiliado vendeu este produto com AfterPay ainda.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Afiliados After Pay
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afiliado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendas After Pay
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa de Frustração
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAffiliates.map((affiliate, index) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <span className="text-2xl mr-2">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-2xl mr-2">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-2xl mr-2">🥉</span>
                          )}
                          <span className="text-sm font-semibold text-gray-700">
                            {index + 1}º
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-sm">
                              {affiliate.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                            <div className="text-sm text-gray-500">{affiliate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-indigo-600">{affiliate.totalSales}</span>
                          <span className="text-xs text-gray-500">vendas</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {affiliate.totalValue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                            <div
                              className={`h-2 rounded-full ${
                                affiliate.frustrationRate > 20 ? 'bg-red-500' :
                                affiliate.frustrationRate > 10 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(affiliate.frustrationRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {affiliate.frustrationRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {affiliate.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with total */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total de <span className="font-semibold text-gray-900">{filteredAffiliates.length}</span> afiliado(s)
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Total vendido: R$ {filteredAffiliates.reduce((sum, aff) => sum + aff.totalValue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
