export default function Urls({ product, setProduct }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">URLs do Produto</h2>
        <p className="text-sm text-gray-600 mb-6">Configure as URLs e redirecionamentos</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL do Produto (Slug)</label>
          <input type="text" placeholder="meu-produto" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Agradecimento</label>
          <input type="url" placeholder="https://seu-site.com/obrigado" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Cancelamento</label>
          <input type="url" placeholder="https://seu-site.com/cancelado" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
