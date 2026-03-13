import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import OrderDetails from '../../components/OrderDetails'
import PixIcon from '../../components/PixIcon'
import config from '../../config'

export default function PlatformSales() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // Definir data padrão: últimos 30 dias
  const getDefaultDateFrom = () => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  }

  const getDefaultDateTo = () => {
    return new Date().toISOString().split('T')[0]
  }

  const [filters, setFilters] = useState({
    customerName: '',
    cpf: '',
    producerName: '', // NOVO: filtrar por produtor
    status: [],
    paymentMethod: [],
    dateFrom: getDefaultDateFrom(),
    dateTo: getDefaultDateTo(),
    orderCode: '',
    trackingCode: '',
    affiliateEmail: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/orders`)
      const data = await response.json()
      // Mostrar TODAS as vendas de TODOS os usuários
      setOrders(data)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    }
    setLoading(false)
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleCheckboxChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [filterName]: newValues }
    })
  }

  const clearFilters = () => {
    setFilters({
      customerName: '',
      cpf: '',
      producerName: '',
      status: [],
      paymentMethod: [],
      dateFrom: getDefaultDateFrom(),
      dateTo: getDefaultDateTo(),
      orderCode: '',
      trackingCode: '',
      affiliateEmail: ''
    })
  }

  const applyFilters = () => {
    setFilterDrawerOpen(false)
  }

  const filteredOrders = orders
    .filter((order) => {
      // Filtro de data
      if (filters.dateFrom) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
        if (orderDate < filters.dateFrom) return false
      }
      if (filters.dateTo) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
        if (orderDate > filters.dateTo) return false
      }

      if (filters.orderCode && !order.id.toLowerCase().includes(filters.orderCode.toLowerCase())) {
        return false
      }
      if (filters.customerName && !order.customer?.name.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false
      }
      if (filters.cpf && !order.customer?.cpf.includes(filters.cpf)) {
        return false
      }
      if (filters.producerName && !order.producerName?.toLowerCase().includes(filters.producerName.toLowerCase())) {
        return false
      }
      if (filters.status.length > 0 && !filters.status.includes(order.paymentStatus)) {
        return false
      }
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(order.paymentMethod)) {
        return false
      }
      if (filters.trackingCode && !order.trackingCode?.toLowerCase().includes(filters.trackingCode.toLowerCase())) {
        return false
      }
      if (filters.affiliateEmail && (!order.affiliateName || !order.affiliateName.toLowerCase().includes(filters.affiliateEmail.toLowerCase()))) {
        return false
      }
      return true
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Calcular estatísticas GLOBAIS
  const calculateStats = () => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalValue, 0)
    const totalCount = filteredOrders.length
    const avgTicket = totalCount > 0 ? totalSales / totalCount : 0

    // Comissões da plataforma (3% de cada venda)
    const platformCommission = filteredOrders.reduce((sum, order) => {
      return sum + (order.totalValue * 0.03) // 3% de comissão da plataforma
    }, 0)

    // Total pago (pedidos com status 'paid')
    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'paid')
    const totalPaid = paidOrders.reduce((sum, order) => sum + order.totalValue, 0)
    const paidCount = paidOrders.length

    return {
      totalSales,
      totalCount,
      avgTicket,
      platformCommission,
      totalPaid,
      paidCount
    }
  }

  const stats = calculateStats()

  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Agendado' },
      pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Aguardando Pagamento' },
      overdue: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Atrasado' },
      frustrated: { bg: 'bg-red-100', text: 'text-red-800', label: 'Frustrado' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    }
    const s = statusMap[status] || statusMap.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    )
  }

  const getPaymentMethodIcon = (method) => {
    if (method === 'pix') {
      return <PixIcon className="w-5 h-5" />
    }
    const icons = {
      boleto: '🏦',
      creditCard: '💳',
      afterPay: '🚚'
    }
    return icons[method] || '💰'
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      pix: 'PIX',
      boleto: 'Boleto',
      creditCard: 'Cartão',
      afterPay: 'Receba e Pague'
    }
    return labels[method] || method
  }

  return (
    <PlatformLayout>
      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          isAdminView={true}
        />
      )}

      {/* Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg font-semibold text-slate-800">Filtros</h2>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Data do pedido */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data do pedido
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Código do pedido */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código do pedido
                </label>
                <input
                  type="text"
                  name="orderCode"
                  value={filters.orderCode}
                  onChange={handleFilterChange}
                  placeholder="Digite o código..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Nome do cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do cliente
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={filters.customerName}
                  onChange={handleFilterChange}
                  placeholder="Digite o nome..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={filters.cpf}
                  onChange={handleFilterChange}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* NOVO: Nome do Produtor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Produtor
                </label>
                <input
                  type="text"
                  name="producerName"
                  value={filters.producerName}
                  onChange={handleFilterChange}
                  placeholder="Nome do produtor..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status do pagamento
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'scheduled', label: 'Agendado' },
                    { value: 'pending_payment', label: 'Aguardando Pagamento' },
                    { value: 'paid', label: 'Pago' },
                    { value: 'cancelled', label: 'Cancelado' },
                    { value: 'overdue', label: 'Atrasado' },
                    { value: 'frustrated', label: 'Frustrado' }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status.value)}
                        onChange={() => handleCheckboxChange('status', status.value)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Forma de pagamento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Forma de pagamento
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'pix', label: 'PIX' },
                    { value: 'boleto', label: 'Boleto' },
                    { value: 'creditCard', label: 'Cartão de Crédito' },
                    { value: 'afterPay', label: 'Receba e Pague' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.paymentMethod.includes(method.value)}
                        onChange={() => handleCheckboxChange('paymentMethod', method.value)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Código de rastreio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código de rastreio
                </label>
                <input
                  type="text"
                  name="trackingCode"
                  value={filters.trackingCode}
                  onChange={handleFilterChange}
                  placeholder="Digite o código..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email afiliado */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email do afiliado
                </label>
                <input
                  type="text"
                  name="affiliateEmail"
                  value={filters.affiliateEmail}
                  onChange={handleFilterChange}
                  placeholder="email@afiliado.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              >
                Limpar
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vendas da Plataforma</h2>
          <p className="text-sm text-slate-600">Acompanhe todas as vendas de todos os usuários</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">Receita Total</h3>
            <p className="text-3xl font-bold text-slate-800">
              R$ {stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-500 mt-1">{stats.totalCount} pedidos</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">Pedidos Pagos</h3>
            <p className="text-3xl font-bold text-slate-800">
              R$ {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-500 mt-1">{stats.paidCount} pedidos</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">Ticket Médio</h3>
            <p className="text-3xl font-bold text-slate-800">
              R$ {stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-500 mt-1">por pedido</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">Comissão Plataforma (3%)</h3>
            <p className="text-3xl font-bold text-slate-800">
              R$ {stats.platformCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-500 mt-1">estimado</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
            <div className="text-sm text-slate-600">
              Exibindo {filteredOrders.length} de {orders.length} vendas
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produtor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pagamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      Nenhuma venda encontrada
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">#{order.id.slice(0, 8)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {order.paymentMethod === 'afterPay' && (
                            <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                              After Pay
                            </span>
                          )}
                          <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                            {order.productName || order.product?.name || 'Produto'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{order.customer?.name}</div>
                        <div className="text-xs text-slate-500">{order.customer?.cpf}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{order.producerName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <span className="text-sm text-slate-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PlatformLayout>
  )
}
