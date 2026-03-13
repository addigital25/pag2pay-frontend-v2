import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import config from '../config'

export default function MyAffiliations() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/products?userId=${user.id}&type=my-affiliations`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar afiliações:', error)
    }
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Minhas Afiliações</h1>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma afiliação encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">Vá até a Vitrine para se afiliar a produtos.</p>
            <div className="mt-6">
              <a
                href="/affiliate-store"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ir para Vitrine
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={product.image || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-emerald-600">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Estoque: {product.stock}
                    </span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-800 font-medium">
                      Sua comissão: {product.affiliateCommission}%
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      R$ {(product.price * product.affiliateCommission / 100).toFixed(2)} por venda
                    </p>
                  </div>
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
                  <button className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition">
                    Copiar Link de Afiliado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
