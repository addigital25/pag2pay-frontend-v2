import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar produtos:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Compre Agora, Pague Depois
        </h1>
        <p className="text-xl text-gray-600">
          Receba seu produto primeiro e pague somente após a entrega
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  R$ {product.price.toFixed(2)}
                </span>
                <button
                  onClick={() => navigate(`/checkout/${product.id}`)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Comprar
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Estoque: {product.stock} unidades
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-indigo-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Como Funciona o AfterPay?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">Escolha o Produto</h3>
            <p className="text-sm text-gray-600">Selecione o que deseja comprar</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">Receba o Produto</h3>
            <p className="text-sm text-gray-600">Enviamos sem precisar pagar</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">Confirme a Entrega</h3>
            <p className="text-sm text-gray-600">Verifique se está tudo certo</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold mb-2">Pague Depois</h3>
            <p className="text-sm text-gray-600">Receba o link e efetue o pagamento</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductList
