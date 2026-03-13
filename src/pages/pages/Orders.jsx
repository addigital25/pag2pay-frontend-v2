import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    paymentMethod: 'all'
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingForm, setTrackingForm] = useState({
    trackingCode: '',
    carrier: '',
    estimatedDelivery: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (!user) return

    // Buscar imediatamente ao carregar
    fetchOrders(true)

    // Atualização automática a cada 5 segundos (mais rápido)
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh executando...', new Date().toLocaleTimeString())
      fetchOrders(false) // false = não mostrar loading
    }, 5000) // 5 segundos

    // Limpar interval ao desmontar componente
    return () => {
      console.log('🛑 Limpando interval de auto-refresh')
      clearInterval(interval)
    }
  }, [user])

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true)
    }

    try {
      console.log('📡 Buscando pedidos...', { showLoading, timestamp: new Date().toLocaleTimeString() })
      const response = await fetch('${config.apiUrl}/api/orders')
      const data = await response.json()

      // Filtrar pedidos se não for admin
      let filteredData = data
      if (user && user.role !== 'admin') {
        filteredData = data.filter(order =>
          order.producerId === user.id || order.affiliateId === user.id
        )
      }

      console.log('✅ Pedidos atualizados:', filteredData.length, 'pedidos')
      setOrders(filteredData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error)
    }

    if (showLoading) {
      setLoading(false)
    }
  }

  const handleUpdateTracking = async (orderId) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: trackingForm.trackingCode,
          carrier: trackingForm.carrier,
          estimatedDelivery: trackingForm.estimatedDelivery,
          status: 'shipped'
        })
      })

      if (response.ok) {
        setAlert({ show: true, message: 'Código de rastreio atualizado!', type: 'success' })
        setSelectedOrder(null)
        setTrackingForm({ trackingCode: '', carrier: '', estimatedDelivery: '' })
        fetchOrders()
      }
    } catch (error) {
      console.error('Erro ao atualizar rastreio:', error)
    }
  }

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus,
          ...(paymentStatus === 'paid' && { status: 'paid' })
        })
      })

      if (response.ok) {
        setAlert({ show: true, message: 'Status de pagamento atualizado!', type: 'success' })
        fetchOrders()
      }
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.paymentStatus !== 'all' && order.paymentStatus !== filters.paymentStatus) return false
    if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.productName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      paid: 'bg-green-100 text-green-800'
    }
    const labels = {
      pending: 'Pendente',
      shipped: 'Enviado',
      delivered: 'Entregue',
      paid: 'Pago'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      pending_delivery: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800'
    }
    const labels = {
      pending: 'Aguardando Pagamento',
      pending_delivery: 'Pagar Após Entrega',
      paid: 'Pago'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      pix: 'PIX',
      boleto: 'Boleto',
      creditCard: 'Cartão de Crédito',
      afterPay: 'Receba e Pague'
    }
    return labels[method] || method
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedidos</h1>
          <p className="text-gray-600">Gerencie todos os pedidos e rastreamentos</p>
        </div>

        {/* Filter Button and Auto-refresh Indicator */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-700">Filtros</span>
            {(filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.paymentMethod !== 'all') && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                Ativos
              </span>
            )}
          </button>

          {/* Indicador de Última Atualização */}
          {lastUpdate && (
            <div className="text-sm text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
          )}
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Filtros de Pedidos</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Cliente, produto, ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status do Pedido
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendente</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pagamento
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Aguardando</option>
                    <option value="pending_delivery">Após Entrega</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="creditCard">Cartão</option>
                    <option value="afterPay">Receba e Pague</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFilters({ search: '', status: 'all', paymentStatus: 'all', paymentMethod: 'all' })
                    setShowFilters(false)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Total de Pedidos</p>
            <p className="text-2xl font-bold text-gray-800">{filteredOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Enviados</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredOrders.filter(o => o.status === 'shipped').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Pagos</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredOrders.filter(o => o.paymentStatus === 'paid').length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="font-mono text-xs">{order.id.substring(0, 8)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                        {order.customer.phone && (
                          <div className="text-xs text-gray-500">{order.customer.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="text-sm text-gray-900 truncate max-w-xs cursor-pointer select-all"
                          title={order.productName}
                          onDoubleClick={(e) => {
                            const selection = window.getSelection()
                            const range = document.createRange()
                            range.selectNodeContents(e.target)
                            selection.removeAllRanges()
                            selection.addRange(range)
                          }}
                        >
                          {order.productName}
                        </div>
                        {order.affiliateId && (
                          <div className="text-xs text-purple-600">Via {order.affiliateName}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{order.quantity}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {order.totalValue.toFixed(2)}
                        </div>
                        {order.affiliateCommission > 0 && (
                          <div className="text-xs text-gray-500">
                            Comissão: R$ {(user.role === 'affiliate' ? order.affiliateCommission : order.producerCommission).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="mb-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
                        <div className="text-xs text-gray-600">{getPaymentMethodLabel(order.paymentMethod)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="mb-1">{getStatusBadge(order.status)}</div>
                        {order.trackingCode && (
                          <div className="text-xs text-gray-600">
                            Rastreio: {order.trackingCode}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Detalhes do Pedido</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Informações do Pedido</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>ID: {selectedOrder.id}</div>
                    <div>Data: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    <div>Status: {getStatusBadge(selectedOrder.status)}</div>
                    <div>Pagamento: {getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Dados do Cliente</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Nome:</strong> {selectedOrder.customer.name}</div>
                    <div><strong>Email:</strong> {selectedOrder.customer.email}</div>
                    {selectedOrder.customer.phone && (
                      <div><strong>Telefone:</strong> {selectedOrder.customer.phone}</div>
                    )}
                    {selectedOrder.customer.address && (
                      <>
                        <div><strong>Endereço:</strong> {selectedOrder.customer.address}</div>
                        <div>
                          {selectedOrder.customer.city}, {selectedOrder.customer.state} - CEP: {selectedOrder.customer.zipCode}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Produto</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Nome:</strong> {selectedOrder.productName}</div>
                    <div><strong>Quantidade:</strong> {selectedOrder.quantity}</div>
                    <div><strong>Preço Unitário:</strong> R$ {selectedOrder.productPrice.toFixed(2)}</div>
                    <div><strong>Valor Total:</strong> R$ {selectedOrder.totalValue.toFixed(2)}</div>
                    <div><strong>Forma de Pagamento:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod)}</div>
                  </div>
                </div>

                {/* Commission Info */}
                {selectedOrder.affiliateCommission > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Comissões</h3>
                    <div className="text-sm space-y-1">
                      <div><strong>Produtor ({selectedOrder.producerName}):</strong> R$ {selectedOrder.producerCommission.toFixed(2)}</div>
                      <div><strong>Afiliado ({selectedOrder.affiliateName}):</strong> R$ {selectedOrder.affiliateCommission.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {/* Tracking Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Informações de Envio</h3>
                  {selectedOrder.trackingCode ? (
                    <div className="text-sm space-y-1">
                      <div><strong>Código de Rastreio:</strong> {selectedOrder.trackingCode}</div>
                      {selectedOrder.shippingInfo?.carrier && (
                        <div><strong>Transportadora:</strong> {selectedOrder.shippingInfo.carrier}</div>
                      )}
                      {selectedOrder.shippingInfo?.estimatedDelivery && (
                        <div><strong>Previsão de Entrega:</strong> {new Date(selectedOrder.shippingInfo.estimatedDelivery).toLocaleDateString()}</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Adicionar informações de rastreio</p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Código de rastreio"
                          value={trackingForm.trackingCode}
                          onChange={(e) => setTrackingForm({ ...trackingForm, trackingCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Transportadora"
                          value={trackingForm.carrier}
                          onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="date"
                          placeholder="Previsão de entrega"
                          value={trackingForm.estimatedDelivery}
                          onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleUpdateTracking(selectedOrder.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Adicionar Rastreio
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedOrder.paymentStatus !== 'paid' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Atualizar Pagamento</h3>
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'paid')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Marcar como Pago
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <AlertModal
          show={alert.show}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      </div>
    </AdminLayout>
  )
}
