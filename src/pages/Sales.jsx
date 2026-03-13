import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import OrderDetails from '../components/OrderDetails'
import PixIcon from '../components/PixIcon'
import AlertModal from '../components/AlertModal'
import config from '../config'

export default function Sales() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' })

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
    status: [], // Array para múltiplos status
    paymentMethod: [], // Array para múltiplas formas de pagamento
    dateFrom: getDefaultDateFrom(),
    dateTo: getDefaultDateTo(),
    orderCode: '',
    trackingCode: '',
    trackingStatus: '',
    affiliateEmail: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/orders?userId=${user.id}`)
      const data = await response.json()
      // Mostrar TODAS as vendas do usuário
      setOrders(data.filter(o => o.producerId === user.id))
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
      status: [],
      paymentMethod: [],
      dateFrom: getDefaultDateFrom(),
      dateTo: getDefaultDateTo(),
      orderCode: '',
      trackingCode: '',
      trackingStatus: '',
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
      if (filters.customerName && !order.customer.name.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false
      }
      if (filters.cpf && !order.customer.cpf.includes(filters.cpf)) {
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

  // Calcular estatísticas
  const calculateStats = () => {
    // Total de vendas
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalValue, 0)
    const totalCount = filteredOrders.length
    const avgTicket = totalCount > 0 ? totalSales / totalCount : 0

    // Comissões recebidas (como produtor)
    const myCommissions = filteredOrders.reduce((sum, order) => {
      if (order.producerId === user.id) {
        return sum + (order.producerCommission || 0)
      }
      return sum
    }, 0)
    const commissionCount = filteredOrders.filter(o => o.producerId === user.id).length
    const avgCommissionTicket = commissionCount > 0 ? myCommissions / commissionCount : 0

    return {
      totalSales,
      totalCount,
      avgTicket,
      myCommissions,
      commissionCount,
      avgCommissionTicket
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
      <span className={`px-2 py-1 rounded text-xs font-medium ${s.bg} ${s.text}`}>
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
    <AdminLayout>
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />
      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
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
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-800">Filtro</h2>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Data do pedido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do pedido
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Código da Venda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venda
                </label>
                <input
                  type="text"
                  name="orderCode"
                  value={filters.orderCode}
                  onChange={handleFilterChange}
                  placeholder="Código da Venda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Forma de pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Forma de pagamento
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'pix', label: 'PIX' },
                    { value: 'boleto', label: 'Boleto' },
                    { value: 'creditCard', label: 'Cartão de Crédito' },
                    { value: 'afterPay', label: 'Receba e Pague' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.paymentMethod.includes(method.value)}
                        onChange={() => handleCheckboxChange('paymentMethod', method.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'scheduled', label: 'Agendado', color: 'text-blue-600' },
                    { value: 'pending_payment', label: 'Aguardando Pagamento', color: 'text-yellow-600' },
                    { value: 'overdue', label: 'Atrasado', color: 'text-orange-600' },
                    { value: 'frustrated', label: 'Frustrado', color: 'text-red-600' },
                    { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
                    { value: 'paid', label: 'Pago', color: 'text-green-600' },
                    { value: 'cancelled', label: 'Cancelado', color: 'text-gray-600' }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status.value)}
                        onChange={() => handleCheckboxChange('status', status.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Código de Rastreio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Rastreio
                </label>
                <input
                  type="text"
                  name="trackingCode"
                  value={filters.trackingCode}
                  onChange={handleFilterChange}
                  placeholder="Código de Rastreio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Comprador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprador
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={filters.customerName}
                  onChange={handleFilterChange}
                  placeholder="Nome ou e-mail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* CPF/CNPJ do comprador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF/CNPJ do comprador
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={filters.cpf}
                  onChange={handleFilterChange}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Email Afiliado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Afiliado
                </label>
                <input
                  type="text"
                  name="affiliateEmail"
                  value={filters.affiliateEmail}
                  onChange={handleFilterChange}
                  placeholder="Email do Afiliado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer com botões */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Vendas</h1>
          <p className="text-gray-600">Todas as vendas confirmadas e pagas</p>
        </div>

        {/* Relatório de Estatísticas */}
        {!loading && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Card: Total de Vendas */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total de Vendas</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm opacity-90">Valor Total</p>
                  <p className="text-3xl font-bold">R$ {stats.totalSales.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-indigo-400">
                  <div>
                    <p className="text-xs opacity-90">Quantidade</p>
                    <p className="text-xl font-semibold">{stats.totalCount}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-90">Ticket Médio</p>
                    <p className="text-xl font-semibold">R$ {stats.avgTicket.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Comissões Recebidas */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Comissões Recebidas</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm opacity-90">Valor Total</p>
                  <p className="text-3xl font-bold">R$ {stats.myCommissions.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="pt-3 border-t border-green-400">
                  <p className="text-xs opacity-90">Ticket Médio</p>
                  <p className="text-xl font-semibold">R$ {stats.avgCommissionTicket.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Filtro */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtro
          </button>
        </div>

        {/* Lista de Vendas */}
        <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma venda encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">Suas vendas confirmadas aparecerão aqui.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Venda
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comprador
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forma
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data do pedido
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data do pagamento
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p
                              className="text-sm font-mono text-gray-700 cursor-pointer hover:text-indigo-600 max-w-[90px] truncate"
                              title={`#${order.id} - Duplo clique para copiar`}
                              onDoubleClick={() => {
                                navigator.clipboard.writeText(order.id);
                                setAlertModal({ isOpen: true, message: 'ID copiado!' });
                              }}
                            >
                              #{order.id.slice(0, 8)}
                            </p>

                            {order.paymentMethod === 'afterPay' && (
                              <span className="inline-block px-2 py-0.5 bg-orange-600 text-white text-xs font-semibold rounded">
                                After Pay
                              </span>
                            )}

                            <p
                              className="text-sm text-indigo-600 font-medium max-w-[120px] truncate cursor-pointer hover:text-indigo-800"
                              title={`${order.productName} - Duplo clique para copiar`}
                              onDoubleClick={() => {
                                navigator.clipboard.writeText(order.productName);
                                setAlertModal({ isOpen: true, message: 'Nome do produto copiado!' });
                              }}
                            >
                              {order.productName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className="text-sm font-medium text-gray-900 max-w-[150px] truncate cursor-pointer hover:text-indigo-600"
                            title={`${order.customer.name} - Duplo clique para copiar`}
                            onDoubleClick={() => {
                              navigator.clipboard.writeText(order.customer.name);
                              setAlertModal({ isOpen: true, message: 'Nome copiado!' });
                            }}
                          >
                            {order.customer.name}
                          </div>
                          <div
                            className="text-sm text-gray-500 max-w-[180px] truncate cursor-pointer hover:text-indigo-600"
                            title={`${order.customer.email} - Duplo clique para copiar`}
                            onDoubleClick={() => {
                              navigator.clipboard.writeText(order.customer.email);
                              setAlertModal({ isOpen: true, message: 'Email copiado!' });
                            }}
                          >
                            {order.customer.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-700">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                            <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('pt-BR')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.paidAt ? (
                            <div className="flex flex-col">
                              <span>{new Date(order.paidAt).toLocaleDateString('pt-BR')}</span>
                              <span className="text-xs text-gray-500">{new Date(order.paidAt).toLocaleTimeString('pt-BR')}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">
                          R$ {order.totalValue.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                          >
                            Ver detalhes
                          </button>
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
