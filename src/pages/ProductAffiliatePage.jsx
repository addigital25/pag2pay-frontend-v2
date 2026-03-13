import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ProductAffiliatePage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [affiliateStatus, setAffiliateStatus] = useState(null) // null, 'not_affiliated', 'pending', 'approved', 'rejected'
  const [currentUser, setCurrentUser] = useState(null)
  const [affiliateId, setAffiliateId] = useState(null)

  useEffect(() => {
    loadProduct()
    loadCurrentUser()
  }, [productId])

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAffiliateStatus('not_logged_in')
        return
      }

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCurrentUser(response.data)
      checkAffiliationStatus(response.data.id)
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      setAffiliateStatus('not_logged_in')
    }
  }

  const checkAffiliationStatus = async (userId) => {
    try {
      const response = await axios.get(`/api/affiliations/status/${productId}/${userId}`)
      setAffiliateStatus(response.data.status) // 'not_affiliated', 'pending', 'approved', 'rejected'
      setAffiliateId(response.data.affiliateId)
    } catch (error) {
      console.error('Erro ao verificar status de afiliação:', error)
      setAffiliateStatus('not_affiliated')
    }
  }

  const loadProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAffiliate = async () => {
    if (affiliateStatus === 'not_logged_in') {
      navigate('/login')
      return
    }

    try {
      await axios.post('/api/affiliations/request', {
        productId,
        userId: currentUser.id
      })
      setAffiliateStatus('pending')
    } catch (error) {
      console.error('Erro ao solicitar afiliação:', error)
      alert('Erro ao solicitar afiliação. Tente novamente.')
    }
  }

  const getButtonConfig = () => {
    switch (affiliateStatus) {
      case 'not_logged_in':
        return {
          text: 'Fazer Login para Se Afiliar',
          className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
          disabled: false,
          icon: '🔐'
        }
      case 'not_affiliated':
        return {
          text: 'Se afiliar',
          className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
          disabled: false,
          icon: '🤝'
        }
      case 'pending':
        return {
          text: '⏳ Solicitação Pendente',
          className: 'bg-orange-500 text-white cursor-not-allowed',
          disabled: true,
          icon: '⏳'
        }
      case 'approved':
        return {
          text: '✅ Você já promove este produto!',
          className: 'bg-green-600 text-white cursor-not-allowed',
          disabled: true,
          icon: '✅'
        }
      case 'rejected':
        return {
          text: '❌ Solicitação Reprovada',
          className: 'bg-red-600 text-white cursor-not-allowed',
          disabled: true,
          icon: '❌'
        }
      default:
        return {
          text: 'Carregando...',
          className: 'bg-gray-400 text-white cursor-not-allowed',
          disabled: true,
          icon: '⏳'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Produto não encontrado</p>
        </div>
      </div>
    )
  }

  const buttonConfig = getButtonConfig()
  const showLinks = affiliateStatus === 'approved'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header com imagem */}
          {product.image && (
            <div className="w-full h-80 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-8">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Conteúdo */}
          <div className="p-8">
            {/* Título e Descrição */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Informações do Produto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="font-semibold text-gray-900">{product.category || 'Não especificada'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comissão</p>
                  <p className="font-semibold text-gray-900">
                    {product.affiliateConfig?.commissionMode === 'percentage'
                      ? `${product.affiliateConfig?.commissionValue || 0}%`
                      : `R$ ${product.affiliateConfig?.commissionValue || 0}`
                    }
                  </p>
                </div>
              </div>

              {product.warrantyDays > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Garantia</p>
                    <p className="font-semibold text-gray-900">{product.warrantyDays} dias</p>
                  </div>
                </div>
              )}

              {product.productType && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Produto</p>
                    <p className="font-semibold text-gray-900">{product.productType}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Afiliação */}
            <button
              onClick={handleAffiliate}
              disabled={buttonConfig.disabled}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105 active:scale-95 ${buttonConfig.className} ${
                buttonConfig.disabled ? 'cursor-not-allowed transform-none' : ''
              }`}
            >
              {buttonConfig.text}
            </button>

            {/* Links de Afiliado (apenas se aprovado) */}
            {showLinks && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
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
                          alert('Link copiado!')
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {/* Links de Checkout por Plano */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Links de Checkout:
                  </label>
                  <div className="space-y-2">
                    {product.plans?.map((plan) => (
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
                                alert('Link copiado!')
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

        {/* Botão Voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
