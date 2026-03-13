import { useState, useEffect } from 'react'

export default function Comissao({ product, setProduct }) {
  const [affiliateConfig, setAffiliateConfig] = useState({
    commissionType: 'Último Clique',
    commissionMode: 'percentage',
    commissionValue: 55,
    cookieDuration: 'Eterno'
  })

  // Sincronizar com o produto quando ele carregar
  useEffect(() => {
    if (product && product.affiliateConfig) {
      setAffiliateConfig({
        ...product.affiliateConfig,
        cookieDuration: 'Eterno' // Sempre forçar como Eterno
      })
    }
  }, [product])

  const handleChange = (field, value) => {
    const updated = {
      ...affiliateConfig,
      [field]: value
    }
    setAffiliateConfig(updated)
    if (setProduct) {
      setProduct({ ...product, affiliateConfig: updated })
    }
  }

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Comissionamento</h2>
        <p className="text-sm text-gray-600">Configure o tipo e valor de comissão para afiliados deste produto</p>
      </div>

      {/* Configurações de Comissionamento */}
      <div className="space-y-6">
        {/* Tipo de comissionamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de comissionamento
          </label>
          <input
            type="text"
            value={affiliateConfig.commissionType}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Padrão: Último Clique</p>
        </div>

        {/* Tipo de comissão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de comissão
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="commissionMode"
                value="percentage"
                checked={affiliateConfig.commissionMode === 'percentage'}
                onChange={(e) => handleChange('commissionMode', e.target.value)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Porcentagem</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="commissionMode"
                value="fixed"
                checked={affiliateConfig.commissionMode === 'fixed'}
                onChange={(e) => handleChange('commissionMode', e.target.value)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Valor fixo</span>
            </label>
          </div>
        </div>

        {/* Valor da comissão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor da Comissão
          </label>
          <div className="relative">
            <input
              type="text"
              value={
                affiliateConfig.commissionMode === 'percentage'
                  ? `${affiliateConfig.commissionValue}%`
                  : `R$ ${parseFloat(affiliateConfig.commissionValue || 0).toFixed(2).replace('.', ',')}`
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.')
                let numValue = parseFloat(value) || 0

                // Validação: se for porcentagem, limitar a 100%
                if (affiliateConfig.commissionMode === 'percentage' && numValue > 100) {
                  numValue = 55
                }

                handleChange('commissionValue', numValue)
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {affiliateConfig.commissionMode === 'percentage'
              ? 'Porcentagem de comissão sobre o valor do produto (máximo 100%)'
              : 'Valor fixo de comissão por venda'}
          </p>
        </div>

        {/* Tempo de duração de cookie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempo de duração de cookie
          </label>
          <input
            type="text"
            value="Eterno"
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed font-semibold"
          />
          <p className="text-xs text-gray-500 mt-1">
            O cookie do afiliado permanece válido eternamente, garantindo 100% de rastreamento
          </p>
        </div>
      </div>
    </div>
  )
}
