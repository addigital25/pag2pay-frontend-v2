import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import config from '../../config'

export default function PlatformFees() {
  const [activeTab, setActiveTab] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // ✅ NOVO: Seletor de adquirente
  const [selectedAcquirer, setSelectedAcquirer] = useState('Pagar.me')

  // ✅ NOVO: Configurações Financeiras
  const [invoicePrefix, setInvoicePrefix] = useState('')
  const [prefixError, setPrefixError] = useState('')

  // Lista de adquirentes disponíveis
  const acquirers = ['Pagar.me', 'Mercado Pago', 'Asaas', 'Stripe', 'PagSeguro', 'Cielo']

  // Estados para cada tipo de taxa
  const [pixFees, setPixFees] = useState({
    fixedFee: 1.00,
    variableFee: 4.99,
    minimumFee: 0,
    releaseDays: 0,
    retentionDays: 0,
    retentionPercentage: 0,
    hideMinimumFee: false
  })

  const [boletoFees, setBoletoFees] = useState({
    fixedFee: 1.00,
    variableFee: 4.99,
    releaseDays: 2,
    retentionDays: 2,
    retentionPercentage: 0
  })

  const [cardFees, setCardFees] = useState({
    installmentFee: 3.49,
    cashFixedFee: 1.00,
    cashVariableFee: 4.99,
    installment6FixedFee: 1.00,
    installment6VariableFee: 4.99,
    installment12FixedFee: 1.00,
    installment12VariableFee: 4.99,
    releaseDays: 14,
    retentionDays: 2,
    retentionPercentage: 0,
    chargebackFee: 0
  })

  const [saqueFees, setSaqueFees] = useState({
    fixedFee: 3.67,
    variableFee: 0,
    minimumFee: 0
  })

  const [antecipacaoFees, setAntecipacaoFees] = useState({
    minimumAnticipation: 'D+2',
    d2Fee: 0,
    d14Fee: 0,
    calculateByDays: false
  })

  // ✅ Buscar taxas quando trocar de adquirente
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/platform-fees/${selectedAcquirer}`)
        if (response.ok) {
          const data = await response.json()
          if (data.pix) setPixFees(data.pix)
          if (data.boleto) setBoletoFees(data.boleto)
          if (data.card) setCardFees(data.card)
          if (data.saque) setSaqueFees(data.saque)
          if (data.antecipacao) setAntecipacaoFees(data.antecipacao)
        }
      } catch (error) {
        console.error('Erro ao carregar taxas:', error)
      }
    }

    fetchFees()
  }, [selectedAcquirer])

  // ✅ Buscar prefixo da fatura salvo
  useEffect(() => {
    const fetchInvoicePrefix = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/platform/settings/financial`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.financial?.invoicePrefix) {
            setInvoicePrefix(data.financial.invoicePrefix)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar prefixo da fatura:', error)
      }
    }

    fetchInvoicePrefix()
  }, [])

  // ✅ Salvar taxas com adquirente selecionada
  const saveFees = async (type, data) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/platform-fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acquirer: selectedAcquirer,
          type,
          data
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Erro ao salvar taxas:', error)
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'pix', label: 'Pix' },
    { id: 'boleto', label: 'Boleto' },
    { id: 'cartao', label: 'Cartão' },
    { id: 'saque', label: 'Saque' },
    { id: 'antecipacao', label: 'Antecipação' },
    { id: 'configuracoes', label: 'Configurações' }
  ]

  return (
    <PlatformLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* ✅ NOVO: Seletor de Adquirente */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Adquirente
          </label>
          <select
            value={selectedAcquirer}
            onChange={(e) => setSelectedAcquirer(e.target.value)}
            className="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900"
          >
            {acquirers.map(acquirer => (
              <option key={acquirer} value={acquirer}>
                {acquirer}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-2">
            Configure as taxas específicas para <span className="font-semibold text-emerald-600">{selectedAcquirer}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* PIX Tab */}
        {activeTab === 'pix' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alterar taxas de Pix</h2>
            <p className="text-gray-600 mb-8">
              Esses valores serão aplicados para todos os produtores que não tem uma taxa específica
              (você pode alterar a taxa específica no perfil do produtor).
            </p>

            {/* Taxa de operação */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de operação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa fixa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={pixFees.fixedFee}
                      onChange={(e) => setPixFees({ ...pixFees, fixedFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor fixo cobrado por transação.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={pixFees.variableFee}
                      onChange={(e) => setPixFees({ ...pixFees, variableFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor variável cobrado por transação. Essa taxa é calculada em cima do valor total da transação.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa mínima
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={pixFees.minimumFee}
                      onChange={(e) => setPixFees({ ...pixFees, minimumFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor mínimo da taxa cobrada por transação.</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pixFees.hideMinimumFee}
                    onChange={(e) => setPixFees({ ...pixFees, hideMinimumFee: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Ocultar taxa mínima de Pix para produtores</span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Se ativo, a taxa mínima será oculta no painel de taxas de todos os produtores.
                </p>
              </div>
            </div>

            {/* Liberação e Retenção */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liberação e Retenção</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de dias para liberação de venda <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">D+</span>
                    <input
                      type="number"
                      value={pixFees.releaseDays}
                      onChange={(e) => setPixFees({ ...pixFees, releaseDays: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Quantidade de dias que a venda ficará pendente.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de dias para retenção <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">D+</span>
                    <input
                      type="number"
                      value={pixFees.retentionDays}
                      onChange={(e) => setPixFees({ ...pixFees, retentionDays: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Quantidade de dias que o valor ficará retido.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentagem de retenção <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={pixFees.retentionPercentage}
                      onChange={(e) => setPixFees({ ...pixFees, retentionPercentage: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => saveFees('pix', pixFees)}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </div>
        )}

        {/* Boleto Tab */}
        {activeTab === 'boleto' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alterar taxas de Boleto</h2>
            <p className="text-gray-600 mb-8">
              Esses valores serão aplicados todos os produtores que não tem uma taxa específica
              (você pode alterar a taxa específica no perfil do produtor).
            </p>

            {/* Taxa de operação */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de operação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa fixa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={boletoFees.fixedFee}
                      onChange={(e) => setBoletoFees({ ...boletoFees, fixedFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor fixo cobrado por transação.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={boletoFees.variableFee}
                      onChange={(e) => setBoletoFees({ ...boletoFees, variableFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor variável cobrado por transação. Essa taxa é calculada em cima do valor total da transação.
                  </p>
                </div>
              </div>
            </div>

            {/* Liberação e Retenção */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liberação e Retenção</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de dias para liberação de venda <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">D+</span>
                    <input
                      type="number"
                      value={boletoFees.releaseDays}
                      onChange={(e) => setBoletoFees({ ...boletoFees, releaseDays: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Quantidade de dias que a venda ficará pendente</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de dias para retenção <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">D+</span>
                    <input
                      type="number"
                      value={boletoFees.retentionDays}
                      onChange={(e) => setBoletoFees({ ...boletoFees, retentionDays: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Quantidade de dias que o valor ficará retido.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentagem de retenção <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={boletoFees.retentionPercentage}
                      onChange={(e) => setBoletoFees({ ...boletoFees, retentionPercentage: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => saveFees('boleto', boletoFees)}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </div>
        )}

        {/* Cartão Tab */}
        {activeTab === 'cartao' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alterar taxas de Cartão</h2>
            <p className="text-gray-600 mb-8">
              Esses valores serão aplicados todos os produtores que não tem uma taxa específica
              (você pode alterar a taxa específica no perfil do produtor).
            </p>

            {/* Taxa de parcelamento paga pelo cliente */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de parcelamento paga pelo cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.installmentFee}
                      onChange={(e) => setCardFees({ ...cardFees, installmentFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Essa é a taxa de parcelamento repassada para o cliente (Essa taxa é a.m, ou seja, calculada por parcela)
                  </p>
                </div>
                <div className="flex items-center">
                  <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
                    Calculadora de taxas de parcelamento →
                  </button>
                </div>
              </div>
            </div>

            {/* À vista */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">À vista</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa fixa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.cashFixedFee}
                      onChange={(e) => setCardFees({ ...cardFees, cashFixedFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor fixo cobrado por transação.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.cashVariableFee}
                      onChange={(e) => setCardFees({ ...cardFees, cashVariableFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor variável cobrado por transação. Essa taxa é calculada em cima do valor total da transação.
                  </p>
                </div>
              </div>
            </div>

            {/* Parcelado até 6x */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parcelado até 6x</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa fixa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.installment6FixedFee}
                      onChange={(e) => setCardFees({ ...cardFees, installment6FixedFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor fixo cobrado por transação.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.installment6VariableFee}
                      onChange={(e) => setCardFees({ ...cardFees, installment6VariableFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor variável cobrado por transação. Essa taxa é calculada em cima do valor total da transação.
                  </p>
                </div>
              </div>
            </div>

            {/* Parcelado até 12x */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parcelado até 12x</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa fixa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.installment12FixedFee}
                      onChange={(e) => setCardFees({ ...cardFees, installment12FixedFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor fixo cobrado por transação.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.installment12VariableFee}
                      onChange={(e) => setCardFees({ ...cardFees, installment12VariableFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor variável cobrado por transação. Essa taxa é calculada em cima do valor total da transação.
                  </p>
                </div>
              </div>
            </div>

            {/* Liberação das vendas */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liberação das vendas</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de dias para liberação de venda <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cardFees.releaseDays}
                    onChange={(e) => setCardFees({ ...cardFees, releaseDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="14">14 dias</option>
                    <option value="30">30 dias</option>
                    <option value="60">60 dias</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Para mais informações, veja a aba de antecipação. Ou fale com o nosso suporte.
                  </p>
                </div>
              </div>
            </div>

            {/* Retenção (Reserva de emergência) */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Retenção (Reserva de emergência)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de dias para retenção <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">D+</span>
                    <input
                      type="number"
                      value={cardFees.retentionDays}
                      onChange={(e) => setCardFees({ ...cardFees, retentionDays: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Quantidade de dias que o valor ficará retido.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentagem de retenção <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.retentionPercentage}
                      onChange={(e) => setCardFees({ ...cardFees, retentionPercentage: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multa por chargeback */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Multa por chargeback</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da multa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cardFees.chargebackFee}
                      onChange={(e) => setCardFees({ ...cardFees, chargebackFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor fixo cobrado ao produtor, quando acontece um chargeback na transação
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => saveFees('card', cardFees)}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </div>
        )}

        {/* Saque Tab */}
        {activeTab === 'saque' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alterar taxas de Saque</h2>
            <p className="text-gray-600 mb-8">
              Esses valores serão aplicados todos os produtores que não tem uma taxa específica
              (você pode alterar a taxa específica no perfil do produtor).
            </p>

            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa fixa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={saqueFees.fixedFee}
                      onChange={(e) => setSaqueFees({ ...saqueFees, fixedFee: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor fixo cobrado por transação.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa variável <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={saqueFees.variableFee}
                      onChange={(e) => setSaqueFees({ ...saqueFees, variableFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor variável cobrado por transação. Essa taxa é calculada em cima do valor total da transação.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa mínima de saque <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={saqueFees.minimumFee}
                      onChange={(e) => setSaqueFees({ ...saqueFees, minimumFee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor mínimo cobrado por saque.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => saveFees('saque', saqueFees)}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </div>
        )}

        {/* Antecipação Tab */}
        {activeTab === 'antecipacao' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alterar taxas de Antecipação</h2>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                As taxas de antecipação são aplicadas sobre o valor total da transação e são cobradas no momento da venda.
              </p>
              <p className="text-gray-700 mb-3">
                Caso você use alguma adquirente que seja bolsão, é necessário que você tenha liberado na sua conta master
                nessa adquirente o mínimo possível de antecipação, para que a antecipação seja feita corretamente.
              </p>
            </div>

            {/* Alertas */}
            <div className="mb-6 space-y-3">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">
                  No campo de 'Antecipação mínima' você precisa colocar o maior valor de antecipação que você conseguiu
                  entre as adquirentes. Exemplo: Se você conseguiu com a PagarMe uma antecipação D+2, mas com a Efí você
                  conseguiu apenas D+14, você deve colocar D+14 no campo de 'Antecipação mínima'.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-700">
                  Caso você use PagarMe, e a antecipação seja D+15 invés de D+14, não se preocupe, pois o sistema irá
                  antecipar corretamente para D+15, mesmo você tendo colocado D+14 no campo de 'Antecipação mínima'.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antecipação mínima <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={antecipacaoFees.minimumAnticipation}
                    onChange={(e) => setAntecipacaoFees({ ...antecipacaoFees, minimumAnticipation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="D+2">D+2</option>
                    <option value="D+14">D+14</option>
                    <option value="D+30">D+30</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecione a antecipação mínima para os produtores utilizarem.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antecipação D+2 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={antecipacaoFees.d2Fee}
                      onChange={(e) => setAntecipacaoFees({ ...antecipacaoFees, d2Fee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor cobrado para a antecipação de valores em 2 dias</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antecipação D+14 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={antecipacaoFees.d14Fee}
                      onChange={(e) => setAntecipacaoFees({ ...antecipacaoFees, d14Fee: parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Valor cobrado para a antecipação de valores em 14 dias</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antecipacaoFees.calculateByDays}
                  onChange={(e) => setAntecipacaoFees({ ...antecipacaoFees, calculateByDays: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Calcular por dias antecipados</span>
              </label>
            </div>

            <button
              onClick={() => saveFees('antecipacao', antecipacaoFees)}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </div>
        )}

        {/* Configurações Tab */}
        {activeTab === 'configuracoes' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações Financeiras</h2>
            <p className="text-gray-600 mb-8">Configure opções gerais relacionadas a pagamentos e faturas</p>

            {/* Prefixo da fatura */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Prefixo da fatura</h3>
              <p className="text-gray-600 mb-4">
                O prefixo que aparecerá na fatura do cliente
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium">
                  Insira o prefixo que aparecerá na fatura do cliente (o prefixo deve ter entre 5 e 9 caracteres).
                  Essa configuração não poderá ser alterada.
                </p>
              </div>

              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefixo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    setInvoicePrefix(value)

                    // Validação
                    if (value.length > 0 && (value.length < 5 || value.length > 9)) {
                      setPrefixError('O prefixo deve ter entre 5 e 9 caracteres')
                    } else {
                      setPrefixError('')
                    }
                  }}
                  maxLength={9}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-lg ${
                    prefixError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: PAG2PAY"
                />

                {prefixError && (
                  <p className="text-sm text-red-600 mt-2">⚠️ {prefixError}</p>
                )}

                {invoicePrefix && !prefixError && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Prefixo válido ({invoicePrefix.length} caracteres)
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Exemplo de fatura: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {invoicePrefix || 'PREFIXO'}-12345
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                if (prefixError || !invoicePrefix || invoicePrefix.length < 5) {
                  setPrefixError('O prefixo deve ter entre 5 e 9 caracteres')
                  return
                }

                setLoading(true)
                try {
                  const response = await fetch(`${config.apiUrl}/api/platform/settings/financial`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ invoicePrefix })
                  })

                  if (response.ok) {
                    setSaved(true)
                    setTimeout(() => setSaved(false), 3000)
                    alert('✓ Configurações salvas com sucesso!')
                  } else {
                    throw new Error('Erro ao salvar')
                  }
                } catch (error) {
                  alert('✗ Erro ao salvar configurações. Tente novamente.')
                }
                setLoading(false)
              }}
              disabled={loading || !!prefixError || !invoicePrefix}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        )}
      </div>
    </PlatformLayout>
  )
}
