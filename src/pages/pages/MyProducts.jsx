import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import ImageUpload from '../components/ImageUpload'
import AlertModal from '../components/AlertModal'
import config from '../config'

export default function MyProducts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    aprovado: true,
    pendente: true,
    aguardando: true
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    productType: '',
    image: '',
    salesPageUrl: '',
    supportEmail: '',
    warrantyDays: '7'
  })
  const [validationErrors, setValidationErrors] = useState({
    category: false,
    productType: false,
    image: false,
    description: false,
    salesPageUrl: false,
    supportEmail: false,
    warrantyDays: false
  })
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Admin vê todos os produtos, usuários normais veem apenas os seus
      const url = user.role === 'admin'
        ? `${config.apiUrl}/api/products`
        : `${config.apiUrl}/api/products?userId=${user.id}&type=my-products`

      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset validation errors
    setValidationErrors({
      category: false,
      productType: false,
      image: false,
      description: false,
      salesPageUrl: false,
      supportEmail: false,
      warrantyDays: false
    })

    // Validação customizada
    const errors = {
      category: !formData.category || formData.category === '',
      productType: !formData.productType || formData.productType === '',
      image: !formData.image || formData.image.trim() === '',
      description: !formData.description || formData.description.trim() === '',
      salesPageUrl: !formData.salesPageUrl || formData.salesPageUrl.trim() === '',
      supportEmail: !formData.supportEmail || formData.supportEmail.trim() === '',
      warrantyDays: !formData.warrantyDays || formData.warrantyDays === ''
    }

    const hasErrors = Object.values(errors).some(error => error)

    if (hasErrors) {
      setValidationErrors(errors)

      const missingFields = []
      if (errors.description) missingFields.push('Descrição do produto')
      if (errors.category) missingFields.push('Categoria')
      if (errors.productType) missingFields.push('Tipo de Produto')
      if (errors.image) missingFields.push('Imagem do produto')
      if (errors.salesPageUrl) missingFields.push('URL da página de vendas')
      if (errors.supportEmail) missingFields.push('E-mail de suporte')
      if (errors.warrantyDays) missingFields.push('Tempo de garantia (dias)')

      setAlertModal({
        isOpen: true,
        message: `Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}.`
      })
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: 0, // Preço será definido nos planos
        category: formData.category,
        productType: formData.productType,
        image: formData.image || 'https://via.placeholder.com/400x300?text=Sem+Imagem',
        salesPageUrl: formData.salesPageUrl,
        supportEmail: formData.supportEmail,
        warrantyDays: parseInt(formData.warrantyDays) || 0,
        producerId: user.id,
        producerName: user.name,
        // Ativar formas de pagamento por padrão
        checkoutConfig: {
          paymentMethods: {
            pix: true,
            boleto: true,
            creditCard: true,
            receiveAndPay: false
          }
        }
      }

      console.log('Enviando produto:', productData)

      const response = await fetch(`${config.apiUrl}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Produto criado:', result)
        setAlertModal({ isOpen: true, message: 'Produto criado com sucesso!' })
        setShowProductForm(false)
        fetchProducts()
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          productType: '',
          image: '',
          salesPageUrl: '',
          supportEmail: '',
          warrantyDays: '7'
        })
        setValidationErrors({
          category: false,
          productType: false,
          image: false,
          description: false,
          salesPageUrl: false,
          supportEmail: false,
          warrantyDays: false
        })
      } else {
        const errorData = await response.json()
        console.error('Erro do servidor:', errorData)
        setAlertModal({ isOpen: true, message: 'Erro ao criar produto: ' + (errorData.error || 'Erro desconhecido') })
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      setAlertModal({ isOpen: true, message: 'Erro ao conectar com o servidor. Verifique se o backend está rodando na porta 3001.' })
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'APROVADO': { bg: 'bg-green-100', text: 'text-green-800', label: 'APROVADO', dot: 'bg-green-500' },
      'PENDENTE': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDENTE', dot: 'bg-yellow-500' },
      'AGUARDANDO ALTERAÇÃO': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'AGUARDANDO ALTERAÇÃO', dot: 'bg-orange-500' }
    }
    const s = statusMap[status] || statusMap['PENDENTE']
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>
    )
  }

  const filteredProducts = products.filter(product => {
    if (filters.aprovado && product.approvalStatus === 'APROVADO') return true
    if (filters.pendente && product.approvalStatus === 'PENDENTE') return true
    if (filters.aguardando && product.approvalStatus === 'AGUARDANDO ALTERAÇÃO') return true
    return false
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    // Se for o campo de URL e não começar com http:// ou https://, adicionar automaticamente
    if (name === 'salesPageUrl' && value && !value.startsWith('http://') && !value.startsWith('https://')) {
      setFormData({ ...formData, [name]: `https://${value}` })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.role === 'admin' ? 'Todos os produtos' : 'Meus Produtos'}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                Por padrão o carregamento inicial do filtro busca os status: <span className="font-medium text-gray-700">APROVADO</span>, <span className="font-medium text-gray-700">PENDENTE</span> e <span className="font-medium text-gray-700">AGUARDANDO ALTERAÇÃO</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtro
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Cadastrar Produto
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro produto.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowProductForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Novo Produto
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(product.approvalStatus || 'PENDENTE')}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2"></span>
                    <h3
                      className="font-semibold text-lg flex-1 truncate cursor-pointer hover:text-emerald-600 transition"
                      title={product.name}
                      onDoubleClick={() => {
                        navigator.clipboard.writeText(product.name)
                        setAlertModal({ isOpen: true, message: 'Nome do produto copiado!' })
                      }}
                    >
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Código: <span className="font-mono font-medium text-gray-700">{product.code}</span>
                  </p>
                  {user.role === 'admin' && product.producerName && (
                    <p className="text-xs text-gray-600 mb-4">
                      Produtor: <span className="font-medium text-emerald-600">{product.producerName}</span>
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium mt-2"
                  >
                    MAIS INFORMAÇÕES
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Filtros */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Filtrar Produtos</h2>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.aprovado}
                    onChange={(e) => setFilters({ ...filters, aprovado: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium">APROVADO</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.pendente}
                    onChange={(e) => setFilters({ ...filters, pendente: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium">PENDENTE</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.aguardando}
                    onChange={(e) => setFilters({ ...filters, aguardando: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium">AGUARDANDO ALTERAÇÃO</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ aprovado: true, pendente: true, aguardando: true })
                    setShowFilters(false)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Aplicar Filtro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal - SIMPLIFICADO */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto pt-20">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Criar Produto</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição do produto <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        validationErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Saúde, Bem-estar e Beleza">Saúde, Bem-estar e Beleza</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Educação">Educação</option>
                      <option value="Negócios">Negócios</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Produto <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        validationErrors.productType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione produto</option>
                      <option value="E-book">E-book</option>
                      <option value="Assinatura">Assinatura</option>
                      <option value="Curso">Curso</option>
                      <option value="Produto Físico">Produto Físico</option>
                    </select>
                  </div>
                </div>

                {/* Upload de Imagem */}
                <div>
                  <ImageUpload
                    value={formData.image}
                    onChange={(imageData) => setFormData({ ...formData, image: imageData })}
                    hasError={validationErrors.image}
                  />
                </div>

                {/* URL da página de vendas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da página de vendas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="salesPageUrl"
                    value={formData.salesPageUrl}
                    onChange={handleChange}
                    required
                    placeholder="www.exemplo.com/vendas"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.salesPageUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Digite apenas o domínio (ex: www.seusite.com). O https:// será adicionado automaticamente.</p>
                </div>

                {/* E-mail de suporte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail de suporte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleChange}
                    required
                    placeholder="suporte@exemplo.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.supportEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Tempo de garantia (dias) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo de garantia (dias) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="warrantyDays"
                    value={formData.warrantyDays}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="7"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.warrantyDays ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Configurações Avançadas</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Após criar o produto, você poderá configurar afiliação, formas de pagamento, planos, checkouts e muito mais clicando em "MAIS INFORMAÇÕES".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
                  >
                    Criar Produto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
      />
    </AdminLayout>
  )
}
