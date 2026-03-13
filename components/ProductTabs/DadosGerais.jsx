import { useState } from 'react'
import ImageUpload from '../ImageUpload'
import AlertModal from '../AlertModal'

export default function DadosGerais({ product, setProduct, userRole }) {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APROVADO':
        return 'text-green-600'
      case 'PENDENTE':
        return 'text-yellow-600'
      case 'AGUARDANDO ALTERAÇÃO':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const isAdmin = userRole === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Dados do produto</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Upload de Imagem */}
        <div className="md:col-span-1">
          <ImageUpload
            value={product.image}
            onChange={(imageData) => setProduct({ ...product, image: imageData })}
          />
        </div>

        {/* Coluna Direita - Informações do Produto */}
        <div className="md:col-span-2 space-y-6">
          {/* Header com Código e Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-gray-600">Código: </span>
                <span className="font-medium">{product.code || 'Gerando...'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="approvalStatus"
                  value={product.approvalStatus || 'PENDENTE'}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${getStatusColor(product.approvalStatus)}`}
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="AGUARDANDO ALTERAÇÃO">Aguardando Alteração</option>
                </select>
                {!isAdmin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas administradores podem alterar o status
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato
                </label>
                <select
                  name="productType"
                  value={product.productType || 'E-book'}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                >
                  <option value="E-book">E-book</option>
                  <option value="Assinatura">Assinatura</option>
                  <option value="Curso">Curso</option>
                  <option value="Produto Físico">Produto Físico</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  O formato não pode ser alterado após a criação do produto
                </p>
              </div>
            </div>
          </div>

          {/* Link do produto na loja */}
          {product.status === 'active' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link do produto na loja:
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={`${window.location.origin}/produto/${product.id}`}
                    readOnly
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-blue-600 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => window.open(`/produto/${product.id}`, '_blank')}
                    title="Clique para abrir"
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/produto/${product.id}`)
                    showAlert('Sucesso', 'Link copiado!', 'success')
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Link fixo para visualização do produto na vitrine
              </p>
            </div>
          )}

          {/* Disponível para venda */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Disponível para venda?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="availableForSale"
                checked={product.availableForSale !== false}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          {/* Moedas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moedas
            </label>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300">
              <button className="text-gray-400 hover:text-gray-600">×</button>
              <span className="text-sm">BRL (R$) - Real brasileiro</span>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={product.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={product.description || ''}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              required
            ></textarea>
          </div>

          {/* Categoria (mantido para compatibilidade com backend) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={product.category || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

          {/* URL da página de vendas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da página de vendas <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="salesPageUrl"
              value={product.salesPageUrl || ''}
              onChange={handleChange}
              placeholder="https://exemplo.com/vendas"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* E-mail de suporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail de suporte <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="supportEmail"
              value={product.supportEmail || ''}
              onChange={handleChange}
              placeholder="suporte@exemplo.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Tempo de garantia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo de garantia (dias) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="warrantyDays"
              value={product.warrantyDays || ''}
              onChange={handleChange}
              placeholder="7"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
