import { useState, useEffect } from 'react'
import AlertModal from '../AlertModal'

export default function Afiliados({ product, setProduct }) {
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

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    aprovados: true,
    reprovados: false,
    pendentes: true
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCommission, setEditingCommission] = useState({})

  // Buscar afiliados reais do produto
  const affiliates = product?.affiliations || []

  // Função para aprovar afiliado
  const handleApprove = async (affiliationId) => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/affiliations/${affiliationId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar o produto localmente
        const updatedAffiliations = product.affiliations.map(aff =>
          aff.id === affiliationId ? { ...aff, status: 'approved', approvedAt: new Date().toISOString() } : aff
        )
        setProduct({ ...product, affiliations: updatedAffiliations })
        showAlert('Sucesso', 'Afiliado aprovado com sucesso!', 'success')
      } else {
        showAlert('Erro', 'Não foi possível aprovar o afiliado.', 'error')
      }
    } catch (error) {
      console.error('Erro ao aprovar afiliado:', error)
      showAlert('Erro', 'Erro ao aprovar afiliado.', 'error')
    }
  }

  // Função para rejeitar afiliado
  const handleReject = async (affiliationId) => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/affiliations/${affiliationId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar o produto localmente
        const updatedAffiliations = product.affiliations.map(aff =>
          aff.id === affiliationId ? { ...aff, status: 'rejected' } : aff
        )
        setProduct({ ...product, affiliations: updatedAffiliations })
        showAlert('Afiliado Reprovado', 'Afiliado reprovado com sucesso!', 'warning')
      } else {
        showAlert('Erro', 'Não foi possível rejeitar o afiliado.', 'error')
      }
    } catch (error) {
      console.error('Erro ao rejeitar afiliado:', error)
      showAlert('Erro', 'Erro ao rejeitar afiliado.', 'error')
    }
  }

  // Função para alterar comissão individual
  const handleCommissionChange = (affiliationId, newCommission) => {
    setEditingCommission({ ...editingCommission, [affiliationId]: newCommission })
  }

  // Função para salvar comissão individual
  const handleCommissionBlur = async (affiliationId) => {
    const rawValue = editingCommission[affiliationId]
    if (rawValue === undefined) return

    // Remover caracteres não numéricos e converter para número
    const numValue = parseFloat(rawValue.toString().replace(/[^0-9.]/g, '')) || 0

    // Validar: máximo 100%, mínimo 0%
    const validCommission = Math.min(100, Math.max(0, numValue))

    try {
      // Salvar no backend (você precisará criar este endpoint)
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/affiliations/${affiliationId}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ individualCommission: validCommission })
      })

      if (response.ok) {
        // Atualizar o produto localmente
        const updatedAffiliations = product.affiliations.map(aff =>
          aff.id === affiliationId ? { ...aff, individualCommission: validCommission } : aff
        )
        setProduct({ ...product, affiliations: updatedAffiliations })
        showAlert('Sucesso', 'Comissão individual atualizada!', 'success')
      } else {
        showAlert('Erro', 'Não foi possível atualizar a comissão.', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error)
      showAlert('Erro', 'Erro ao atualizar comissão.', 'error')
    }

    // Limpar estado de edição
    const newEditing = { ...editingCommission }
    delete newEditing[affiliationId]
    setEditingCommission(newEditing)
  }

  // Função para calcular comissão efetiva (prioridade: plano > individual > geral)
  const getEffectiveCommission = (affiliation) => {
    // 1. Comissão personalizada do plano (maior prioridade)
    // Se o afiliado tiver um plano específico com comissão customizada
    if (affiliation.planCommission !== undefined && affiliation.planCommission !== null) {
      return affiliation.planCommission
    }

    // 2. Comissão individual do afiliado (segunda prioridade)
    if (affiliation.individualCommission !== undefined && affiliation.individualCommission !== null) {
      return affiliation.individualCommission
    }

    // 3. Comissão geral do produto (menor prioridade - padrão)
    return affiliation.commissionValue || product?.affiliateConfig?.commissionValue || 0
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovado' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Reprovado' }
    }
    const s = statusMap[status] || statusMap['pending']
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    )
  }

  const filteredAffiliates = affiliates.filter(affiliate => {
    // Filtro por status
    const statusMatch =
      (filters.aprovados && affiliate.status === 'approved') ||
      (filters.pendentes && affiliate.status === 'pending') ||
      (filters.reprovados && affiliate.status === 'rejected')

    // Filtro por nome (buscar no affiliateId ou em dados do usuário se disponível)
    const nameMatch = searchTerm === '' ||
      (affiliate.affiliateId && affiliate.affiliateId.toLowerCase().includes(searchTerm.toLowerCase()))

    return statusMatch && nameMatch
  })

  return (
    <div className="space-y-6">
      {/* Link de Convite para Afiliados */}
      {product?.affiliateConfig?.participateInProgram && product.status === 'active' && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Link de Convite para Afiliados:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={`${window.location.origin}/produto/${product.id}`}
                readOnly
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer hover:bg-gray-50 transition"
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
                showAlert('Sucesso', 'Link de convite copiado!', 'success')
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </button>
          </div>
          <p className="text-xs text-gray-700 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Compartilhe este link para convidar afiliados. Ao acessar, eles verão os detalhes do produto e poderão se afiliar.
          </p>
        </div>
      )}

      {/* Cabeçalho com botões */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Afiliados</h2>
          <p className="text-sm text-gray-600 mt-1">Gerencie os afiliados deste produto</p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Pesquisa */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar por ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Botão Filtros */}
          <button
            onClick={() => setShowFilters(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Afiliados */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded text-emerald-600" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  ID Afiliado
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Desde
                  <span className="ml-1 text-gray-400">↕</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Vendas
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Comissão Total
                  <span className="ml-1 text-gray-400">↕</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Comissão Individual (%)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAffiliates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Nenhum afiliado encontrado
                  </td>
                </tr>
              ) : (
                filteredAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded text-emerald-600" />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{affiliate.affiliateId || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{affiliate.commissionType || 'Último Clique'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {affiliate.createdAt ? new Date(affiliate.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {affiliate.conversions || 0}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      R$ {(affiliate.totalCommission || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={
                          editingCommission[affiliate.id] !== undefined
                            ? editingCommission[affiliate.id]
                            : `${getEffectiveCommission(affiliate)}%`
                        }
                        onChange={(e) => handleCommissionChange(affiliate.id, e.target.value)}
                        onBlur={() => handleCommissionBlur(affiliate.id)}
                        onFocus={(e) => {
                          setEditingCommission({
                            ...editingCommission,
                            [affiliate.id]: getEffectiveCommission(affiliate)
                          })
                          e.target.select()
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur()
                          }
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(affiliate.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {affiliate.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(affiliate.id)}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                              title="Aprovar"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleReject(affiliate.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                              title="Reprovar"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {affiliate.status === 'approved' && (
                          <button
                            onClick={() => handleReject(affiliate.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                            title="Reprovar"
                          >
                            ✕
                          </button>
                        )}
                        {affiliate.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(affiliate.id)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                            title="Aprovar"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Filtrar Afiliados</h2>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.aprovados}
                  onChange={(e) => setFilters({ ...filters, aprovados: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium">Aprovados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.reprovados}
                  onChange={(e) => setFilters({ ...filters, reprovados: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium">Reprovados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.pendentes}
                  onChange={(e) => setFilters({ ...filters, pendentes: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium">Pendentes</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFilters({ aprovados: true, reprovados: false, pendentes: true })
                  setShowFilters(false)
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Aplicar Filtro
              </button>
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
