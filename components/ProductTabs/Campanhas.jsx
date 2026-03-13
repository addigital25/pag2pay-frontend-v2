import { useState, useEffect } from 'react'
import AlertModal from '../AlertModal'

export default function Campanhas({ product, setProduct }) {
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
  const [campaigns, setCampaigns] = useState(product.campaigns || [])
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [currentCampaign, setCurrentCampaign] = useState(null)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [availablePixels, setAvailablePixels] = useState([])

  // Sincronizar campanhas quando o produto for atualizado
  useEffect(() => {
    if (product && product.campaigns) {
      setCampaigns(product.campaigns)
    }
  }, [product])

  // Buscar pixels cadastrados nas configurações
  useEffect(() => {
    fetchPixels()
  }, [])

  const fetchPixels = async () => {
    try {
      // Buscar configurações do usuário (assumindo que pixels estão em /api/settings)
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/settings')
      if (response.ok) {
        const data = await response.json()
        setAvailablePixels(data.pixels || [])
      }
    } catch (error) {
      console.error('Erro ao buscar pixels:', error)
      setAvailablePixels([])
    }
  }

  // Função para gerar código único da campanha
  const generateCampaignCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let code = 'cam'
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const getEmptyCampaign = () => ({
    name: '',
    planId: '', // ID do plano/kit selecionado
    planName: '', // Nome do plano para exibição
    pixel: '', // Pixel opcional
    code: generateCampaignCode(),
    salesCount: 0, // Quantidade de vendas
    paidSalesCount: 0 // Quantidade de vendas pagas
  })

  const handleAddCampaign = () => {
    setCurrentCampaign(getEmptyCampaign())
    setEditingCampaignId(null)
    setShowCampaignForm(true)
  }

  const handleEditCampaign = (campaign) => {
    setCurrentCampaign({ ...campaign })
    setEditingCampaignId(campaign.id)
    setShowCampaignForm(true)
  }

  const handleSaveCampaign = async () => {
    // Validação básica
    if (!currentCampaign.name || currentCampaign.name.trim() === '') {
      showAlert('Atenção', 'Por favor, preencha o nome da campanha', 'warning')
      return
    }

    if (!currentCampaign.planId) {
      showAlert('Atenção', 'Por favor, selecione um kit (plano) para a campanha', 'warning')
      return
    }

    console.log('💾 Salvando campanha...', currentCampaign)

    let newCampaigns
    let successMessage

    if (editingCampaignId) {
      // Editando campanha existente
      newCampaigns = campaigns.map(c => c.id === editingCampaignId ? {
        ...currentCampaign,
        id: editingCampaignId
      } : c)
      successMessage = '✅ Campanha atualizada com sucesso!'
    } else {
      // Nova campanha
      const newCampaign = {
        ...currentCampaign,
        id: Date.now(),
        createdAt: new Date().toISOString()
      }
      newCampaigns = [...campaigns, newCampaign]
      successMessage = `✅ Campanha "${newCampaign.name}" criada com sucesso!`
    }

    console.log('📋 Total de campanhas após salvar:', newCampaigns.length)

    // Atualizar estados locais
    setCampaigns(newCampaigns)
    const updatedProduct = { ...product, campaigns: newCampaigns }
    setProduct(updatedProduct)

    // Salvar no backend automaticamente
    try {
      console.log('🌐 Salvando no backend...')
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar no servidor')
      }

      console.log('✅ Salvo no backend com sucesso!')

      // Fechar formulário
      setShowCampaignForm(false)
      setCurrentCampaign(null)
      setEditingCampaignId(null)

      console.log('📋 Formulário fechado, mostrando lista de campanhas')

      // Mostrar mensagem de sucesso
      showAlert('Sucesso', successMessage, 'success')
    } catch (error) {
      console.error('❌ Erro ao salvar campanha:', error)

      // Mesmo com erro, fechar o formulário
      setShowCampaignForm(false)
      setCurrentCampaign(null)
      setEditingCampaignId(null)

      showAlert('Atenção', 'Campanha criada localmente, mas houve erro ao salvar no servidor.\n\nA campanha está visível na lista, mas clique em "Salvar" no final da página para garantir que seja persistida.', 'warning')
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!confirm(`Tem certeza que deseja excluir a campanha "${campaign.name}"?`)) return

    const newCampaigns = campaigns.filter(c => c.id !== campaignId)
    setCampaigns(newCampaigns)

    const updatedProduct = { ...product, campaigns: newCampaigns }
    setProduct(updatedProduct)

    // Salvar no backend
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      })
      showAlert('Sucesso', 'Campanha excluída com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao excluir campanha:', error)
      showAlert('Erro', 'Erro ao excluir campanha', 'error')
    }
  }

  const handleCancelCampaign = () => {
    setShowCampaignForm(false)
    setCurrentCampaign(null)
    setEditingCampaignId(null)
  }

  const getCampaignUrl = (campaign) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/checkout/${product.id}?plan=${campaign.planId}&campaign=${campaign.code}`
  }

  const handlePlanChange = (planId) => {
    // Converter para string e número para garantir a comparação
    const planIdStr = String(planId)
    const planIdNum = parseInt(planId, 10)

    const selectedPlan = product.plans?.find(p =>
      String(p.id) === planIdStr || p.id === planIdNum || p.code === planIdStr
    )

    if (selectedPlan) {
      setCurrentCampaign({
        ...currentCampaign,
        planId: selectedPlan.id || selectedPlan.code,
        planName: selectedPlan.name
      })
    } else if (planId) {
      // Se não encontrou o plano mas tem um ID, salvar mesmo assim
      setCurrentCampaign({
        ...currentCampaign,
        planId: planId
      })
    }
  }

  // Se estiver no formulário, mostrar apenas ele
  if (showCampaignForm && currentCampaign) {
    return (
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelCampaign}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold">
                {editingCampaignId ? 'Editar Campanha' : 'Nova Campanha'}
              </h2>
              <p className="text-sm text-gray-600">Configure sua campanha de marketing</p>
            </div>
          </div>
          <button
            onClick={handleSaveCampaign}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {editingCampaignId ? 'Atualizar Campanha' : 'Salvar Campanha'}
          </button>
        </div>

        {/* Formulário */}
        <div className="max-w-2xl space-y-6">
          {/* Nome da Campanha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da Campanha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentCampaign.name}
              onChange={(e) => setCurrentCampaign({ ...currentCampaign, name: e.target.value })}
              placeholder="Ex: Black Friday 2024, Lançamento Verão"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome identificador da campanha para controle interno
            </p>
          </div>

          {/* Seleção do Kit (Plano) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kit Correspondente <span className="text-red-500">*</span>
            </label>
            {(!product.plans || product.plans.length === 0) ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Nenhum plano/kit cadastrado. Por favor, crie um plano primeiro na aba "Planos".
                </p>
              </div>
            ) : (
              <select
                value={currentCampaign.planId || ''}
                onChange={(e) => {
                  console.log('Kit/Plano selecionado:', e.target.value)
                  handlePlanChange(e.target.value)
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="">Selecione um kit (plano)</option>
                {product.plans.map((plan) => (
                  <option key={plan.id || plan.code} value={plan.id || plan.code}>
                    {plan.name} - R$ {parseFloat(plan.price || 0).toFixed(2).replace('.', ',')}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Escolha qual plano/kit será vendido através desta campanha
            </p>
          </div>

          {/* Pixel Opcional */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pixel de Rastreamento <span className="text-gray-400">(Opcional)</span>
            </label>
            {availablePixels.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Nenhum pixel cadastrado. Você pode criar pixels em <strong>Configurações → Pixels</strong>
                </p>
              </div>
            ) : (
              <select
                value={currentCampaign.pixel || ''}
                onChange={(e) => {
                  console.log('Pixel selecionado:', e.target.value)
                  setCurrentCampaign({ ...currentCampaign, pixel: e.target.value })
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="">Nenhum pixel selecionado</option>
                {availablePixels.map((pixel, index) => (
                  <option key={pixel.id || pixel.name || index} value={pixel.id || pixel.code || pixel.name}>
                    {pixel.name || pixel.code} {pixel.type ? `- ${pixel.type}` : ''}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Selecione um pixel para acompanhar conversões desta campanha
            </p>
          </div>

          {/* Código da Campanha (somente leitura) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código da Campanha
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentCampaign.code}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-mono text-sm cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentCampaign.code)
                  showAlert('Sucesso', 'Código copiado!', 'success')
                }}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                title="Copiar código"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Código único gerado automaticamente para identificar esta campanha
            </p>
          </div>

          {/* URL da Campanha (Preview) */}
          {currentCampaign.planId && (
            <div className="border-t pt-6">
              <h4 className="font-bold text-lg mb-1 text-gray-900">🔗 URL da Campanha</h4>
              <p className="text-sm text-gray-600 mb-4">Este link será criado após salvar a campanha</p>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">URL de Checkout:</p>
                    <p className="text-sm text-indigo-900 font-mono truncate">
                      {getCampaignUrl(currentCampaign)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getCampaignUrl(currentCampaign))
                      showAlert('Sucesso', 'Link copiado para área de transferência!', 'success')
                    }}
                    className="flex-shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Lista de campanhas
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Campanhas de Marketing</h2>
          <p className="text-gray-600">
            Crie e gerencie campanhas com URLs exclusivas para rastreamento
          </p>
        </div>

        <button
          onClick={handleAddCampaign}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Criar Campanha
        </button>
      </div>

      {/* Lista de Campanhas */}
      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma campanha cadastrada</h3>
          <p className="text-sm text-gray-500 mb-4">Comece criando sua primeira campanha de marketing</p>
          <button
            onClick={handleAddCampaign}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Criar Primeira Campanha
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Cód.
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Nome
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Quant. Vendas
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Quant. Vendas Pagas
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-700">
                        {campaign.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-500">{campaign.planName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {campaign.salesCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {campaign.paidSalesCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-0">
                        {/* Botão Editar */}
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition rounded-l-lg"
                          title="Editar campanha"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Botão Copiar Link */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getCampaignUrl(campaign))
                            showAlert('Sucesso', 'Link da campanha copiado!', 'success')
                          }}
                          className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 transition"
                          title="Copiar link da campanha"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-2.5 bg-red-600 text-white hover:bg-red-700 transition rounded-r-lg"
                          title="Excluir campanha"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
