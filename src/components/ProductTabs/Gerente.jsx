import { useState, useEffect } from 'react'
import AlertModal from '../AlertModal'
import axios from 'axios'

export default function Gerente({ product }) {
  const API_URL = import.meta.env.VITE_API_URL || 'https://pag2pay-backend01-production.up.railway.app'

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

  const [showManagerForm, setShowManagerForm] = useState(false)
  const [editingManager, setEditingManager] = useState(null)
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(false)

  // Busca de gerentes (autocomplete)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Afiliados do produto
  const [affiliates, setAffiliates] = useState([])

  const [formData, setFormData] = useState({
    commissionType: 'percentage',
    commissionWithAffiliate: '',
    commissionWithoutAffiliate: '',
    affiliateScope: 'all',
    selectedAffiliates: []
  })

  // Carregar gerentes do produto
  useEffect(() => {
    if (product?.id) {
      loadManagers()
      loadAffiliates()
    }
  }, [product?.id])

  const loadManagers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/products/${product.id}/managers`)
      setManagers(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar gerentes:', error)
      showAlert('Erro', 'Não foi possível carregar os gerentes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadAffiliates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${product.id}/affiliates`)
      setAffiliates(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar afiliados:', error)
    }
  }

  // Buscar usuários por email (autocomplete)
  const handleSearchEmail = async (email) => {
    setSearchEmail(email)

    if (email.length < 3) {
      setSearchResults([])
      return
    }

    try {
      setSearchingUsers(true)
      const response = await axios.get(`${API_URL}/api/users/search-managers`, {
        params: { email, productId: product.id }
      })
      setSearchResults(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setSearchingUsers(false)
    }
  }

  const handleSelectUser = (user) => {
    if (!user.canBeManager) {
      showAlert('Usuário inválido', user.reason || 'Este usuário não pode ser gerente', 'warning')
      return
    }

    setSelectedUser(user)
    setSearchEmail(user.email)
    setSearchResults([])
  }

  const handleNewManager = () => {
    setEditingManager(null)
    setSelectedUser(null)
    setSearchEmail('')
    setSearchResults([])
    setFormData({
      commissionType: 'percentage',
      commissionWithAffiliate: '0',
      commissionWithoutAffiliate: '0',
      affiliateScope: 'all',
      selectedAffiliates: []
    })
    setShowManagerForm(true)
  }

  const handleEditManager = (manager) => {
    setEditingManager(manager)
    setSelectedUser({
      id: manager.userId,
      email: manager.userEmail,
      name: manager.userName
    })
    setSearchEmail(manager.userEmail)
    setFormData({
      commissionType: manager.commissionType,
      commissionWithAffiliate: manager.commissionType === 'percentage'
        ? manager.withAffiliateRate.toString()
        : manager.withAffiliateRate.toString(),
      commissionWithoutAffiliate: manager.commissionType === 'percentage'
        ? manager.withoutAffiliateRate.toString()
        : manager.withoutAffiliateRate.toString(),
      affiliateScope: manager.scope,
      selectedAffiliates: manager.affiliateIds || []
    })
    setShowManagerForm(true)
  }

  const handleSaveManager = async () => {
    // Validações
    if (!selectedUser) {
      showAlert('Atenção', 'Por favor, selecione um usuário válido!', 'warning')
      return
    }

    const withAffiliate = parseFloat(formData.commissionWithAffiliate) || 0
    const withoutAffiliate = parseFloat(formData.commissionWithoutAffiliate) || 0

    // Validação ajustada: pelo menos UMA comissão deve ser maior que zero
    if (withAffiliate <= 0 && withoutAffiliate <= 0) {
      showAlert(
        'Atenção',
        'Por favor, preencha pelo menos uma comissão (COM afiliado OU SEM afiliado)!',
        'warning'
      )
      return
    }

    // Validação de porcentagem
    if (formData.commissionType === 'percentage') {
      if (withAffiliate > 100) {
        showAlert('Atenção', 'A comissão COM afiliado não pode ser maior que 100%!', 'warning')
        return
      }
      if (withoutAffiliate > 100) {
        showAlert('Atenção', 'A comissão SEM afiliado não pode ser maior que 100%!', 'warning')
        return
      }
    }

    // Validação de valores negativos
    if (withAffiliate < 0 || withoutAffiliate < 0) {
      showAlert('Atenção', 'As comissões não podem ser negativas!', 'warning')
      return
    }

    if (formData.affiliateScope === 'specific' && formData.selectedAffiliates.length === 0) {
      showAlert('Atenção', 'Selecione pelo menos um afiliado!', 'warning')
      return
    }

    try {
      setLoading(true)

      const payload = {
        userId: selectedUser.id,
        productId: product.id,
        commissionConfig: {
          type: formData.commissionType,
          withAffiliateRate: parseFloat(formData.commissionWithAffiliate),
          withoutAffiliateRate: parseFloat(formData.commissionWithoutAffiliate),
          scope: formData.affiliateScope,
          affiliateIds: formData.affiliateScope === 'specific' ? formData.selectedAffiliates : []
        }
      }

      if (editingManager) {
        // Atualizar gerente existente
        await axios.patch(`${API_URL}/api/managers/${editingManager.id}`, payload.commissionConfig)
        showAlert('Sucesso', 'Gerente atualizado com sucesso!', 'success')
      } else {
        // Criar novo gerente
        await axios.post(`${API_URL}/api/managers`, payload)
        showAlert('Sucesso', 'Gerente cadastrado com sucesso!', 'success')
      }

      setShowManagerForm(false)
      loadManagers()
    } catch (error) {
      console.error('Erro ao salvar gerente:', error)
      showAlert(
        'Erro',
        error.response?.data?.error || 'Não foi possível salvar o gerente',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteManager = async (managerId, managerName) => {
    if (!window.confirm(`Tem certeza que deseja desativar o gerente ${managerName}?`)) {
      return
    }

    try {
      setLoading(true)
      await axios.delete(`${API_URL}/api/managers/${managerId}`)
      showAlert('Sucesso', 'Gerente desativado com sucesso!', 'success')
      loadManagers()
    } catch (error) {
      console.error('Erro ao desativar gerente:', error)
      showAlert('Erro', 'Não foi possível desativar o gerente', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatCommission = (value, type) => {
    if (type === 'percentage') {
      return `${value}%`
    }
    return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerentes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os gerentes deste produto e suas comissões
          </p>
        </div>

        <button
          onClick={handleNewManager}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-medium disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo Gerente
        </button>
      </div>

      {/* Lista de Gerentes */}
      {loading && managers.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando gerentes...</p>
        </div>
      ) : managers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 font-medium">Nenhum gerente cadastrado</p>
          <p className="text-sm text-gray-500 mt-1">
            Adicione gerentes para dividir as comissões deste produto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managers.map((manager) => (
            <div key={manager.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{manager.userName}</h3>
                  <p className="text-sm text-gray-500 truncate">{manager.userEmail}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEditManager(manager)}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteManager(manager.id, manager.userName)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Desativar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium capitalize">{manager.commissionType === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Com afiliado:</span>
                  <span className="font-medium text-emerald-600">
                    {formatCommission(manager.withAffiliateRate, manager.commissionType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sem afiliado:</span>
                  <span className="font-medium text-emerald-600">
                    {formatCommission(manager.withoutAffiliateRate, manager.commissionType)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Escopo:</span>
                  <span className="font-medium">
                    {manager.scope === 'all' ? 'Todos afiliados' : `${manager.affiliateIds?.length || 0} específicos`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendas:</span>
                  <span className="font-medium">{manager.stats?.totalSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comissões:</span>
                  <span className="font-medium text-green-600">
                    R$ {(manager.stats?.totalCommissions || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Formulário de Gerente */}
      {showManagerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingManager ? 'Editar Gerente' : 'Novo Gerente'}
              </h2>
              <button
                onClick={() => setShowManagerForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Busca de Usuário */}
              {!editingManager && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar usuário <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchEmail}
                      onChange={(e) => handleSearchEmail(e.target.value)}
                      placeholder="Digite o email do usuário..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    {searchingUsers && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                      </div>
                    )}
                  </div>

                  {/* Resultados da busca */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${
                            !user.canBeManager ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            {user.canBeManager ? (
                              <span className="text-green-600 text-sm font-medium">✓ Apto</span>
                            ) : (
                              <span className="text-red-600 text-sm font-medium">✗ Não apto</span>
                            )}
                          </div>
                          {!user.canBeManager && user.reason && (
                            <p className="text-xs text-red-600 mt-1">{user.reason}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Usuário selecionado */}
                  {selectedUser && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-sm font-medium text-emerald-900">✓ Selecionado:</p>
                      <p className="text-sm text-emerald-700">{selectedUser.name} ({selectedUser.email})</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    O usuário deve ter documentos aprovados, dados bancários e recipient ativo
                  </p>
                </div>
              )}

              {/* Tipo de comissão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de comissão <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      value="percentage"
                      checked={formData.commissionType === 'percentage'}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Porcentagem (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      value="fixed"
                      checked={formData.commissionType === 'fixed'}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Valor fixo (R$)</span>
                  </label>
                </div>
              </div>

              {/* Comissão com afiliado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comissão COM afiliado
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={formData.commissionType === 'percentage' ? '0.1' : '0.01'}
                    min="0"
                    max={formData.commissionType === 'percentage' ? '100' : undefined}
                    value={formData.commissionWithAffiliate}
                    onChange={(e) => setFormData({ ...formData, commissionWithAffiliate: e.target.value })}
                    placeholder={formData.commissionType === 'percentage' ? '0.00' : '0.00'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">
                    {formData.commissionType === 'percentage' ? '%' : 'R$'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Comissão quando há afiliado na venda
                </p>
              </div>

              {/* Comissão sem afiliado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comissão SEM afiliado
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={formData.commissionType === 'percentage' ? '0.1' : '0.01'}
                    min="0"
                    max={formData.commissionType === 'percentage' ? '100' : undefined}
                    value={formData.commissionWithoutAffiliate}
                    onChange={(e) => setFormData({ ...formData, commissionWithoutAffiliate: e.target.value })}
                    placeholder={formData.commissionType === 'percentage' ? '0.00' : '0.00'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">
                    {formData.commissionType === 'percentage' ? '%' : 'R$'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Comissão quando NÃO há afiliado na venda
                </p>
              </div>

              {/* Aviso sobre preenchimento */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>ℹ️ Atenção:</strong> Preencha pelo menos uma das comissões acima (COM ou SEM afiliado).
                </p>
              </div>

              {/* Escopo de afiliados */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gerenciar comissões de <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:border-emerald-500 transition">
                    <input
                      type="radio"
                      name="affiliateScope"
                      value="all"
                      checked={formData.affiliateScope === 'all'}
                      onChange={(e) => setFormData({ ...formData, affiliateScope: e.target.value, selectedAffiliates: [] })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Todos os afiliados</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Comissão sobre vendas de TODOS os afiliados
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:border-emerald-500 transition">
                    <input
                      type="radio"
                      name="affiliateScope"
                      value="specific"
                      checked={formData.affiliateScope === 'specific'}
                      onChange={(e) => setFormData({ ...formData, affiliateScope: e.target.value })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Afiliados específicos</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Escolher afiliados manualmente
                      </p>
                    </div>
                  </label>
                </div>

                {/* Seleção de afiliados específicos */}
                {formData.affiliateScope === 'specific' && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Afiliados selecionados</h4>

                    {affiliates.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum afiliado disponível para este produto</p>
                    ) : (
                      <div className="space-y-2">
                        {affiliates.map((affiliate) => (
                          <label key={affiliate.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.selectedAffiliates.includes(affiliate.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedAffiliates: [...formData.selectedAffiliates, affiliate.id]
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedAffiliates: formData.selectedAffiliates.filter(id => id !== affiliate.id)
                                  })
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {affiliate.name} ({affiliate.email})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveManager}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingManager ? 'Salvar Alterações' : 'Adicionar Gerente'}
                </button>
                <button
                  onClick={() => setShowManagerForm(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
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
