import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'

// Import tab components
import DadosGerais from '../components/ProductTabs/DadosGerais'
import Planos from '../components/ProductTabs/Planos'
import Checkouts from '../components/ProductTabs/Checkouts'
import Comissao from '../components/ProductTabs/Comissao'
import ProgramaAfiliados from '../components/ProductTabs/ProgramaAfiliados'
import Afiliados from '../components/ProductTabs/Afiliados'
import Gerente from '../components/ProductTabs/Gerente'
import Cupons from '../components/ProductTabs/Cupons'
import Campanhas from '../components/ProductTabs/Campanhas'
import AfterPayConfig from '../components/ProductTabs/AfterPayConfig'

export default function ProductEdit() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dados-gerais')
  const [showPlanosDropdown, setShowPlanosDropdown] = useState(false)
  const [showComissionamentoDropdown, setShowComissionamentoDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      console.log('📥 Carregando produto:', productId)
      const response = await fetch(`${config.apiUrl}/api/products/${productId}`)
      const data = await response.json()

      console.log('📦 Produto carregado:', data.id)
      console.log('   Nome:', data.name)
      console.log('   approvalStatus:', data.approvalStatus)
      console.log('   affiliateConfig:', data.affiliateConfig)

      setProduct(data)
    } catch (error) {
      console.error('❌ Erro ao carregar produto:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    try {
      console.log('💾 Salvando produto:', productId)
      console.log('📦 affiliateConfig:', product.affiliateConfig)
      console.log('✅ visibleInStore:', product.affiliateConfig?.visibleInStore)
      console.log('📋 approvalStatus:', product.approvalStatus)

      const response = await fetch(`${config.apiUrl}/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })

      if (response.ok) {
        showAlert({
          title: 'Sucesso!',
          message: 'Produto atualizado com sucesso!',
          type: 'success'
        })
        // Recarregar o produto atualizado do backend
        await fetchProduct()
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao salvar produto',
        type: 'error'
      })
    }
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const handleSubmitDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      showAlert({
        title: 'Campo Obrigatório',
        message: 'Por favor, informe o motivo da exclusão.',
        type: 'warning'
      })
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/products/${productId}/request-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason: deleteReason,
          userId: user.id,
          userName: user.name
        })
      })

      if (response.ok) {
        showAlert({
          title: 'Solicitação Enviada!',
          message: 'Solicitação de exclusão enviada com sucesso! Aguarde a aprovação do administrador.',
          type: 'success'
        })
        setShowDeleteModal(false)
        setDeleteReason('')
        setTimeout(() => {
          navigate('/products/my-products')
        }, 2000)
      } else {
        throw new Error('Erro ao enviar solicitação')
      }
    } catch (error) {
      console.error('Erro ao solicitar exclusão:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao enviar solicitação. Por favor, tente novamente.',
        type: 'error'
      })
    }
  }

  const mainTabs = [
    { id: 'dados-gerais', name: 'Dados gerais', icon: '⚙️' },
    { id: 'planos', name: 'Planos', icon: '📋', hasDropdown: true },
    { id: 'checkouts', name: 'Checkouts', icon: '🛒' },
    { id: 'comissao', name: 'Comissão', icon: '💰' },
    { id: 'programa-afiliados', name: 'Programa de Afiliados', icon: '🤝' },
    { id: 'afiliados', name: 'Afiliados', icon: '👥' },
    { id: 'gerente', name: 'Gerente', icon: '👔' }
  ]

  const secondaryTabs = [
    { id: 'cupons', name: 'Cupons de Desconto', icon: '🎟️' },
    { id: 'campanhas', name: 'Campanhas', icon: '📢' },
    { id: 'afterpay', name: 'After Pay', icon: '💳' }
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Produto não encontrado</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/products/my-products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Editar Produto: {product.name}</h1>
            <p className="text-sm text-gray-500">Código: {product.code}</p>
          </div>
        </div>

        {/* Main Tabs - Linha 1 */}
        <div className="bg-white rounded-t-lg border-b border-gray-200 px-4 pt-4">
          <div className="flex gap-1 overflow-x-auto">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-3 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900 border-b-3 border-transparent'
                }`}
                style={{ borderBottomWidth: '3px' }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.hasDropdown && <span className="ml-1">▼</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Tabs - Linha 2 */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <div className="flex gap-1">
            {secondaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded transition ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-6 min-h-[500px]">
          {activeTab === 'dados-gerais' && <DadosGerais product={product} setProduct={setProduct} userRole={user?.role} />}
          {activeTab === 'planos' && <Planos product={product} setProduct={setProduct} setActiveTab={setActiveTab} />}
          {activeTab === 'checkouts' && <Checkouts product={product} setProduct={setProduct} />}
          {activeTab === 'comissao' && <Comissao product={product} setProduct={setProduct} />}
          {activeTab === 'programa-afiliados' && <ProgramaAfiliados product={product} setProduct={setProduct} />}
          {activeTab === 'afiliados' && <Afiliados product={product} />}
          {activeTab === 'gerente' && <Gerente product={product} />}
          {activeTab === 'cupons' && <Cupons product={product} setProduct={setProduct} />}
          {activeTab === 'campanhas' && <Campanhas product={product} setProduct={setProduct} />}
          {activeTab === 'afterpay' && <AfterPayConfig product={product} setProduct={setProduct} />}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDelete}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir Produto
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/products/my-products')}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Solicitação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Solicitar Exclusão do Produto</h3>
            <p className="text-gray-600 mb-4">
              Para excluir este produto, você precisa informar o motivo. Sua solicitação será enviada para aprovação do administrador.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Exclusão *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Ex: Produto descontinuado, problemas com fornecedor, etc."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitDeleteRequest}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Enviar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}

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
