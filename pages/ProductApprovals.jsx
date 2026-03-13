import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'

export default function ProductApprovals() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [filter, setFilter] = useState('PENDENTE')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products?approvalStatus=${filter}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
    setLoading(false)
  }

  const handleApprove = async (productId) => {
    if (!confirm('Deseja aprovar este produto?')) return

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products/${productId}/approve`, {
        method: 'PATCH'
      })

      if (response.ok) {
        showAlert({
          title: 'Sucesso!',
          message: 'Produto aprovado com sucesso!',
          type: 'success'
        })
        fetchProducts()
        setSelectedProduct(null)
      }
    } catch (error) {
      console.error('Erro ao aprovar produto:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao aprovar produto',
        type: 'error'
      })
    }
  }

  const handleReject = async (productId) => {
    if (!rejectionReason) {
      showAlert({
        title: 'Atenção',
        message: 'Por favor, informe o motivo da rejeição',
        type: 'warning'
      })
      return
    }

    if (!confirm('Deseja rejeitar este produto?')) return

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products/${productId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      })

      if (response.ok) {
        showAlert({
          title: 'Produto Rejeitado',
          message: 'Produto rejeitado com sucesso',
          type: 'error'
        })
        fetchProducts()
        setSelectedProduct(null)
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao rejeitar produto',
        type: 'error'
      })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'APROVADO': 'bg-green-100 text-green-800 border-green-300',
      'REJEITADO': 'bg-red-100 text-red-800 border-red-300'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'PENDENTE': '🟡',
      'APROVADO': '🟢',
      'REJEITADO': '🔴'
    }
    return icons[status] || '⚪'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Aprovação de Produtos</h2>
          <p className="text-sm text-gray-600">Analise e aprove produtos criados por usuários</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('PENDENTE')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'PENDENTE'
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🟡 Pendentes ({products.filter(p => p.approvalStatus === 'PENDENTE').length})
          </button>
          <button
            onClick={() => setFilter('APROVADO')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'APROVADO'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🟢 Aprovados
          </button>
          <button
            onClick={() => setFilter('REJEITADO')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'REJEITADO'
                ? 'bg-red-100 text-red-800 border-2 border-red-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔴 Rejeitados
          </button>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Nenhum produto {filter.toLowerCase()}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.producerName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(product.approvalStatus)}`}>
                        {getStatusIcon(product.approvalStatus)} {product.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Detalhes */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                    <p className="text-sm text-indigo-100">Código: {selectedProduct.code}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-indigo-100 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-4">
                {/* Imagem */}
                {selectedProduct.image && (
                  <div>
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-contain bg-white rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Informações */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Produtor</label>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.producerName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Preço</label>
                    <p className="text-sm font-medium text-gray-900">R$ {selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Categoria</label>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Tipo</label>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.productType || 'Não informado'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">Descrição</label>
                    <p className="text-sm text-gray-700">{selectedProduct.description || 'Sem descrição'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Afiliação</label>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.affiliateConfig?.participateInProgram
                        ? `✅ Habilitada (${selectedProduct.affiliateConfig?.commissionPercentage || 0}% comissão)`
                        : '❌ Desabilitada'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Data de Criação</label>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedProduct.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {selectedProduct.supportEmail && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Email de Suporte</label>
                      <p className="text-sm text-gray-700">{selectedProduct.supportEmail}</p>
                    </div>
                  )}
                  {selectedProduct.salesPageUrl && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">URL da Página de Vendas</label>
                      <p className="text-sm text-gray-700 truncate">{selectedProduct.salesPageUrl}</p>
                    </div>
                  )}
                </div>

                {/* Planos */}
                {selectedProduct.plans && selectedProduct.plans.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-2">Planos Disponíveis</label>
                    <div className="space-y-2">
                      {selectedProduct.plans.map((plan, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                              {plan.description && (
                                <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-emerald-600">
                              R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métodos de Pagamento */}
                {selectedProduct.checkoutConfig?.paymentMethods && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-2">Métodos de Pagamento</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.checkoutConfig.paymentMethods.pix && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded">PIX</span>
                      )}
                      {selectedProduct.checkoutConfig.paymentMethods.boleto && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">Boleto</span>
                      )}
                      {selectedProduct.checkoutConfig.paymentMethods.creditCard && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded">Cartão</span>
                      )}
                      {selectedProduct.checkoutConfig.paymentMethods.afterPay && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded">AfterPay</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-500">Status de Aprovação</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded border ${getStatusBadge(selectedProduct.approvalStatus)}`}>
                      {getStatusIcon(selectedProduct.approvalStatus)} {selectedProduct.approvalStatus}
                    </span>
                  </div>
                </div>

                {/* Motivo de Rejeição (se rejeitado) */}
                {selectedProduct.approvalStatus === 'REJEITADO' && selectedProduct.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="text-xs font-medium text-red-700">Motivo da Rejeição</label>
                    <p className="text-sm text-red-800 mt-1">{selectedProduct.rejectionReason}</p>
                  </div>
                )}

                {/* Ações (apenas para pendentes) */}
                {selectedProduct.approvalStatus === 'PENDENTE' && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo de Rejeição (se aplicável)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        rows="3"
                        placeholder="Descreva o motivo da rejeição..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(selectedProduct.id)}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejeitar Produto
                      </button>
                      <button
                        onClick={() => handleApprove(selectedProduct.id)}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Aprovar Produto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
