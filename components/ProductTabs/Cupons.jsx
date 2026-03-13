import { useState, useEffect } from 'react'
import AlertModal from '../AlertModal'

export default function Cupons({ product, setProduct }) {
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
  const [coupons, setCoupons] = useState(product.coupons || [])
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [currentCoupon, setCurrentCoupon] = useState(null)
  const [editingCouponId, setEditingCouponId] = useState(null)

  // Sincronizar cupons quando o produto for atualizado
  useEffect(() => {
    if (product && product.coupons) {
      setCoupons(product.coupons)
    }
  }, [product])

  const getEmptyCoupon = () => ({
    code: '',
    type: 'percentage', // 'percentage' ou 'fixed'
    value: '',
    isActive: true
  })

  const handleAddCoupon = () => {
    setCurrentCoupon(getEmptyCoupon())
    setEditingCouponId(null)
    setShowCouponForm(true)
  }

  const handleEditCoupon = (coupon) => {
    setCurrentCoupon({ ...coupon })
    setEditingCouponId(coupon.id)
    setShowCouponForm(true)
  }

  const handleSaveCoupon = async () => {
    console.log('🔵 INÍCIO handleSaveCoupon')
    console.log('🔵 currentCoupon:', currentCoupon)
    console.log('🔵 coupons atuais:', coupons)

    // Validação básica
    if (!currentCoupon.code || currentCoupon.code.trim() === '') {
      showAlert('Atenção', 'Por favor, preencha o código do cupom', 'warning')
      return
    }

    // Converter valor para número
    const rawValue = currentCoupon.value.toString().replace(/[^0-9,]/g, '').replace(',', '.')
    const numValue = parseFloat(rawValue) || 0

    console.log('🔵 rawValue:', rawValue)
    console.log('🔵 numValue:', numValue)

    if (!numValue || numValue <= 0) {
      showAlert('Atenção', 'Por favor, preencha um valor válido para o desconto', 'warning')
      return
    }

    // Validar apenas limite de porcentagem (sem limite de valor fixo aqui)
    if (currentCoupon.type === 'percentage' && numValue > 90) {
      showAlert('Atenção', 'O desconto percentual não pode ser maior que 90%', 'warning')
      return
    }

    console.log('💾 Salvando cupom...', { ...currentCoupon, value: numValue })

    // Preparar cupom com valor numérico
    const couponToSave = {
      ...currentCoupon,
      value: numValue,
      code: currentCoupon.code.toUpperCase()
    }

    let newCoupons
    let successMessage

    if (editingCouponId) {
      // Editando cupom existente
      newCoupons = coupons.map(c => c.id === editingCouponId ? {
        ...couponToSave,
        id: editingCouponId
      } : c)
      successMessage = '✅ Cupom atualizado com sucesso!'
    } else {
      // Novo cupom - verificar se código já existe
      console.log('🔵 Criando NOVO cupom')
      console.log('🔵 coupons array para verificar:', coupons)

      const codeExists = coupons.some(c => c.code.toUpperCase() === currentCoupon.code.toUpperCase())
      console.log('🔵 Código já existe?', codeExists)

      if (codeExists) {
        showAlert('Atenção', 'Já existe um cupom com este código', 'warning')
        return
      }

      const newCoupon = {
        ...couponToSave,
        id: Date.now(),
        createdAt: new Date().toISOString()
      }
      console.log('🔵 newCoupon criado:', newCoupon)

      newCoupons = [...coupons, newCoupon]
      console.log('🔵 newCoupons array:', newCoupons)
      console.log('🔵 newCoupons length:', newCoupons.length)

      successMessage = `✅ Cupom "${newCoupon.code}" criado com sucesso!`
    }

    console.log('📋 Total de cupons após salvar:', newCoupons.length)
    console.log('🎟️ ARRAY DE CUPONS COMPLETO:', JSON.stringify(newCoupons, null, 2))

    // Salvar no backend automaticamente
    try {
      console.log('🌐 Salvando cupom no backend...')
      console.log('📦 Produto atual ID:', product.id)
      console.log('📦 Produto atual coupons antes:', product.coupons)
      console.log('🎟️ Novos cupons a serem salvos:', newCoupons)
      console.log('🎟️ ARRAY DETALHADO:', JSON.stringify(newCoupons, null, 2))

      // IMPORTANTE: Enviar apenas os cupons, não o produto inteiro
      // O backend vai fazer o merge corretamente
      const updateData = {
        coupons: newCoupons
      }

      console.log('🔴🔴🔴 CRÍTICO - ANTES DO FETCH 🔴🔴🔴')
      console.log('📤 updateData:', updateData)
      console.log('📤 updateData.coupons:', updateData.coupons)
      console.log('📤 updateData.coupons.length:', updateData.coupons.length)
      console.log('📤 updateData.coupons[0]:', updateData.coupons[0])
      console.log('📤 JSON.stringify(updateData):', JSON.stringify(updateData))
      console.log('🔴🔴🔴 FIM CRÍTICO 🔴🔴🔴')

      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar no servidor')
      }

      const savedProduct = await response.json()
      console.log('✅ Cupom salvo no backend com sucesso!', savedProduct)

      // Atualizar estados locais COM OS DADOS DO SERVIDOR
      const savedCoupons = savedProduct.coupons || newCoupons
      console.log('📋 Cupons salvos:', savedCoupons)

      setCoupons(savedCoupons)
      setProduct(savedProduct)

      // Fechar formulário e resetar estado - IMPORTANTE: fazer isso ANTES do alert
      setShowCouponForm(false)
      setCurrentCoupon(null)
      setEditingCouponId(null)

      console.log('✅ Formulário fechado, mostrando lista de cupons')
      console.log('✅ Estado showCouponForm:', false)
      console.log('✅ Total de cupons na lista:', savedCoupons.length)

      // Mostrar mensagem de sucesso DEPOIS de fechar o formulário
      setTimeout(() => {
        showAlert('Sucesso', successMessage, 'success')
      }, 100)
    } catch (error) {
      console.error('❌ Erro ao salvar cupom:', error)
      showAlert('Erro', 'Erro ao salvar cupom. Por favor, tente novamente.', 'error')
    }
  }

  const handleDeleteCoupon = (couponId) => {
    const coupon = coupons.find(c => c.id === couponId)
    if (!confirm(`Tem certeza que deseja excluir o cupom "${coupon.code}"?`)) return

    const newCoupons = coupons.filter(c => c.id !== couponId)
    setCoupons(newCoupons)
    setProduct({ ...product, coupons: newCoupons })
  }

  const handleDuplicateCoupon = (coupon) => {
    const duplicated = {
      ...coupon,
      id: Date.now(),
      code: `${coupon.code}_COPY`,
      createdAt: new Date().toISOString()
    }
    const newCoupons = [...coupons, duplicated]
    setCoupons(newCoupons)
    setProduct({ ...product, coupons: newCoupons })
  }

  const handleCancelCoupon = () => {
    setShowCouponForm(false)
    setCurrentCoupon(null)
    setEditingCouponId(null)
  }

  // Se estiver no formulário, mostrar apenas ele
  if (showCouponForm && currentCoupon) {
    return (
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button
            onClick={handleCancelCoupon}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold">
              {editingCouponId ? 'Editar Cupom' : 'Novo Cupom'}
            </h2>
            <p className="text-sm text-gray-600">Configure o cupom de desconto</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="max-w-2xl space-y-6">
          {/* Código do Cupom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código do Cupom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentCoupon.code}
              onChange={(e) => setCurrentCoupon({ ...currentCoupon, code: e.target.value.toUpperCase() })}
              placeholder="Ex: PROMO10, DESCONTO50"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition uppercase"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use apenas letras e números, sem espaços. Ex: PROMO10
            </p>
          </div>

          {/* Tipo de Desconto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Desconto <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                currentCoupon.type === 'percentage' ? 'border-emerald-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input
                  type="radio"
                  checked={currentCoupon.type === 'percentage'}
                  onChange={() => setCurrentCoupon({ ...currentCoupon, type: 'percentage', value: '' })}
                  className="w-5 h-5 text-emerald-600"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Porcentagem (%)</p>
                  <p className="text-sm text-gray-600">Desconto em %</p>
                </div>
              </label>

              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                currentCoupon.type === 'fixed' ? 'border-emerald-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input
                  type="radio"
                  checked={currentCoupon.type === 'fixed'}
                  onChange={() => setCurrentCoupon({ ...currentCoupon, type: 'fixed', value: '' })}
                  className="w-5 h-5 text-emerald-600"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Valor Fixo (R$)</p>
                  <p className="text-sm text-gray-600">Desconto em reais</p>
                </div>
              </label>
            </div>
          </div>

          {/* Valor do Desconto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Valor do Desconto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={
                  currentCoupon.value === '' || currentCoupon.value === undefined || currentCoupon.value === null
                    ? ''
                    : currentCoupon.type === 'percentage'
                    ? `${currentCoupon.value}%`
                    : `R$ ${currentCoupon.value.toString().replace(/[^0-9,]/g, '')}`
                }
                onChange={(e) => {
                  // Remove formatação e permite apenas números e vírgula
                  const rawValue = e.target.value.replace(/[^0-9,]/g, '')
                  setCurrentCoupon({ ...currentCoupon, value: rawValue })
                }}
                onBlur={(e) => {
                  // Formata ao sair do campo
                  const rawValue = e.target.value.replace(/[^0-9,]/g, '')
                  if (!rawValue) {
                    setCurrentCoupon({ ...currentCoupon, value: '' })
                    return
                  }

                  const numValue = parseFloat(rawValue.replace(',', '.')) || 0

                  // Formata de acordo com o tipo
                  let formattedValue
                  if (currentCoupon.type === 'percentage') {
                    formattedValue = numValue.toFixed(0)
                  } else {
                    formattedValue = numValue.toFixed(2).replace('.', ',')
                  }

                  setCurrentCoupon({ ...currentCoupon, value: formattedValue })
                }}
                placeholder={currentCoupon.type === 'percentage' ? '10%' : 'R$ 50,00'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentCoupon.type === 'percentage'
                ? 'Digite apenas o número (será formatado como %)'
                : 'Digite o valor em reais (será formatado como R$)'
              }
            </p>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Cupom Ativo?</p>
                <p className="text-xs text-gray-500">Desative para pausar temporariamente</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentCoupon.isActive !== false}
                  onChange={(e) => setCurrentCoupon({ ...currentCoupon, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>

          {/* Botões de Ação - Fixo no rodapé */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={handleCancelCoupon}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCoupon}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {editingCouponId ? 'Atualizar Cupom' : 'Salvar Cupom'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Lista de cupons
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Cupons de Desconto</h2>
          <p className="text-gray-600">
            Crie e gerencie cupons de desconto para este produto
          </p>
        </div>

        <button
          onClick={handleAddCoupon}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Cupom
        </button>
      </div>

      {/* Lista de Cupons */}
      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum cupom cadastrado</h3>
          <p className="text-sm text-gray-500 mb-4">Comece criando seu primeiro cupom de desconto</p>
          <button
            onClick={handleAddCoupon}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Criar Primeiro Cupom
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
                      Nome
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Moeda
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Tipo do Cupom
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Tipo Pagamento
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Valor
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                      Status
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                      Quant. Vendas Pagas
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                      Quant. Vendas Criadas
                      <span className="text-gray-400">↕</span>
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
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition">
                    {/* Nome (Código do Cupom) */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{coupon.code}</span>
                    </td>

                    {/* Moeda */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">BRL</span>
                    </td>

                    {/* Tipo do Cupom */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {coupon.type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                      </span>
                    </td>

                    {/* Tipo Pagamento */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">Todos</span>
                    </td>

                    {/* Valor */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}%`
                          : `R$ ${parseFloat(coupon.value).toFixed(2).replace('.', ',')}`
                        }
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.isActive !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Quant. Vendas Pagas */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{coupon.salesPaid || 0}</span>
                    </td>

                    {/* Quant. Vendas Criadas */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{coupon.salesCreated || 0}</span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 transition rounded-full shadow-md hover:shadow-lg"
                          title="Editar cupom"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
