import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import config from '../config'
import AlertModal from '../components/AlertModal'
import TurbinaVendas from '../components/TurbinaVendas'

export default function ProductView() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [affiliateStatus, setAffiliateStatus] = useState(null) // 'not_affiliated', 'pending', 'approved', 'rejected'
  const [affiliateId, setAffiliateId] = useState(null)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onClose: () => {}
  })

  useEffect(() => {
    fetchProduct()
    if (user) {
      checkAffiliationStatus()
    }
  }, [productId, user])

  const showAlert = (title, message, type = 'info', onClose = () => {}) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      onClose: () => {
        setAlertModal(prev => ({ ...prev, isOpen: false }))
        onClose()
      }
    })
  }

  const checkAffiliationStatus = async () => {
    if (!user || !productId) return

    try {
      const response = await fetch(`${config.apiUrl}/api/affiliations/status/${productId}/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setAffiliateStatus(data.status) // 'not_affiliated', 'pending', 'approved', 'rejected'
        setAffiliateId(data.affiliateId)
      } else {
        setAffiliateStatus('not_affiliated')
      }
    } catch (error) {
      console.error('Erro ao verificar status de afiliação:', error)
      setAffiliateStatus('not_affiliated')
    }
  }

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/products/${productId}`)

      if (!response.ok) {
        console.error('Produto não encontrado - Status:', response.status)
        setProduct(null)
        setLoading(false)
        return
      }

      const data = await response.json()

      // Verificar se produto está ativo
      if (data.status !== 'active') {
        console.warn('Produto inativo:', data)
        setProduct(null)
        setLoading(false)
        return
      }

      setProduct(data)
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      setProduct(null)
    }
    setLoading(false)
  }

  const handleAffiliate = async () => {
    if (!user) {
      showAlert(
        'Autenticação Necessária',
        'Você precisa estar logado para se afiliar.',
        'warning',
        () => navigate('/login')
      )
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/affiliations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          affiliateId: user.id
        })
      })

      if (response.ok) {
        showAlert(
          'Sucesso!',
          'Solicitação de afiliação enviada! Aguarde a aprovação do produtor.',
          'success'
        )
        // Atualizar status para pendente
        setAffiliateStatus('pending')
      } else {
        const error = await response.json()
        showAlert(
          'Erro na Afiliação',
          error.error || 'Erro ao se afiliar',
          'error'
        )
      }
    } catch (error) {
      console.error('Erro ao se afiliar:', error)
      showAlert(
        'Erro',
        'Erro ao processar afiliação',
        'error'
      )
    }
  }

  const getButtonConfig = () => {
    if (!user) {
      return {
        text: '🔐 Fazer Login para Se Afiliar',
        className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        disabled: false,
        onClick: () => navigate('/login')
      }
    }

    switch (affiliateStatus) {
      case 'pending':
        return {
          text: '⏳ Solicitação Pendente',
          className: 'bg-orange-500 cursor-not-allowed',
          disabled: true,
          onClick: () => {}
        }
      case 'approved':
        return {
          text: '✅ Você já promove este produto!',
          className: 'bg-green-600 cursor-not-allowed',
          disabled: true,
          onClick: () => {}
        }
      case 'rejected':
        return {
          text: '❌ Solicitação Reprovada',
          className: 'bg-red-600 cursor-not-allowed',
          disabled: true,
          onClick: () => {}
        }
      default: // 'not_affiliated' ou null
        return {
          text: '🤝 Quero me Afiliar',
          className: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
          disabled: false,
          onClick: handleAffiliate
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">
            Este produto pode ter sido removido ou não está mais disponível para afiliação.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Card do Produto */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-1">Detalhes do Produto</h1>
                <p className="text-indigo-100 text-sm">Confira todas as informações antes de se afiliar</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {/* Imagem e Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Imagem */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                {product.isBestseller && (
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
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                    {product.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Preço e Comissão */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Preço do Produto</p>
                    <p className="text-3xl font-bold text-gray-800">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sua Comissão</p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {((product.price * product.affiliateCommission) / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                        {product.affiliateCommission}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Produtor */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Produtor</p>
                  <p className="font-semibold text-gray-800">{product.producerName}</p>
                </div>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Formas de Pagamento Aceitas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.paymentMethods.pix && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                      💎 PIX
                    </span>
                  )}
                  {product.paymentMethods.boleto && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                      🏦 Boleto
                    </span>
                  )}
                  {product.paymentMethods.creditCard && (
                    <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                      💳 Cartão
                    </span>
                  )}
                  {product.paymentMethods.afterPay && (
                    <span className="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                      🚚 AfterPay
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Turbina de Vendas */}
            {product.turbinaScore !== undefined && (
              <div className="mb-6">
                <TurbinaVendas score={product.turbinaScore} size="lg" />
              </div>
            )}

            {/* Vantagens de se afiliar */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vantagens de se Afiliar
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Comissão de <strong>{product.affiliateCommission}%</strong> por cada venda realizada</span>
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
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Voltar
              </button>
              <button
                onClick={getButtonConfig().onClick}
                disabled={getButtonConfig().disabled}
                className={`flex-1 text-white py-3.5 rounded-lg transition font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${getButtonConfig().className} ${
                  getButtonConfig().disabled ? 'opacity-90' : ''
                }`}
              >
                {getButtonConfig().text}
              </button>
            </div>

            {/* Links de Afiliado (apenas se aprovado) */}
            {affiliateStatus === 'approved' && affiliateId && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Seus Links de Afiliado
                </h3>

                {/* Página de Vendas */}
                {product.salesPageUrl && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Página de Vendas:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`${product.salesPageUrl}?ref=${affiliateId}`}
                        readOnly
                        className="flex-1 px-4 py-2 border border-green-300 rounded-lg bg-white text-green-700 font-medium"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${product.salesPageUrl}?ref=${affiliateId}`)
                          showAlert('Sucesso', 'Link copiado!', 'success')
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {/* Links de Checkout por Plano */}
                {product.plans && product.plans.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Links de Checkout:
                    </label>
                    <div className="space-y-2">
                      {product.plans.map((plan) => (
                        <div key={plan.code} className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">{plan.name}</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={`${window.location.origin}/checkout/${productId}?plan=${plan.code}&ref=${affiliateId}`}
                                readOnly
                                className="flex-1 px-3 py-2 border border-green-300 rounded-lg bg-white text-green-700 text-sm"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/checkout/${productId}?plan=${plan.code}&ref=${affiliateId}`)
                                  showAlert('Sucesso', 'Link copiado!', 'success')
                                }}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-green-700 mt-4 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Use estes links para promover o produto e receber comissões pelas vendas realizadas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Pag2Pay - Plataforma de Vendas e Afiliação</p>
        </div>
      </div>

      {/* Modal de Alerta */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.onClose}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
