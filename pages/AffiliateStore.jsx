import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import TurbinaVendas from '../components/TurbinaVendas'
import config from '../config'

export default function AffiliateStore() {
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      console.log('🔍 Buscando produtos na vitrine...')
      console.log('📡 API URL:', config.apiUrl)
      const response = await fetch(`${config.apiUrl}/api/products?type=affiliate-store`)
      const data = await response.json()
      console.log('📦 Produtos recebidos:', data.length)
      console.log('📋 Produtos:', data)
      setProducts(data)
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error)
    }
    setLoading(false)
  }

  const openAffiliateModal = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Função para calcular range de preços dos planos
  const getPriceRange = (product) => {
    if (!product.plans || product.plans.length === 0) {
      return 'Planos não disponíveis'
    }

    const prices = product.plans.map(plan => plan.price).filter(price => price > 0)

    if (prices.length === 0) {
      return 'Planos não disponíveis'
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      return `R$ ${minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return `R$ ${minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a R$ ${maxPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleAffiliate = async (productId) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/affiliations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          affiliateId: user.id
        })
      })

      if (response.ok) {
        showAlert({
          title: 'Sucesso!',
          message: 'Afiliação realizada com sucesso!',
          type: 'success'
        })
        closeModal()
        fetchProducts()
      } else {
        const error = await response.json()
        showAlert({
          title: 'Erro',
          message: error.error || 'Erro ao se afiliar',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao se afiliar:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao processar afiliação',
        type: 'error'
      })
    }
  }

  const filteredProducts = products
    .filter(p => {
      // Filtrar apenas produtos APROVADOS, visíveis na vitrine E participando do programa de afiliados
      const isApproved = p.approvalStatus === 'APROVADO'
      const isVisible = p.affiliateConfig?.visibleInStore === true
      const participatesInProgram = p.affiliateConfig?.participateInProgram === true
      console.log(`🔍 Filtro - ${p.name}:`, {
        approvalStatus: p.approvalStatus,
        isApproved,
        affiliateConfig: p.affiliateConfig,
        visibleInStore: p.affiliateConfig?.visibleInStore,
        isVisible,
        participateInProgram: p.affiliateConfig?.participateInProgram,
        participatesInProgram,
        passa: isApproved && isVisible && participatesInProgram
      })
      return isApproved && isVisible && participatesInProgram
    })
    .filter(p => {
      if (filter === 'all') return true
      return p.category === filter
    })
    .filter(p => {
      if (!searchTerm) return true
      return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.description.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      // Ordenar por turbinaScore (maior primeiro)
      const scoreA = a.turbinaScore || 0
      const scoreB = b.turbinaScore || 0
      return scoreB - scoreA
    })

  console.log('✅ Produtos após todos os filtros:', filteredProducts.length)
  console.log('📋 Produtos filtrados:', filteredProducts.map(p => p.name))

  const categories = ['all', ...new Set(products.map(p => p.category))]

  console.log('🎨 RENDERIZANDO VITRINE:')
  console.log('   Loading:', loading)
  console.log('   Total products:', products.length)
  console.log('   Filtered products:', filteredProducts.length)
  console.log('   Vai mostrar produtos?', !loading && filteredProducts.length > 0)

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vitrine de Produtos</h1>
          <p className="text-gray-600">
            Escolha produtos para se afiliar e começar a ganhar comissões
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Produto
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do produto..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-4 text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Nenhum produto encontrado com os filtros aplicados'
                : 'Nenhum produto disponível para afiliação no momento'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Exibindo {filteredProducts.length} produto(s)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                console.log('🎨 Renderizando card do produto:', product.name, {
                  id: product.id,
                  turbinaScore: product.turbinaScore,
                  category: product.category,
                  code: product.code
                })
                return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-contain bg-white"
                    />

                    {/* Badge Mais Vendido */}
                    {product.isBestseller && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Mais Vendido
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {product.affiliateCommission}% comissão
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Nome do Produto */}
                    <h3 className="font-bold text-lg mb-2 text-gray-800">
                      {product.name}
                    </h3>

                    {/* Código */}
                    <p className="text-sm text-gray-400 mb-3">
                      Código: <span className="font-mono">{product.code}</span>
                    </p>

                    {/* Turbina de Vendas */}
                    <div className="mb-4">
                      {console.log('🎯 Renderizando TurbinaVendas:', {
                        productName: product.name,
                        turbinaScore: product.turbinaScore || 0
                      })}
                      <TurbinaVendas score={product.turbinaScore || 0} size="sm" showLabel={true} />
                    </div>

                    {/* Categoria */}
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Categoria:</span> {product.category}
                      </p>
                    </div>

                    {/* Produtor */}
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Produtor:</span> {product.producerName}
                      </p>
                    </div>

                    {/* Preço */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Preço:</span> {getPriceRange(product)}
                      </p>
                    </div>

                    {/* Moeda */}
                    <div className="mb-4 flex items-center gap-2">
                      <p className="text-sm text-gray-600 font-medium">Moeda:</p>
                      <img src="https://flagcdn.com/w40/br.png" alt="Brasil" className="w-6 h-4 rounded shadow-sm" />
                    </div>

                    {/* Botão Afiliar */}
                    <button
                      onClick={() => openAffiliateModal(product)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2.5 rounded-lg hover:from-emerald-700 hover:to-green-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      Quero me Afiliar
                    </button>
                  </div>
                </div>
                )
              })}
            </div>
          </>
        )}

        {/* Modal de Afiliação */}
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header do Modal */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Detalhes do Produto</h2>
                    <p className="text-emerald-100 text-sm">Confira todas as informações antes de se afiliar</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6">
                {/* Imagem e Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Imagem */}
                  <div className="relative">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                    {selectedProduct.isBestseller && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Mais Vendido
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações Principais */}
                  <div>
                    <div className="mb-4">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                        {selectedProduct.category}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedProduct.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {/* Preço e Comissão */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Preço do Produto</p>
                        <p className="text-3xl font-bold text-gray-800">
                          R$ {selectedProduct.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="border-t border-green-200 pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Sua Comissão</p>
                            <p className="text-2xl font-bold text-green-600">
                              R$ {((selectedProduct.price * selectedProduct.affiliateCommission) / 100).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                            {selectedProduct.affiliateCommission}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Produtor */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Produtor</p>
                      <p className="font-semibold text-gray-800">{selectedProduct.producerName}</p>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mb-6">
                  {/* Formas de Pagamento */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Formas de Pagamento Aceitas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.paymentMethods.pix && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                          💎 PIX
                        </span>
                      )}
                      {selectedProduct.paymentMethods.boleto && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                          🏦 Boleto
                        </span>
                      )}
                      {selectedProduct.paymentMethods.creditCard && (
                        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                          💳 Cartão
                        </span>
                      )}
                      {selectedProduct.paymentMethods.afterPay && (
                        <span className="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                          🚚 AfterPay
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vantagens de se afiliar */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-5 rounded-lg mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vantagens de se Afiliar
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Comissão de <strong>{selectedProduct.affiliateCommission}%</strong> por cada venda realizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Link de afiliado exclusivo para rastreamento de vendas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Materiais de divulgação disponíveis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Pagamento automático das comissões</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Suporte direto do produtor</span>
                    </li>
                  </ul>
                </div>

                {/* Botão de Afiliação */}
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAffiliate(selectedProduct.id)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 rounded-lg hover:from-emerald-700 hover:to-green-700 transition font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Confirmar Afiliação
                  </button>
                </div>
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
    </AdminLayout>
  )
}
