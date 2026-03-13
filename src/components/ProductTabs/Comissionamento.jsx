export default function Comissionamento({ product, setProduct }) {
  const handleChange = (e) => {
    setProduct({ ...product, affiliateEnabled: e.target.checked })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Comissionamento e Afiliação</h2>
        <p className="text-sm text-gray-600 mb-6">Configure o programa de afiliados</p>
      </div>
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={product.affiliateEnabled || false}
            onChange={handleChange}
            className="rounded text-emerald-600" 
          />
          <span className="font-medium">Habilitar Programa de Afiliados</span>
        </label>
        
        {product.affiliateEnabled && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
              <input 
                type="number" 
                value={product.affiliateCommission || 30}
                onChange={(e) => setProduct({ ...product, affiliateCommission: parseInt(e.target.value) })}
                min="0" 
                max="100" 
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração do Cookie (dias)</label>
              <input type="number" defaultValue="30" className="w-32 px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
