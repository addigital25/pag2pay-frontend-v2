import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PlatformLayout from '../../components/PlatformLayout'
import * as api from '../../services/api'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'

// Dados mockados como fallback
const mockProductsData = [
    {
      id: 1,
      name: 'Curso de React Avançado',
      seller: 'João Silva',
      sellerId: 123,
      price: 297.00,
      sales: 156,
      revenue: 46332.00,
      commission: 1389.96,
      status: 'active',
      category: 'Cursos',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'E-book Marketing Digital',
      seller: 'Maria Santos',
      sellerId: 456,
      price: 47.00,
      sales: 892,
      revenue: 41924.00,
      commission: 1257.72,
      status: 'active',
      category: 'E-books',
      createdAt: '2024-02-03'
    },
    {
      id: 3,
      name: 'Template de Landing Page',
      seller: 'Ana Oliveira',
      sellerId: 234,
      price: 97.00,
      sales: 0,
      revenue: 0,
      commission: 0,
      status: 'pending',
      category: 'Templates',
      createdAt: '2024-03-01',
      pendingReason: 'Aguardando revisão de conteúdo'
    },
    {
      id: 4,
      name: 'Curso de Node.js Completo',
      seller: 'Carlos Mendes',
      sellerId: 567,
      price: 397.00,
      sales: 0,
      revenue: 0,
      commission: 0,
      status: 'pending',
      category: 'Cursos',
      createdAt: '2024-03-02',
      pendingReason: 'Aguardando aprovação inicial'
    },
    {
      id: 5,
      name: 'Workshop de Fotografia',
      seller: 'Lucia Ferreira',
      sellerId: 890,
      price: 197.00,
      sales: 78,
      revenue: 15366.00,
      commission: 460.98,
      status: 'suspended',
      category: 'Workshops',
      createdAt: '2024-01-10',
      suspensionReason: 'Múltiplas reclamações de clientes'
    }
]

