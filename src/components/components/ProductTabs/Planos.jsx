import { useState, useEffect } from 'react'
import AlertModal from '../AlertModal'

export default function Planos({ product, setProduct, setActiveTab }) {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Sim',
    cancelText: 'Não'
  })

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false })
  }

  const showConfirm = (title, message, onConfirm, confirmText = 'Sim', cancelText = 'Não') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    })
  }

  const closeConfirm = () => {
    setConfirmModal({ ...confirmModal, isOpen: false, onConfirm: null })
  }

  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm()
    }
    closeConfirm()
  }
  const [plans, setPlans] = useState(product.plans || [])
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [activePlanTab, setActivePlanTab] = useState('loja')
  const [currentPlan, setCurrentPlan] = useState(null)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [priceInput, setPriceInput] = useState('')
  const [isPriceEditing, setIsPriceEditing] = useState(false)
  const [uploadingHeaderImage, setUploadingHeaderImage] = useState(false)
  const [uploadingSideImage, setUploadingSideImage] = useState(false)
  const [supplierValidation, setSupplierValidation] = useState(null)

  // Sincronizar planos quando o produto for atualizado
  useEffect(() => {
    if (product && product.plans) {
      setPlans(product.plans)
    }
  }, [product])

  const planTabs = [
    { id: 'loja', icon: '🛒', name: 'Informações' },
    { id: 'condicoes', icon: '💳', name: 'Pagamentos' },
    { id: 'afiliacao', icon: '👥', name: 'Afiliação' },
    { id: 'termos', icon: '📋', name: 'Termos e Condições' }
  ]

  const getEmptyPlan = () => ({
    name: '',
    price: 0,
    description: '',
    itemsQuantity: 1,
    installments: 12,
    isAvailableForSale: true,
    hideFromAffiliates: false,
    requireEmail: true,
    checkoutEmail: '',
    headerImage: '',
    sideImage: '',
    status: 'ATIVO',
    approvedSales: 0,
    supplier: {
      email: '',
      value: ''
    },
    paymentMethods: {
      creditCard: true,
      boleto: true,
      pix: true,
      afterPay: false
    },
    maxInstallments: 12,
    maxInstallmentsNoInterest: 1,
    chargeType: 'unica',
    freeShipping: true,
    shippingPrice: 0,
    useCounter: false,
    counterMinutes: 15,
    shipping: {
      name: '',
      deliveryTime: '',
      fixedPrice: ''
    },
    affiliation: {
      enabled: true,
      commission: 30,
      customCommission: false,
      customCommissionValue: 30,
      commissionType: 'percentage',
      allowedAffiliates: []
    },
    terms: []
  })

  const handleAddPlan = () => {
    setCurrentPlan(getEmptyPlan())
    setEditingPlanId(null)
    setActivePlanTab('loja')
    setShowPlanForm(true)
    setPriceInput('')
    setIsPriceEditing(false)
  }

  const handleImageUpload = async (file, imageType) => {
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showAlert('Atenção', 'Por favor, envie uma imagem válida (JPG, PNG, GIF ou WebP)', 'warning')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Atenção', 'A imagem deve ter no máximo 5MB', 'warning')
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      if (imageType === 'header') {
        setUploadingHeaderImage(true)
      } else {
        setUploadingSideImage(true)
      }

      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem')
      }

      const data = await response.json()

      // Atualizar o plano com a URL da imagem
      if (imageType === 'header') {
        setCurrentPlan({ ...currentPlan, headerImage: data.url })
      } else {
        setCurrentPlan({ ...currentPlan, sideImage: data.url })
      }

      showAlert('Sucesso', 'Imagem carregada com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      showAlert('Erro', 'Erro ao fazer upload da imagem. Tente novamente.', 'error')
    } finally {
      if (imageType === 'header') {
        setUploadingHeaderImage(false)
      } else {
        setUploadingSideImage(false)
      }
    }
  }

  const handleSupplierEmailBlur = async () => {
    const email = currentPlan.supplier?.email

    if (!email) {
      // Campo vazio = sem fornecedor (OK)
      setSupplierValidation(null)
      return
    }

    try {
      const res = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/suppliers/validate?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.valid) {
        setSupplierValidation({
          status: 'valid',
          message: `✅ Fornecedor validado: ${data.supplier.name} (Documentos aprovados, Conta ativa)`,
          recipientId: data.supplier.recipientId,
          name: data.supplier.name
        })
      } else {
        setSupplierValidation({
          status: 'invalid',
          message: `❌ Fornecedor não pode receber split: ${data.error}`,
          recipientId: null
        })
      }
    } catch (error) {
      console.error('Erro ao validar fornecedor:', error)
      setSupplierValidation({
        status: 'error',
        message: '⚠️ Erro ao validar fornecedor',
        recipientId: null
      })
    }
  }

  const handleEditPlan = (plan) => {
    setCurrentPlan({ ...plan })
    setEditingPlanId(plan.id)
    setActivePlanTab('loja')
    setShowPlanForm(true)
    setPriceInput('')
    setIsPriceEditing(false)
  }

  const formatPriceToBRL = (value) => {
    const num = parseFloat(value) || 0
    return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  const handlePriceChange = (e) => {
    const value = e.target.value
    // Remover tudo exceto números e vírgula
    const cleaned = value.replace(/[^\d,]/g, '')
    setPriceInput(cleaned)
  }

  const handlePriceFocus = () => {
    setIsPriceEditing(true)
    // Ao focar, mostrar apenas o número sem formatação
    if (currentPlan.price > 0) {
      setPriceInput(currentPlan.price.toFixed(2).replace('.', ','))
    } else {
      setPriceInput('')
    }
  }

  const handlePriceBlur = () => {
    setIsPriceEditing(false)
    // Ao sair do campo, converter para número e atualizar
    const value = priceInput.replace(',', '.')
    const numValue = parseFloat(value) || 0
    setCurrentPlan({ ...currentPlan, price: numValue })
    setPriceInput('')
  }

  const handleCancelPlan = () => {
    setShowPlanForm(false)
    setCurrentPlan(null)
    setEditingPlanId(null)
  }

  const handleSavePlan = async () => {
    // Validação básica
    if (!currentPlan.name || !currentPlan.price || currentPlan.price === 0) {
      showAlert('Atenção', 'Por favor, preencha os campos obrigatórios (Nome e Preço)', 'warning')
      return
    }

    console.log('💾 Salvando plano...', currentPlan)

    // Preparar supplierData com base na validação
    const supplierData = supplierValidation?.status === 'valid' ? {
      email: currentPlan.supplier.email,
      value: parseFloat(currentPlan.supplier.value) || 0,
      recipientId: supplierValidation.recipientId,
      name: supplierValidation.name,
      documentsApproved: true,
      splitAccountActive: true
    } : null

    let newPlans
    let successMessage
    if (editingPlanId) {
      // Editando plano existente - manter o código existente
      newPlans = plans.map(p => p.id === editingPlanId ? {
        ...currentPlan,
        id: editingPlanId,
        code: p.code || `pla${Math.random().toString(36).substr(2, 5)}`, // Manter código existente ou gerar novo
        supplierData: supplierData
      } : p)
      successMessage = '✅ Plano atualizado com sucesso!'
      console.log('✏️ Plano editado:', currentPlan)
    } else {
      // Novo plano - gerar código único
      const planCode = `pla${Math.random().toString(36).substr(2, 5)}`
      const newPlan = {
        ...currentPlan,
        id: Date.now(),
        code: planCode,
        status: 'ATIVO',
        approvedSales: 0,
        supplierData: supplierData
      }
      newPlans = [...plans, newPlan]
      successMessage = `✅ Plano criado com sucesso!\n\n📋 Código: ${planCode}\n💰 Valor: R$ ${newPlan.price.toFixed(2).replace('.', ',')}`
      console.log('✅ Novo plano criado:', newPlan)
    }

    console.log('📋 Total de planos após salvar:', newPlans.length)
    console.log('📊 Todos os planos:', newPlans)

    // Atualizar estados locais
    setPlans(newPlans)
    const updatedProduct = { ...product, plans: newPlans }
    setProduct(updatedProduct)

    console.log('🔄 Estados atualizados')

    // Salvar no backend automaticamente
    try {
      console.log('🌐 Salvando plano no backend...')
      console.log('📦 Produto atual:', product)
      console.log('📊 Novos planos a serem salvos:', newPlans)

      console.log('📤 Enviando para o backend:', {
        id: updatedProduct.id,
        planosCount: updatedProduct.plans?.length,
        planos: updatedProduct.plans
      })

      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar no servidor')
      }

      const savedProduct = await response.json()
      console.log('✅ Plano salvo no backend com sucesso!', savedProduct)

      // Atualizar estados locais COM OS DADOS DO SERVIDOR
      const savedPlans = savedProduct.plans || newPlans
      console.log('📋 Planos salvos:', savedPlans)

      setPlans(savedPlans)
      setProduct(savedProduct)

      // Fechar formulário e resetar estado
      setShowPlanForm(false)
      setCurrentPlan(null)
      setEditingPlanId(null)

      console.log('✅ Formulário fechado, mostrando tabela de planos')
      console.log('✅ Estado showPlanForm:', false)
      console.log('✅ Total de planos na tabela:', savedPlans.length)

      // Mostrar mensagem de sucesso DEPOIS de fechar o formulário
      setTimeout(() => {
        showAlert('Sucesso', successMessage, 'success')
      }, 100)
    } catch (error) {
      console.error('❌ Erro ao salvar plano:', error)
      showAlert('Erro', 'Erro ao salvar plano. Por favor, tente novamente.', 'error')
    }
  }

  const handleDeletePlan = (planId, planName) => {
    showConfirm(
      'Excluir Plano',
      `Tem certeza que deseja excluir o plano "${planName}"? Esta ação não pode ser desfeita.`,
      () => {
        const newPlans = plans.filter(p => p.id !== planId)
        setPlans(newPlans)
        setProduct({ ...product, plans: newPlans })
        showAlert('Sucesso', 'Plano excluído com sucesso!', 'success')
      }
    )
  }

  const handleDuplicatePlan = (plan) => {
    showConfirm(
      'Duplicar Plano',
      `Deseja criar uma cópia do plano "${plan.name}"?`,
      () => {
        const planCode = `pla${Math.random().toString(36).substr(2, 5)}`
        const duplicated = {
          ...plan,
          id: Date.now(),
          code: planCode,
          name: `${plan.name} (Cópia)`,
          approvedSales: 0
        }
        const newPlans = [...plans, duplicated]
        setPlans(newPlans)
        setProduct({ ...product, plans: newPlans })
        showAlert('Sucesso', 'Plano duplicado com sucesso!', 'success')
      }
    )
  }

  const getPlanLink = (plan) => {
    // Gerar link do plano para checkout
    const baseUrl = window.location.origin
    return `${baseUrl}/checkout/${product.id}?plan=${plan.code}&planName=${encodeURIComponent(plan.name)}`
  }

  const copyPlanLink = (plan) => {
    const link = getPlanLink(plan)
    navigator.clipboard.writeText(link)
    showAlert('Sucesso', 'Link do plano copiado!', 'success')
  }

  // Se estiver no formulário de criação/edição, mostrar apenas ele
  if (showPlanForm && currentPlan) {
    return (
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelPlan}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold">
                {editingPlanId ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <p className="text-sm text-gray-600">Configure todas as opções do plano</p>
            </div>
          </div>
          <button
            onClick={handleSavePlan}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {editingPlanId ? 'Atualizar Plano' : 'Salvar Plano'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto">
            {planTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePlanTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition border-b-2 ${
                  activePlanTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activePlanTab === 'loja' && (
            <div className="space-y-8">
              {/* Informações Básicas */}
              <div>
                <h4 className="font-bold text-lg mb-1 text-gray-900">Informações Básicas</h4>
                <p className="text-sm text-gray-600 mb-4">Configure os dados principais do plano</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome do Plano <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentPlan.name}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                      placeholder="Ex: Plano Básico, Premium, VIP..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preço <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={isPriceEditing ? priceInput : formatPriceToBRL(currentPlan.price)}
                      onChange={handlePriceChange}
                      onFocus={handlePriceFocus}
                      onBlur={handlePriceBlur}
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite o valor (ex: 100,00 ou 1500,50)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantidade de itens por plano
                    </label>
                    <input
                      type="text"
                      value={currentPlan.itemsQuantity || ''}
                      onChange={(e) => {
                        // Permite apenas números durante a digitação
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        setCurrentPlan({ ...currentPlan, itemsQuantity: value })
                      }}
                      onBlur={(e) => {
                        // Formata ao sair do campo - garante pelo menos 1
                        const numValue = parseInt(e.target.value) || 1
                        setCurrentPlan({ ...currentPlan, itemsQuantity: numValue })
                      }}
                      placeholder="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

              </div>

              {/* Disponibilidade e Configurações */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Disponibilidade</h4>

                <div className="space-y-4">
                  {/* Disponível para venda */}
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Disponível para venda?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPlan.isAvailableForSale !== false}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, isAvailableForSale: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Ocultar para afiliados */}
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Ocultar plano para afiliados?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPlan.hideFromAffiliates || false}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, hideFromAffiliates: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Exigir e-mail */}
                  <div>
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Exigir e-mail na compra?</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentPlan.requireEmail !== false}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, requireEmail: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    {currentPlan.requireEmail !== false && (
                      <div className="mt-2 ml-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">📧 Checkout:</span> Aparecerá um checkbox embaixo do campo de e-mail com a opção "Não possuo e-mail" para clientes que não tiverem.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Split com Fornecedor */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Split com Fornecedor</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-mail do Fornecedor
                    </label>
                    <input
                      type="email"
                      value={currentPlan.supplier?.email || ''}
                      onChange={(e) => {
                        setCurrentPlan({
                          ...currentPlan,
                          supplier: { ...currentPlan.supplier, email: e.target.value }
                        })
                        // Limpar validação ao digitar
                        setSupplierValidation(null)
                      }}
                      onBlur={handleSupplierEmailBlur}
                      placeholder="fornecedor@exemplo.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    {supplierValidation && (
                      <p className={`text-sm mt-1 ${
                        supplierValidation.status === 'valid' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {supplierValidation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor para o Fornecedor (R$)
                    </label>
                    <input
                      type="number"
                      value={currentPlan.supplier?.value || ''}
                      onChange={(e) => setCurrentPlan({
                        ...currentPlan,
                        supplier: { ...currentPlan.supplier, value: e.target.value }
                      })}
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      disabled={supplierValidation?.status !== 'valid'}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Valor que será enviado automaticamente para o fornecedor pela plataforma</p>
              </div>

              {/* Frete */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Frete</h4>

                <div className="space-y-4">
                  {/* Frete Grátis Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Frete Grátis?</p>
                      <p className="text-xs text-gray-500 mt-1">Ative para oferecer frete gratuito aos clientes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPlan.freeShipping !== false}
                        onChange={(e) => setCurrentPlan({
                          ...currentPlan,
                          freeShipping: e.target.checked,
                          shippingPrice: e.target.checked ? 0 : (currentPlan.shippingPrice || 0)
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Campo de Valor do Frete - Aparece quando Frete Grátis está DESATIVADO */}
                  {currentPlan.freeShipping === false && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valor do Frete (R$)
                      </label>
                      <input
                        type="text"
                        value={currentPlan.shippingPriceInput || (currentPlan.shippingPrice ? `R$ ${parseFloat(currentPlan.shippingPrice).toFixed(2).replace('.', ',')}` : '')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.')
                          setCurrentPlan({
                            ...currentPlan,
                            shippingPriceInput: value,
                            shippingPrice: parseFloat(value) || 0
                          })
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(currentPlan.shippingPrice) || 0
                          setCurrentPlan({
                            ...currentPlan,
                            shippingPriceInput: undefined,
                            shippingPrice: value
                          })
                        }}
                        placeholder="Ex: 15,00"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Digite apenas números (ex: 15.00 ou 25.50)
                      </p>
                    </div>
                  )}

                  {/* Mensagem quando Frete Grátis está ATIVADO */}
                  {currentPlan.freeShipping !== false && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Frete gratuito ativado para este produto
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contador */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Contador</h4>

                <div className="space-y-4">
                  {/* Toggle Usar Contador */}
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Usar contador?</p>
                      <p className="text-xs text-gray-500 mt-1">Exibe contador regressivo no checkout</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPlan.useCounter || false}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, useCounter: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Campo de Tempo do Contador */}
                  {currentPlan.useCounter && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tempo do Contador (minutos)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={currentPlan.counterMinutes || 15}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, counterMinutes: parseInt(e.target.value) || 15 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="15"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        O contador iniciará com {currentPlan.counterMinutes || 15} minutos e irá decrementar até zero
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Imagens do Checkout */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Imagens do Checkout</h4>

                <div className="space-y-4">
                  {/* Imagem do Cabeçalho */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Imagem do Cabeçalho
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'header')}
                          className="hidden"
                          id="header-image-upload"
                        />
                        <label
                          htmlFor="header-image-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {uploadingHeaderImage ? 'Enviando...' : 'Carregar Imagem'}
                        </label>
                        {currentPlan.headerImage && !uploadingHeaderImage && (
                          <button
                            onClick={() => setCurrentPlan({ ...currentPlan, headerImage: '' })}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      {currentPlan.headerImage && (
                        <div className="border-2 border-gray-200 rounded-lg p-2">
                          <img
                            src={currentPlan.headerImage}
                            alt="Preview Cabeçalho"
                            className="max-h-32 rounded"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold">
                        📐 Dimensão recomendada: 1920x300px (largura total do checkout)
                      </p>
                    </div>
                  </div>

                  {/* Imagem do Canto Direito */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Imagem do Canto Direito
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'side')}
                          className="hidden"
                          id="side-image-upload"
                        />
                        <label
                          htmlFor="side-image-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {uploadingSideImage ? 'Enviando...' : 'Carregar Imagem'}
                        </label>
                        {currentPlan.sideImage && !uploadingSideImage && (
                          <button
                            onClick={() => setCurrentPlan({ ...currentPlan, sideImage: '' })}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      {currentPlan.sideImage && (
                        <div className="border-2 border-gray-200 rounded-lg p-2">
                          <img
                            src={currentPlan.sideImage}
                            alt="Preview Canto Direito"
                            className="max-h-32 rounded"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold">
                        📐 Dimensão recomendada: 305x990px (lateral fixa no canto direito)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* URL do Checkout */}
              {currentPlan.code && (
                <div className="border-t pt-6">
                  <h4 className="font-bold text-lg mb-1 text-gray-900">🔗 Link do Checkout</h4>
                  <p className="text-sm text-gray-600 mb-4">Compartilhe este link para vender este plano específico</p>

                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">URL de Checkout:</p>
                        <p className="text-sm text-indigo-900 font-mono truncate">
                          {getPlanLink(currentPlan)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(getPlanLink(currentPlan))
                          showAlert('Sucesso', 'Link do plano copiado!', 'success')
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
          )}

          {activePlanTab === 'condicoes' && (
            <div className="space-y-6">
              {/* Configurações de Parcelamento */}
              <div>
                <h4 className="font-bold text-lg mb-4 text-gray-900">Configurações de Parcelamento</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Máximo de parcelas no cartão
                    </label>
                    <select
                      value={currentPlan.maxInstallments || 12}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, maxInstallments: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    >
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="5">5x</option>
                      <option value="6">6x</option>
                      <option value="7">7x</option>
                      <option value="8">8x</option>
                      <option value="9">9x</option>
                      <option value="10">10x</option>
                      <option value="11">11x</option>
                      <option value="12">12x</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Máximo de parcelas sem juros
                    </label>
                    <select
                      value={currentPlan.maxInstallmentsNoInterest || 12}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, maxInstallmentsNoInterest: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    >
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="5">5x</option>
                      <option value="6">6x</option>
                      <option value="7">7x</option>
                      <option value="8">8x</option>
                      <option value="9">9x</option>
                      <option value="10">10x</option>
                      <option value="11">11x</option>
                      <option value="12">12x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlanTab === 'afiliacao' && (
            <div className="space-y-8">
              {/* Comissão Personalizada */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-900">Comissão personalizada para Afiliados?</label>
                    <button className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      ?
                    </button>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentPlan.affiliation?.customCommission || false}
                      onChange={(e) => setCurrentPlan({
                        ...currentPlan,
                        affiliation: { ...currentPlan.affiliation, customCommission: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {currentPlan.affiliation?.customCommission && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de comissão:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={currentPlan.affiliation?.commissionType !== 'fixed'}
                            onChange={() => setCurrentPlan({
                              ...currentPlan,
                              affiliation: { ...currentPlan.affiliation, commissionType: 'percentage' }
                            })}
                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">Porcentagem (%)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={currentPlan.affiliation?.commissionType === 'fixed'}
                            onChange={() => setCurrentPlan({
                              ...currentPlan,
                              affiliation: { ...currentPlan.affiliation, commissionType: 'fixed' }
                            })}
                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">Valor fixo (R$)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Valor da comissão:
                      </label>
                      <input
                        type="text"
                        value={
                          currentPlan.affiliation?.commissionType === 'fixed'
                            ? `R$ ${parseFloat(currentPlan.affiliation?.customCommissionValue || 0).toFixed(2).replace('.', ',')}`
                            : `${currentPlan.affiliation?.customCommissionValue || 30}%`
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.')
                          const numValue = parseFloat(value) || 0
                          const maxValue = currentPlan.affiliation?.commissionType === 'fixed' ? 999999 : 100
                          setCurrentPlan({
                            ...currentPlan,
                            affiliation: { ...currentPlan.affiliation, customCommissionValue: Math.min(maxValue, numValue) }
                          })
                        }}
                        placeholder={currentPlan.affiliation?.commissionType === 'fixed' ? 'R$ 0,00' : '0%'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ocultar para Afiliados */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">Ocultar plano para afiliados?</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentPlan.hideFromAffiliates || false}
                      onChange={(e) => setCurrentPlan({
                        ...currentPlan,
                        hideFromAffiliates: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

              {/* Afiliados Permitidos - Só aparece se "Ocultar plano para afiliados" estiver MARCADO */}
              {currentPlan.hideFromAffiliates && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Liberar a visualização do plano para os seguintes afiliados</h4>

                  {/* Lista de afiliados permitidos */}
                  {currentPlan.affiliation?.allowedAffiliates?.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {currentPlan.affiliation.allowedAffiliates.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <span className="text-sm text-gray-700">✕ 52.289.656 QUERVIN DAMASCENO DO NASCIMENTO / {email}</span>
                          <button
                            onClick={() => {
                              const updated = currentPlan.affiliation.allowedAffiliates.filter((_, i) => i !== index)
                              setCurrentPlan({
                                ...currentPlan,
                                affiliation: { ...currentPlan.affiliation, allowedAffiliates: updated }
                              })
                            }}
                            className="text-gray-400 hover:text-red-600 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input para adicionar afiliado - apenas se tiver pelo menos um */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Digite o CPF ou e-mail do afiliado para buscar"
                      id="affiliate-email-input"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const email = e.target.value.trim()
                          if (email && email.includes('@')) {
                            const current = currentPlan.affiliation?.allowedAffiliates || []
                            if (!current.includes(email)) {
                              setCurrentPlan({
                                ...currentPlan,
                                affiliation: {
                                  ...currentPlan.affiliation,
                                  allowedAffiliates: [...current, email]
                                }
                              })
                              e.target.value = ''
                            }
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('affiliate-email-input')
                        const email = input.value.trim()
                        if (email && email.includes('@')) {
                          const current = currentPlan.affiliation?.allowedAffiliates || []
                          if (!current.includes(email)) {
                            setCurrentPlan({
                              ...currentPlan,
                              affiliation: {
                                ...currentPlan.affiliation,
                                allowedAffiliates: [...current, email]
                              }
                            })
                            input.value = ''
                          }
                        }
                      }}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePlanTab === 'termos' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-1 text-gray-900">Termos e Condições</h4>
                <p className="text-sm text-gray-600">Adicione termos específicos para este plano</p>
              </div>

              {/* Lista de termos */}
              {currentPlan.terms && currentPlan.terms.length > 0 && (
                <div className="space-y-3">
                  {currentPlan.terms.map((term, index) => (
                    <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{term}</p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = currentPlan.terms.filter((_, i) => i !== index)
                            setCurrentPlan({ ...currentPlan, terms: updated })
                          }}
                          className="flex-shrink-0 text-red-600 hover:text-red-800 transition"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar novo termo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adicionar Novo Termo
                </label>
                <textarea
                  id="new-term-input"
                  placeholder="Digite o termo ou condição..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none mb-3"
                ></textarea>
                <button
                  onClick={() => {
                    const input = document.getElementById('new-term-input')
                    const text = input.value.trim()
                    if (text) {
                      const current = currentPlan.terms || []
                      setCurrentPlan({
                        ...currentPlan,
                        terms: [...current, text]
                      })
                      input.value = ''
                    }
                  }}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Termo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação - Fixo no rodapé */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
          <button
            onClick={handleCancelPlan}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSavePlan}
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {editingPlanId ? 'Atualizar Plano' : 'Salvar Plano'}
          </button>
        </div>
      </div>
    )
  }

  // Lista de planos (quando não está no formulário)
  console.log('📊 Renderizando lista de planos. Total:', plans.length)
  console.log('📋 Planos:', plans)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Planos de Pagamento</h2>
          <p className="text-gray-600">
            Configure os planos e formas de pagamento do seu produto
          </p>
        </div>

        {/* Botão no canto superior direito quando há planos */}
        <button
          onClick={handleAddPlan}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Plano
        </button>
      </div>

      {/* Lista de Planos */}
      {plans.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum plano cadastrado</h3>
          <p className="text-sm text-gray-500 mb-4">Comece criando seu primeiro plano de pagamento</p>
          <button
            onClick={handleAddPlan}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Criar Primeiro Plano
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Código
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Nome
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                      Itens por plano
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-700">
                      Valor
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      Visível para afiliados
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      Vendas Aprovadas
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      Ações
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {plan.code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{plan.name}</div>
                          <div className="text-xs text-gray-500">
                            R$ {parseFloat(plan.price || 0).toFixed(2).replace('.', ',')} | kit {plan.itemsQuantity} {plan.itemsQuantity === 1 ? 'frasco' : 'frascos'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {plan.itemsQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        R$ {parseFloat(plan.price || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.hideFromAffiliates
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {plan.hideFromAffiliates ? 'OCULTO' : 'VISÍVEL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.isAvailableForSale === false
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {plan.isAvailableForSale === false ? 'DESATIVADO' : 'ATIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold bg-blue-500 text-white">
                        {plan.approvedSales || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-0">
                        {/* Botão Editar */}
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition rounded-l-lg"
                          title="Editar plano"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Botão Duplicar */}
                        <button
                          onClick={() => handleDuplicatePlan(plan)}
                          className="p-2.5 bg-purple-600 text-white hover:bg-purple-700 transition"
                          title="Duplicar plano"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        {/* Botão Link */}
                        <button
                          onClick={() => copyPlanLink(plan)}
                          className="p-2.5 bg-blue-500 text-white hover:bg-blue-600 transition"
                          title="Copiar link do plano"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          className="p-2.5 bg-red-600 text-white hover:bg-red-700 transition rounded-r-lg"
                          title="Excluir plano"
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
