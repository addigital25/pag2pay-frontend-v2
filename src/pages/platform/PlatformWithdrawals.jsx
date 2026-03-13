import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import config from '../../config'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'

export default function PlatformWithdrawals() {
  const [filter, setFilter] = useState('all')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectField, setShowRejectField] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(false)
  const { alertState, showAlert, hideAlert } = useAlert()
  const [confirmAction, setConfirmAction] = useState(null)

  // Carregar saques ao montar o componente
  useEffect(() => {
    loadWithdrawals()
  }, [])

  // Carregar saques da API
  const loadWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${config.apiUrl}/api/withdrawals`)
      const data = await response.json()

      // A API retorna array direto ou objeto com withdrawals
      setWithdrawals(Array.isArray(data) ? data : (data.withdrawals || []))
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">Pendente</span>,
      processing: <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">Processando</span>,
      completed: <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">Concluído</span>,
      rejected: <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">Rejeitado</span>,
      failed: <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">Falhou</span>
    }
    return badges[status]
  }

  // Função para aprovar saque
  const handleApprove = async (withdrawalId) => {
    setProcessing(true)

    try {
      const response = await fetch(`${config.apiUrl}/api/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aprovar saque')
      }

      showAlert({
        title: 'Sucesso!',
        message: 'Saque aprovado com sucesso! A transferência foi enviada para a Pagar.me.',
        type: 'success'
      })
      setShowModal(false)
      setShowRejectField(false)
      setRejectReason('')
      loadWithdrawals() // Recarregar lista
    } catch (error) {
      console.error('Erro ao aprovar saque:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao aprovar saque: ' + error.message,
        type: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  // Função para confirmar aprovação
  const confirmApprove = (withdrawalId) => {
    setConfirmAction({
      title: 'Confirmar Aprovação',
      message: 'Tem certeza que deseja aprovar este saque? A transferência será processada na Pagar.me.',
      type: 'warning',
      onConfirm: () => handleApprove(withdrawalId)
    })
  }

  // Função para rejeitar saque
  const handleReject = async (withdrawalId) => {
    setProcessing(true)

    try {
      const response = await fetch(`${config.apiUrl}/api/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rejectReason
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao rejeitar saque')
      }

      showAlert({
        title: 'Sucesso!',
        message: 'Saque rejeitado com sucesso!',
        type: 'success'
      })
      setShowModal(false)
      setShowRejectField(false)
      setRejectReason('')
      loadWithdrawals() // Recarregar lista
    } catch (error) {
      console.error('Erro ao rejeitar saque:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao rejeitar saque: ' + error.message,
        type: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  // Função para confirmar rejeição
  const confirmReject = (withdrawalId) => {
    if (!rejectReason || rejectReason.trim() === '') {
      showAlert({
        title: 'Atenção',
        message: 'Por favor, informe o motivo da rejeição',
        type: 'warning'
      })
      return
    }

    setConfirmAction({
      title: 'Confirmar Rejeição',
      message: 'Tem certeza que deseja rejeitar este saque?',
      type: 'warning',
      onConfirm: () => handleReject(withdrawalId)
    })
  }

  const filteredWithdrawals = filter === 'all'
    ? withdrawals
    : withdrawals.filter(w => w.status === filter)

  const totalPending = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  const totalProcessing = withdrawals
    .filter(w => w.status === 'processing')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  const totalCompleted = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  return (
    <PlatformLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Saques</h1>
              <p className="text-slate-600 mt-2">Gerencie as solicitações de saque dos vendedores</p>
            </div>
            <button
              onClick={loadWithdrawals}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm">Pendentes</span>
              <svg className="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-yellow-100 text-sm mt-1">
              {withdrawals.filter(w => w.status === 'pending').length} solicitações
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm">Processando</span>
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-3xl font-bold">
              R$ {totalProcessing.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-blue-100 text-sm mt-1">
              {withdrawals.filter(w => w.status === 'processing').length} em andamento
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm">Concluídos</span>
              <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold">
              R$ {totalCompleted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-green-100 text-sm mt-1">
              {withdrawals.filter(w => w.status === 'completed').length} pagos
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100 text-sm">Rejeitados</span>
              <svg className="w-8 h-8 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-3xl font-bold">
              {withdrawals.filter(w => w.status === 'rejected').length}
            </p>
            <p className="text-red-100 text-sm mt-1">recusados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({withdrawals.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pendentes ({withdrawals.filter(w => w.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'processing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Processando ({withdrawals.filter(w => w.status === 'processing').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Concluídos ({withdrawals.filter(w => w.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Rejeitados ({withdrawals.filter(w => w.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-slate-600 mt-4">Carregando saques...</p>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Nenhum saque encontrado</h3>
            <p className="text-slate-600">
              {filter === 'all'
                ? 'Não há solicitações de saque no momento'
                : `Não há saques com status "${filter}"`}
            </p>
          </div>
        ) : (
          /* Tabela de Saques */
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Solicitações de Saque</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Banco</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm text-slate-700">
                          {withdrawal.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {withdrawal.seller || withdrawal.sellerName || `Vendedor #${withdrawal.sellerId || withdrawal.userId}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                        R$ {(withdrawal.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-sm">
                        <div>{withdrawal.bank || withdrawal.bankAccount || 'N/A'}</div>
                        {withdrawal.agency && withdrawal.account && (
                          <div className="text-xs text-slate-500">
                            Ag: {withdrawal.agency} - Cc: {withdrawal.account}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-sm">
                        {withdrawal.requestDate
                          ? new Date(withdrawal.requestDate).toLocaleDateString('pt-BR')
                          : withdrawal.createdAt
                          ? new Date(withdrawal.createdAt).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setShowModal(true)
                                setShowRejectField(false)
                              }}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                              disabled={processing}
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setShowModal(true)
                                setShowRejectField(true)
                              }}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                              disabled={processing}
                            >
                              Rejeitar
                            </button>
                          </div>
                        )}
                        {withdrawal.status !== 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setShowModal(true)
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                          >
                            Ver Detalhes
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AlertModal para mensagens */}
        <AlertModal
          isOpen={alertState.isOpen}
          onClose={hideAlert}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          buttonText={alertState.buttonText}
        />

        {/* Modal de Confirmação */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-2xl transform transition-all">
              {/* Ícone */}
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {confirmAction.title}
              </h2>

              {/* Mensagem */}
              <p className="text-gray-600 mb-6">
                {confirmAction.message}
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-lg transition font-medium hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmAction.onConfirm()
                    setConfirmAction(null)
                  }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg transition font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes / Ações */}
        {showModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Detalhes do Saque</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">ID do Saque</p>
                    <p className="font-mono text-slate-800">{selectedWithdrawal.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Vendedor</p>
                    <p className="font-medium text-slate-800">
                      {selectedWithdrawal.seller || selectedWithdrawal.sellerName || `Vendedor #${selectedWithdrawal.sellerId || selectedWithdrawal.userId}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Valor</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {(selectedWithdrawal.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    {getStatusBadge(selectedWithdrawal.status)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Banco</p>
                    <p className="text-slate-800">{selectedWithdrawal.bank || selectedWithdrawal.bankAccount || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Agência / Conta</p>
                    <p className="text-slate-800">
                      {selectedWithdrawal.agency && selectedWithdrawal.account
                        ? `${selectedWithdrawal.agency} / ${selectedWithdrawal.account}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Data da Solicitação</p>
                    <p className="text-slate-800">
                      {selectedWithdrawal.requestDate
                        ? new Date(selectedWithdrawal.requestDate).toLocaleString('pt-BR')
                        : selectedWithdrawal.createdAt
                        ? new Date(selectedWithdrawal.createdAt).toLocaleString('pt-BR')
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedWithdrawal.processedDate && (
                    <div>
                      <p className="text-sm text-slate-600">Data de Processamento</p>
                      <p className="text-slate-800">
                        {new Date(selectedWithdrawal.processedDate).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.rejectReason && (
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-semibold mb-1">Motivo da Rejeição:</p>
                    <p className="text-red-900">{selectedWithdrawal.rejectReason}</p>
                  </div>
                )}

                {showRejectField && selectedWithdrawal.status === 'pending' && (
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-red-800 mb-2">
                      Motivo da Rejeição (obrigatório):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Digite o motivo da rejeição..."
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
                {selectedWithdrawal.status === 'pending' && !showRejectField && (
                  <>
                    <button
                      onClick={() => confirmApprove(selectedWithdrawal.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      disabled={processing}
                    >
                      {processing ? 'Processando...' : '✅ Aprovar Saque'}
                    </button>
                    <button
                      onClick={() => setShowRejectField(true)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      disabled={processing}
                    >
                      ❌ Rejeitar Saque
                    </button>
                  </>
                )}

                {selectedWithdrawal.status === 'pending' && showRejectField && (
                  <>
                    <button
                      onClick={() => setShowRejectField(false)}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
                      disabled={processing}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => confirmReject(selectedWithdrawal.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      disabled={processing}
                    >
                      {processing ? 'Processando...' : '❌ Confirmar Rejeição'}
                    </button>
                  </>
                )}

                {selectedWithdrawal.status !== 'pending' && (
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setShowRejectField(false)
                      setRejectReason('')
                    }}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  )
}