export default function PlatformProducts() {
  const location = useLocation()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [products, setProducts] = useState([])
  const [deletionRequests, setDeletionRequests] = useState([])
  const [deletedProducts, setDeletedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar produtos da API
  useEffect(() => {
    loadProducts()
    loadDeletionRequests()
    loadDeletedProducts()
  }, [])

  // Recarregar quando clicar no menu ativo (detecta mudança no state.refresh)
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('🔄 Detectado clique no menu ativo - recarregando produtos...')
      loadProducts()
      loadDeletionRequests()
      loadDeletedProducts()
    }
  }, [location.state?.refresh])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar produtos reais da API
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/products')
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }
      const data = await response.json()
      setProducts(data)

    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
      setError(err.message)
      // Fallback para dados mockados
      setProducts(mockProductsData)
    } finally {
      setLoading(false)
    }
  }

  const loadDeletionRequests = async () => {
    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/products/deletion-requests/all')
      if (response.ok) {
        const data = await response.json()
        setDeletionRequests(data)
      }
    } catch (err) {
      console.error('Erro ao carregar solicitações de exclusão:', err)
    }
  }

  const loadDeletedProducts = async () => {
    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/products/deleted-products/all')
      if (response.ok) {
        const data = await response.json()
        setDeletedProducts(data)
      }
    } catch (err) {
      console.error('Erro ao carregar produtos excluídos:', err)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    }
    const labels = {
      active: '✅ Ativo',
      pending: '🕐 Pendente',
      suspended: '⛔ Suspenso'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Filtrar produtos por aba e busca
  const filteredProducts = products.filter(product => {
    const matchesTab = activeTab === 'all' || product.status === activeTab
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  const pendingCount = products.filter(p => p.status === 'pending').length
  const activeCount = products.filter(p => p.status === 'active').length
  const suspendedCount = products.filter(p => p.status === 'suspended').length
  const deletionRequestsCount = deletionRequests.filter(r => r.status === 'pending').length

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleApproveProduct = async () => {
    if (!confirm(`Aprovar produto "${selectedProduct.name}"?`)) return

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/products/${selectedProduct.id}/approve`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Erro ao aprovar produto')
      }

      // Atualizar lista de produtos
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, status: 'active' } : p
      ))

      showAlert({
        title: 'Sucesso!',
        message: `Produto "${selectedProduct.name}" aprovado com sucesso!`,
        type: 'success'
      })
      setShowModal(false)
      setSelectedProduct(null)

      // Recarregar produtos para ter dados atualizados
      loadProducts()
    } catch (err) {
      console.error('Erro ao aprovar produto:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao aprovar produto. Tente novamente.',
        type: 'error'
      })
    }
  }

  const handleRejectProduct = async () => {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/products/${selectedProduct.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        throw new Error('Erro ao rejeitar produto')
      }

      // Atualizar lista de produtos
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, status: 'suspended', suspensionReason: reason } : p
      ))

      showAlert({
        title: 'Produto Rejeitado',
        message: `Produto "${selectedProduct.name}" foi rejeitado.\n\nMotivo: ${reason}`,
        type: 'warning'
      })
      setShowModal(false)
      setSelectedProduct(null)

      // Recarregar produtos
      loadProducts()
    } catch (err) {
      console.error('Erro ao rejeitar produto:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao rejeitar produto. Tente novamente.',
        type: 'error'
      })
    }
  }

  const handleSuspendProduct = async () => {
    const reason = prompt('Motivo da suspensão:')
    if (!reason) return

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/products/${selectedProduct.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        throw new Error('Erro ao suspender produto')
      }

      // Atualizar lista de produtos
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, status: 'suspended', suspensionReason: reason } : p
      ))

      showAlert({
        title: 'Produto Suspenso',
        message: `Produto "${selectedProduct.name}" foi suspenso.\n\nMotivo: ${reason}`,
        type: 'warning'
      })
      setShowModal(false)
      setSelectedProduct(null)

      // Recarregar produtos
      loadProducts()
    } catch (err) {
      console.error('Erro ao suspender produto:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao suspender produto. Tente novamente.',
        type: 'error'
      })
    }
  }

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir produto')
      }

      showAlert({
        title: 'Produto Excluído',
        message: `Produto "${selectedProduct.name}" foi excluído permanentemente.`,
        type: 'success'
      })

      setShowDeleteConfirmModal(false)
      setShowModal(false)
      setSelectedProduct(null)

      // Recarregar produtos
      loadProducts()
    } catch (err) {
      console.error('Erro ao excluir produto:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao excluir produto. Tente novamente.',
        type: 'error'
      })
    }
  }

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request)
    setShowRequestModal(true)
  }

  const handleApproveRequest = async () => {
    if (!confirm(`Aprovar exclusão do produto "${selectedRequest.productName}"?`)) return

    const notes = prompt('Observações (opcional):')

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/products/deletion-requests/${selectedRequest.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: 'Administrador da Plataforma',
          notes: notes || ''
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao aprovar exclusão')
      }

      showAlert({
        title: 'Exclusão Aprovada!',
        message: 'O produto foi movido para produtos excluídos.',
        type: 'success'
      })
      setShowRequestModal(false)
      setSelectedRequest(null)

      // Recarregar dados
      loadDeletionRequests()
      loadProducts()
      loadDeletedProducts()
    } catch (err) {
      console.error('Erro ao aprovar exclusão:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao aprovar exclusão. Tente novamente.',
        type: 'error'
      })
    }
  }

  const handleRejectRequest = async () => {
    const notes = prompt('Motivo da recusa:')
    if (!notes) return

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/products/deletion-requests/${selectedRequest.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: 'Administrador da Plataforma',
          notes
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao rejeitar exclusão')
      }

      showAlert({
        title: 'Exclusão Rejeitada',
        message: `Motivo: ${notes}`,
        type: 'warning'
      })
      setShowRequestModal(false)
      setSelectedRequest(null)

      // Recarregar solicitações
      loadDeletionRequests()
    } catch (err) {
      console.error('Erro ao rejeitar exclusão:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao rejeitar exclusão. Tente novamente.',
        type: 'error'
      })
    }
  }

  // Loading state
  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando produtos...</p>
          </div>
        </div>
      </PlatformLayout>
    )
  }

  return (
    <PlatformLayout>
      {/* Mensagem de erro se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Usando dados mockados como fallback.</p>
        </div>
      )}

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Produtos da Plataforma</h2>
          <p className="text-slate-600 mt-1">Gerencie e aprove produtos criados na plataforma</p>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar por produto ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabs de Filtro */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">🕐</span>
                Pendentes de Aprovação
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'active'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">✅</span>
                Ativos
                <span className="ml-2 text-sm text-slate-500">({activeCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('suspended')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'suspended'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">⛔</span>
                Suspensos
                <span className="ml-2 text-sm text-slate-500">({suspendedCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">📋</span>
                Todos
                <span className="ml-2 text-sm text-slate-500">({products.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('deletion-requests')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'deletion-requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">🗑️</span>
                Solicitações de Exclusão
                {deletionRequestsCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                    {deletionRequestsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('deleted')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'deleted'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">🗂️</span>
                Produtos Excluídos
                <span className="ml-2 text-sm text-slate-500">({deletedProducts.length})</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Lista de Produtos */}
        {activeTab !== 'deletion-requests' && activeTab !== 'deleted' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Vendas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          Criado em {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        {product.status === 'pending' && product.pendingReason && (
                          <p className="text-xs text-yellow-600 mt-1">📌 {product.pendingReason}</p>
                        )}
                        {product.status === 'suspended' && product.suspensionReason && (
                          <p className="text-xs text-red-600 mt-1">⚠️ {product.suspensionReason}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-800">{product.seller}</p>
                      <p className="text-xs text-slate-500">ID: {product.sellerId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{product.sales}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-600 font-medium">Nenhum produto encontrado</p>
              <p className="text-slate-500 text-sm mt-1">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
        )}

        {/* Tabela de Solicitações de Exclusão */}
        {activeTab === 'deletion-requests' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Data da Solicitação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deletionRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{request.productName}</p>
                        <p className="text-xs text-slate-500">{request.productCategory} - R$ {request.productPrice.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800">{request.userName}</p>
                        <p className="text-xs text-slate-500">ID: {request.userId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 max-w-xs truncate">{request.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800">
                          {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(request.requestedAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            🕐 Pendente
                          </span>
                        )}
                        {request.status === 'approved' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✅ Aprovado
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            ❌ Rejeitado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleViewRequestDetails(request)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-sm"
                          >
                            Revisar
                          </button>
                        )}
                        {request.status !== 'pending' && (
                          <button
                            onClick={() => handleViewRequestDetails(request)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium text-sm"
                          >
                            Ver Detalhes
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deletionRequests.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <p className="text-slate-600 font-medium">Nenhuma solicitação de exclusão encontrada</p>
              </div>
            )}
          </div>
        )}

        {/* Tabela de Produtos Excluídos */}
        {activeTab === 'deleted' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Vendedor Original
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Data de Exclusão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Motivo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deletedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">ID: {product.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800">{product.producerName}</p>
                        <p className="text-xs text-slate-500">ID: {product.producerId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800">
                          {new Date(product.deletedAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-500">
                          Excluído por: {product.deletedBy}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 max-w-xs truncate">{product.deletionReason}</p>
                        <p className="text-xs text-slate-500 mt-1">Aprovado por: {product.approvedBy}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deletedProducts.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-600 font-medium">Nenhum produto excluído</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de Detalhes da Solicitação de Exclusão */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Solicitação de Exclusão</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-1">Status da Solicitação</h4>
                    {selectedRequest.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        🕐 Pendente de Revisão
                      </span>
                    )}
                    {selectedRequest.status === 'approved' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✅ Aprovado
                      </span>
                    )}
                    {selectedRequest.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        ❌ Rejeitado
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Solicitado em</p>
                    <p className="font-medium text-slate-800">
                      {new Date(selectedRequest.requestedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Informações do Produto */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Informações do Produto</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Nome do Produto</p>
                      <p className="font-medium text-slate-800">{selectedRequest.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Categoria</p>
                      <p className="font-medium text-slate-800">{selectedRequest.productCategory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Preço</p>
                      <p className="font-medium text-slate-800">
                        R$ {selectedRequest.productPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">ID do Produto</p>
                      <p className="font-medium text-slate-800">#{selectedRequest.productId}</p>
                    </div>
                  </div>
                </div>

                {/* Informações do Solicitante */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Informações do Solicitante</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Nome</p>
                      <p className="font-medium text-slate-800">{selectedRequest.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">ID do Usuário</p>
                      <p className="font-medium text-slate-800">#{selectedRequest.userId}</p>
                    </div>
                  </div>
                </div>

                {/* Motivo da Exclusão */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Motivo da Solicitação</h4>
                  <p className="text-sm text-orange-700">{selectedRequest.reason}</p>
                </div>

                {/* Informações de Revisão (se já foi revisado) */}
                {selectedRequest.reviewedAt && (
                  <div className={`rounded-lg p-4 ${
                    selectedRequest.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      selectedRequest.status === 'approved' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Revisão do Administrador
                    </h4>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Revisado por:</span> {selectedRequest.reviewedBy}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Data:</span> {new Date(selectedRequest.reviewedAt).toLocaleString('pt-BR')}
                    </p>
                    {selectedRequest.reviewerNotes && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Observações:</span> {selectedRequest.reviewerNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer com Ações */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
                {selectedRequest.status === 'pending' ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleRejectRequest}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      ✕ Rejeitar Exclusão
                    </button>
                    <button
                      onClick={handleApproveRequest}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✓ Aprovar Exclusão
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Produto */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Detalhes do Produto</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirmModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                    title="Excluir Produto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">
                {/* Foto do Produto - DESTAQUE NO TOPO */}
                {selectedProduct.image && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-4 text-center">📸 Imagem do Produto</h4>
                    <div className="flex justify-center">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="max-w-full h-auto max-h-96 rounded-lg shadow-lg border-4 border-white"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Imagem+Indisponível'
                        }}
                      />
                    </div>
                  </div>
                )}
                {!selectedProduct.image && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-red-700 font-semibold">⚠️ Nenhuma imagem foi enviada pelo usuário</p>
                    <p className="text-red-600 text-sm mt-1">O produto não possui imagem cadastrada</p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-1">Status do Produto</h4>
                    {getStatusBadge(selectedProduct.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Criado em</p>
                    <p className="font-medium text-slate-800">
                      {new Date(selectedProduct.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(selectedProduct.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Motivo de Pendência/Suspensão */}
                {selectedProduct.status === 'pending' && selectedProduct.pendingReason && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">📌 Motivo da Pendência</p>
                    <p className="text-sm text-yellow-700">{selectedProduct.pendingReason}</p>
                  </div>
                )}
                {selectedProduct.status === 'suspended' && selectedProduct.suspensionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Motivo da Suspensão</p>
                    <p className="text-sm text-red-700">{selectedProduct.suspensionReason}</p>
                  </div>
                )}

                {/* Informações Básicas */}
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                    <span>📋</span> Informações Básicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2 bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">Nome do Produto</p>
                      <p className="font-semibold text-slate-900 text-lg">{selectedProduct.name || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">Categoria</p>
                      <p className="font-medium text-slate-800">{selectedProduct.category || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">Tipo de Produto</p>
                      <p className="font-medium text-slate-800">{selectedProduct.productType || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">Código</p>
                      <p className="font-medium text-slate-800 font-mono">{selectedProduct.code || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">💰 Preço</p>
                      <p className="font-bold text-green-600 text-xl">
                        R$ {selectedProduct.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </p>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">Descrição</p>
                      <p className="font-medium text-slate-800 text-sm">{selectedProduct.description || 'N/A'}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">🔗 URL da Página de Vendas</p>
                      <p className="font-medium text-blue-600 text-xs break-all hover:underline">
                        {selectedProduct.salesPageUrl ? (
                          <a href={selectedProduct.salesPageUrl} target="_blank" rel="noopener noreferrer">
                            {selectedProduct.salesPageUrl}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">📧 Email de Suporte</p>
                      <p className="font-medium text-slate-800 text-sm">{selectedProduct.supportEmail || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">🛡️ Dias de Garantia</p>
                      <p className="font-bold text-slate-800 text-lg">{selectedProduct.warrantyDays || '0'} dias</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">ID do Produto</p>
                      <p className="font-medium text-slate-800 font-mono text-xs">#{selectedProduct.id}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-600 font-medium mb-1">⚡ Turbina Score</p>
                      <p className="font-bold text-purple-600 text-lg">{selectedProduct.turbinaScore || '0'}</p>
                    </div>
                  </div>
                </div>

                {/* Configurações de Afiliação */}
                {selectedProduct.affiliateConfig && (
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                    <h4 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                      <span>🤝</span> Programa de Afiliação
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm text-slate-600 font-medium mb-1">Participa do Programa</p>
                        <p className={`font-bold ${selectedProduct.affiliateConfig.participateInProgram ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.affiliateConfig.participateInProgram ? '✅ Sim' : '❌ Não'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm text-slate-600 font-medium mb-1">💰 Comissão de Afiliado</p>
                        <p className="font-bold text-green-600 text-lg">{selectedProduct.affiliateCommission || '0'}%</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm text-slate-600 font-medium mb-1">Visível na Vitrine</p>
                        <p className={`font-bold ${selectedProduct.affiliateConfig.visibleInStore ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.affiliateConfig.visibleInStore ? '✅ Sim' : '❌ Não'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm text-slate-600 font-medium mb-1">Aprovação Automática</p>
                        <p className={`font-bold ${selectedProduct.affiliateConfig.autoApproval ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.affiliateConfig.autoApproval ? '✅ Sim' : '❌ Não'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Métodos de Pagamento */}
                {selectedProduct.paymentMethods && (
                  <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                    <h4 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                      <span>💳</span> Métodos de Pagamento Aceitos
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-3 rounded border-2 text-center ${selectedProduct.paymentMethods.pix ? 'bg-white border-green-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                        <p className="font-bold text-sm">PIX</p>
                        <p className="text-2xl">{selectedProduct.paymentMethods.pix ? '✅' : '❌'}</p>
                      </div>
                      <div className={`p-3 rounded border-2 text-center ${selectedProduct.paymentMethods.boleto ? 'bg-white border-green-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                        <p className="font-bold text-sm">Boleto</p>
                        <p className="text-2xl">{selectedProduct.paymentMethods.boleto ? '✅' : '❌'}</p>
                      </div>
                      <div className={`p-3 rounded border-2 text-center ${selectedProduct.paymentMethods.creditCard ? 'bg-white border-green-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                        <p className="font-bold text-sm">Cartão</p>
                        <p className="text-2xl">{selectedProduct.paymentMethods.creditCard ? '✅' : '❌'}</p>
                      </div>
                      <div className={`p-3 rounded border-2 text-center ${selectedProduct.paymentMethods.afterPay ? 'bg-white border-green-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                        <p className="font-bold text-sm">AfterPay</p>
                        <p className="text-2xl">{selectedProduct.paymentMethods.afterPay ? '✅' : '❌'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações do Vendedor */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Informações do Vendedor</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Nome do Vendedor</p>
                      <p className="font-medium text-slate-800">{selectedProduct.seller}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">ID do Vendedor</p>
                      <p className="font-medium text-slate-800">#{selectedProduct.sellerId}</p>
                    </div>
                  </div>
                </div>

                {/* Métricas de Vendas */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Métricas de Vendas</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Total de Vendas</p>
                      <p className="font-bold text-2xl text-slate-800">{selectedProduct.sales}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Receita Total</p>
                      <p className="font-bold text-2xl text-green-600">
                        R$ {selectedProduct.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Comissão da Plataforma</p>
                      <p className="font-bold text-2xl text-blue-600">
                        R$ {selectedProduct.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer com Ações */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
                {selectedProduct.status === 'pending' ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleRejectProduct}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      ✕ Rejeitar Produto
                    </button>
                    <button
                      onClick={handleApproveProduct}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✓ Aprovar Produto
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirmModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="bg-red-600 px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Confirmar Exclusão
                </h3>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">⚠️ ATENÇÃO: Esta ação é PERMANENTE!</p>
                  <p className="text-red-700 text-sm">
                    O produto será excluído do sistema e não poderá ser recuperado.
                  </p>
                </div>

                <div className="bg-slate-100 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Produto a ser excluído:</p>
                  <p className="font-bold text-slate-900 text-lg">{selectedProduct.name}</p>
                  <p className="text-sm text-slate-600 mt-2">ID: #{selectedProduct.id}</p>
                </div>

                <p className="text-slate-700 text-sm">
                  Tem certeza que deseja excluir este produto permanentemente?
                </p>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 rounded-b-lg flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}
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
    </PlatformLayout>
  )
}
