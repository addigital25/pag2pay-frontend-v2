import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import config from '../config'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'

export default function Products() {
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [activeTab, setActiveTab] = useState('my-products')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Cursos',
    image: '',
    affiliateEnabled: false,
    affiliateCommission: 30,
    paymentMethods: {
      pix: true,
      boleto: true,
      creditCard: true,
      afterPay: false
    }
  })

  useEffect(() => {
    fetchProducts()
  }, [activeTab])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/products?userId=${user.id}&type=${activeTab}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        producerId: user.id,
        producerName: user.name,
        affiliateCommission: parseInt(formData.affiliateCommission)
      }

      const response = await fetch(`${config.apiUrl}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        console.log('✅ Produto criado com sucesso!')
        const result = await response.json()
        console.log('📦 Produto:', result)
        setShowProductForm(false)
        setShowSuccessModal(true)
        fetchProducts()
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: 'Cursos',
          image: '',
          affiliateEnabled: false,
          affiliateCommission: 30,
          paymentMethods: {
            pix: true,
            boleto: true,
            creditCard: true,
            afterPay: false
          }
        })
      } else {
        console.error('❌ Erro na resposta:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Dados do erro:', errorData)
        showAlert({
          title: 'Erro ao Criar Produto',
          message: 'Não foi possível criar o produto. Verifique o console para mais detalhes.',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error)
      showAlert({
        title: 'Erro ao Criar Produto',
        message: 'Erro ao criar produto: ' + error.message,
        type: 'error'
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name.startsWith('payment_')) {
        const method = name.replace('payment_', '')
        setFormData({
          ...formData,
          paymentMethods: {
            ...formData.paymentMethods,
            [method]: checked
          }
        })
      } else {
        setFormData({ ...formData, [name]: checked })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setShowDetailsModal(true)
  }

  const handleRequestDelete = () => {
    setShowDetailsModal(false)
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
      const response = await fetch(`${config.apiUrl}/api/products/${selectedProduct.id}/request-deletion`, {
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
        setSelectedProduct(null)
        fetchProducts()
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          {activeTab === 'my-products' && (
            <div className="flex gap-3">
              {/* Botão Filtro - Estilo Minimalista */}
              <button
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtro
              </button>

              {/* Botão Criar Produto - Degradê Roxo/Azul */}
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Cadastrar Produto
              </button>
            </div>
          )}
        </div>

        {/* Tabs Slider */}
        <div className="bg-gray-100 rounded-lg p-1 inline-flex mb-6">
          <button
            onClick={() => setActiveTab('my-products')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === 'my-products'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Meus Produtos
          </button>
          <button
            onClick={() => setActiveTab('my-affiliations')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === 'my-affiliations'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Minhas Afiliações
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {activeTab === 'my-products'
                ? 'Você ainda não tem produtos cadastrados'
                : 'Você ainda não está afiliado a nenhum produto'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 min-h-[2rem]">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                  <div className="flex justify-between items-center mb-3 mt-auto">
                    <span className="text-2xl font-bold text-blue-800">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Estoque: {product.stock}
                    </span>
                  </div>
                  {product.affiliateEnabled && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Afiliação Habilitada
                      </span>
                      <span className="text-xs text-gray-600">
                        {product.affiliateCommission}% comissão
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.paymentMethods.pix && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">PIX</span>
                    )}
                    {product.paymentMethods.boleto && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Boleto</span>
                    )}
                    {product.paymentMethods.creditCard && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Cartão</span>
                    )}
                    {product.paymentMethods.afterPay && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">AfterPay</span>
                    )}
                  </div>
                  {activeTab === 'my-products' && (
                    <button
                      onClick={() => handleViewDetails(product)}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                      Mais Informações
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{zIndex: 9999}}>
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto Criado com Sucesso!</h2>
              <p className="text-gray-600 mb-6">
                Seu produto foi cadastrado e está aguardando aprovação da plataforma.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Produto */}
        {showDetailsModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Detalhes do Produto</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nome do Produto</label>
                    <p className="font-semibold">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Categoria</label>
                    <p className="font-semibold">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Preço</label>
                    <p className="font-semibold">R$ {selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Estoque</label>
                    <p className="font-semibold">{selectedProduct.stock}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Descrição</label>
                  <p className="font-semibold">{selectedProduct.description}</p>
                </div>

                {selectedProduct.image && (
                  <div>
                    <label className="text-sm text-gray-600">Imagem</label>
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-lg mt-2" />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={handleRequestDelete}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Excluir Produto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Solicitação de Exclusão */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-red-600">Solicitar Exclusão</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteReason('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Você está solicitando a exclusão do produto: <strong>{selectedProduct.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Esta solicitação será enviada para aprovação do administrador da plataforma.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Exclusão *
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Informe o motivo pelo qual deseja excluir este produto..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteReason('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitDeleteRequest}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Enviar Solicitação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Novo Produto</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  >
                    <option value="Cursos">Cursos</option>
                    <option value="E-books">E-books</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Mentorias">Mentorias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tamanho recomendado: 500x400 pixels para melhor visualização
                  </p>
                </div>

                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      name="affiliateEnabled"
                      checked={formData.affiliateEnabled}
                      onChange={handleChange}
                      className="rounded text-blue-800 focus:ring-blue-700"
                    />
                    <span className="font-medium">Habilitar Programa de Afiliados</span>
                  </label>

                  {formData.affiliateEnabled && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comissão para Afiliados (%)
                      </label>
                      <input
                        type="number"
                        name="affiliateCommission"
                        value={formData.affiliateCommission}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Formas de Pagamento Aceitas</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="payment_pix"
                        checked={formData.paymentMethods.pix}
                        onChange={handleChange}
                        className="rounded text-blue-800 focus:ring-blue-700"
                      />
                      <span>PIX</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="payment_boleto"
                        checked={formData.paymentMethods.boleto}
                        onChange={handleChange}
                        className="rounded text-blue-800 focus:ring-blue-700"
                      />
                      <span>Boleto Bancário</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="payment_creditCard"
                        checked={formData.paymentMethods.creditCard}
                        onChange={handleChange}
                        className="rounded text-blue-800 focus:ring-blue-700"
                      />
                      <span>Cartão de Crédito</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="payment_afterPay"
                        checked={formData.paymentMethods.afterPay}
                        onChange={handleChange}
                        className="rounded text-blue-800 focus:ring-blue-700"
                      />
                      <span>Receba e Pague (AfterPay)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Criar Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
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
    </AdminLayout>
  )
}
