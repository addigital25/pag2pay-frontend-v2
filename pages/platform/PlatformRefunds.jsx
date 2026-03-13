import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'
import config from '../../config'

export default function PlatformRefunds() {
  const [refunds, setRefunds] = useState([])
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAction, setRefundAction] = useState(null) // 'approve' ou 'reject'
  const [refundReason, setRefundReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [loadingRefunds, setLoadingRefunds] = useState(false)
  const [processingRefund, setProcessingRefund] = useState(false)

  // Hook de alerta
  const { alertState, showAlert, hideAlert } = useAlert()

  // State para confirmação
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  })

  // Carregar reembolsos ao montar o componente
  useEffect(() => {
    loadRefunds()
  }, [])

  // Carregar reembolsos pendentes
  const loadRefunds = async () => {
    try {
      setLoadingRefunds(true)
      const response = await fetch(`${config.apiUrl}/api/refunds/pending`)
      const data = await response.json()

      if (data.success) {
        setRefunds(data.refunds || [])
      }
    } catch (error) {
      console.error('Erro ao carregar reembolsos:', error)
    } finally {
      setLoadingRefunds(false)
    }
  }

  // Abrir modal de detalhes do reembolso
  const openRefundDetails = async (refund) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/refunds/${refund.id}`)
      const data = await response.json()

      if (data.success) {
        setSelectedRefund(data.refund)
        setShowRefundModal(true)
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do reembolso:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao carregar detalhes do reembolso',
        type: 'error'
      })
    }
  }

  // Aprovar reembolso
  const handleApproveRefund = () => {
    if (!selectedRefund) return

    setConfirmState({
      isOpen: true,
      title: 'Confirmar Aprovação',
      message: 'Tem certeza que deseja aprovar este reembolso? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })

        try {
          setProcessingRefund(true)
          const response = await fetch(`${config.apiUrl}/api/refunds/${selectedRefund.id}/approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              adminNotes: adminNotes
            })
          })

          const data = await response.json()

          if (data.success) {
            showAlert({
              title: 'Sucesso',
              message: 'Reembolso aprovado com sucesso!',
              type: 'success'
            })
            setShowRefundModal(false)
            setRefundAction(null)
            setAdminNotes('')
            setSelectedRefund(null)
            loadRefunds() // Recarregar lista
          } else {
            showAlert({
              title: 'Erro',
              message: data.error || 'Erro ao aprovar reembolso',
              type: 'error'
            })
          }
        } catch (error) {
          console.error('Erro ao aprovar reembolso:', error)
          showAlert({
            title: 'Erro',
            message: 'Erro ao aprovar reembolso',
            type: 'error'
          })
        } finally {
          setProcessingRefund(false)
        }
      }
    })
  }

  // Recusar reembolso
  const handleRejectRefund = () => {
    if (!selectedRefund) return

    if (!refundReason || refundReason.trim() === '') {
      showAlert({
        title: 'Campo Obrigatório',
        message: 'Por favor, informe o motivo da recusa',
        type: 'warning'
      })
      return
    }

    setConfirmState({
      isOpen: true,
      title: 'Confirmar Recusa',
      message: 'Tem certeza que deseja recusar este reembolso?',
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })

        try {
          setProcessingRefund(true)
          const response = await fetch(`${config.apiUrl}/api/refunds/${selectedRefund.id}/reject`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              rejectionReason: refundReason,
              adminNotes: adminNotes
            })
          })

          const data = await response.json()

          if (data.success) {
            showAlert({
              title: 'Sucesso',
              message: 'Reembolso recusado com sucesso!',
              type: 'success'
            })
            setShowRefundModal(false)
            setRefundAction(null)
            setRefundReason('')
            setAdminNotes('')
            setSelectedRefund(null)
            loadRefunds() // Recarregar lista
          } else {
            showAlert({
              title: 'Erro',
              message: data.error || 'Erro ao recusar reembolso',
              type: 'error'
            })
          }
        } catch (error) {
          console.error('Erro ao recusar reembolso:', error)
          showAlert({
            title: 'Erro',
            message: 'Erro ao recusar reembolso',
            type: 'error'
          })
        } finally {
          setProcessingRefund(false)
        }
      }
    })
  }

  return (
    <PlatformLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Reembolsos</h1>
              <p className="text-slate-600 mt-2">Gerencie as solicitações de reembolso dos clientes</p>
            </div>
            <button
              onClick={loadRefunds}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingRefunds ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-slate-600 mt-4">Carregando reembolsos...</p>
          </div>
        ) : refunds.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">✅ Nenhum reembolso pendente</h3>
            <p className="text-slate-600">Todos os reembolsos foram processados</p>
          </div>
        ) : (
          /* Refunds List */
          <div className="space-y-4">
            {refunds.map((refund) => (
              <div key={refund.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl font-semibold text-slate-800">
                        Pedido #{refund.orderNumber || refund.id.substring(0, 8)}
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Reembolso Pendente
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">👤 Cliente</p>
                        <p className="font-medium text-slate-800">{refund.customerName}</p>
                        <p className="text-slate-500 text-xs">{refund.customerEmail}</p>
                      </div>

                      <div>
                        <p className="text-slate-600">🛍️ Produto</p>
                        <p className="font-medium text-slate-800">{refund.productName}</p>
                      </div>

                      <div>
                        <p className="text-slate-600">💰 Valor</p>
                        <p className="font-bold text-red-600 text-lg">
                          R$ {((refund.totalAmount || 0) / 100).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-600">💳 Método</p>
                        <p className="font-medium text-slate-800">
                          {refund.paymentMethod === 'pix' ? 'PIX' :
                           refund.paymentMethod === 'boleto' ? 'Boleto' :
                           refund.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                           refund.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-slate-600 text-sm mb-1">📝 Motivo do Reembolso:</p>
                      <p className="text-slate-800">
                        {refund.refundReason && refund.refundReason.length > 150
                          ? `${refund.refundReason.substring(0, 150)}...`
                          : refund.refundReason || 'Não informado'}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-slate-500 text-xs">
                        📅 Solicitado em: {refund.refundRequestedAt
                          ? new Date(refund.refundRequestedAt).toLocaleString('pt-BR')
                          : 'Data não disponível'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openRefundDetails(refund)}
                    className="ml-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalhes do Reembolso */}
        {showRefundModal && selectedRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">
                  📋 Detalhes do Reembolso
                </h2>
                <p className="text-slate-600">Pedido #{selectedRefund.orderNumber || selectedRefund.id.substring(0, 8)}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Informações do Pedido */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">📦 INFORMAÇÕES DO PEDIDO</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">ID do Pedido</p>
                      <p className="font-mono text-slate-800">{selectedRefund.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Data da Compra</p>
                      <p className="text-slate-800">
                        {new Date(selectedRefund.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {selectedRefund.paidAt && (
                      <div>
                        <p className="text-slate-600">Data do Pagamento</p>
                        <p className="text-slate-800">
                          {new Date(selectedRefund.paidAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-600">Solicitação de Reembolso</p>
                      <p className="text-slate-800">
                        {selectedRefund.refundRequestedAt
                          ? new Date(selectedRefund.refundRequestedAt).toLocaleString('pt-BR')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cliente */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">👤 CLIENTE</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-600">Nome</p>
                      <p className="font-medium text-slate-800">{selectedRefund.customerInfo?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Email</p>
                      <p className="text-slate-800">{selectedRefund.customerInfo?.email}</p>
                    </div>
                    {selectedRefund.customerInfo?.phone && (
                      <div>
                        <p className="text-slate-600">Telefone</p>
                        <p className="text-slate-800">{selectedRefund.customerInfo.phone}</p>
                      </div>
                    )}
                    {selectedRefund.customerInfo?.document && (
                      <div>
                        <p className="text-slate-600">CPF/CNPJ</p>
                        <p className="text-slate-800">{selectedRefund.customerInfo.document}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Produto */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">🛍️ PRODUTO</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-600">Nome</p>
                      <p className="font-medium text-slate-800">{selectedRefund.productInfo?.name}</p>
                    </div>
                    {selectedRefund.productInfo?.code && (
                      <div>
                        <p className="text-slate-600">Código</p>
                        <p className="font-mono text-slate-800">{selectedRefund.productInfo.code}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-600">Vendedor</p>
                      <p className="text-slate-800">{selectedRefund.sellerInfo?.name || 'N/A'}</p>
                      <p className="text-slate-500 text-xs">{selectedRefund.sellerInfo?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Valores */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">💰 VALORES</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-600">Valor do Produto</p>
                      <p className="text-2xl font-bold text-slate-800">
                        R$ {((selectedRefund.totalAmount || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Método de Pagamento</p>
                      <p className="font-medium text-slate-800">
                        {selectedRefund.paymentMethod === 'pix' ? 'PIX' :
                         selectedRefund.paymentMethod === 'boleto' ? 'Boleto' :
                         selectedRefund.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                         selectedRefund.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Status do Pagamento</p>
                      <p className="text-green-600 font-semibold">✅ Pago</p>
                    </div>
                    {selectedRefund.transactionId && (
                      <div>
                        <p className="text-slate-600">Transaction ID Pagar.me</p>
                        <p className="font-mono text-xs text-slate-800">{selectedRefund.transactionId}</p>
                      </div>
                    )}
                    {selectedRefund.sellerAmount && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-slate-600 font-semibold mb-2">Splits:</p>
                        <div className="space-y-1 text-xs">
                          <p>• Vendedor: R$ {((selectedRefund.sellerAmount || 0) / 100).toFixed(2)}</p>
                          <p>• Plataforma: R$ {(((selectedRefund.totalAmount || 0) - (selectedRefund.sellerAmount || 0)) / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo do Reembolso */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-3">📝 MOTIVO DO REEMBOLSO</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">
                    {selectedRefund.refundInfo?.reason || selectedRefund.refundReason || 'Não informado'}
                  </p>
                  <div className="mt-3 text-sm">
                    <p className="text-slate-600">Solicitado por: {selectedRefund.refundInfo?.requestedBy || 'Cliente'}</p>
                    <p className="text-slate-600">
                      Data: {selectedRefund.refundInfo?.requestedAt
                        ? new Date(selectedRefund.refundInfo.requestedAt).toLocaleString('pt-BR')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Observação do Admin */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">💬 ADICIONAR OBSERVAÇÃO (Opcional)</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Observação interna para registro (não visível ao cliente)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Ação: Aprovar ou Recusar */}
                {!refundAction ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setRefundAction('approve')}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      ✅ APROVAR REEMBOLSO
                    </button>
                    <button
                      onClick={() => setRefundAction('reject')}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      ❌ RECUSAR REEMBOLSO
                    </button>
                  </div>
                ) : refundAction === 'approve' ? (
                  <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                    <h3 className="font-bold text-green-800 mb-3">⚠️ CONFIRMAR APROVAÇÃO DE REEMBOLSO</h3>
                    <p className="text-sm text-green-800 mb-4">
                      Você está prestes a aprovar o reembolso de <strong>R$ {((selectedRefund.totalAmount || 0) / 100).toFixed(2)}</strong>.
                      O valor será estornado ao cliente e deduzido do vendedor.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setRefundAction(null)}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
                        disabled={processingRefund}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleApproveRefund}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                        disabled={processingRefund}
                      >
                        {processingRefund ? 'Processando...' : '✅ Sim, Aprovar Reembolso'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-red-600 rounded-lg p-4 bg-red-50">
                    <h3 className="font-bold text-red-800 mb-3">❌ CONFIRMAR RECUSA DE REEMBOLSO</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-red-800 mb-2">
                        Motivo da recusa (obrigatório):
                      </label>
                      <textarea
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Digite o motivo da recusa do reembolso..."
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                        rows={4}
                      />
                      <p className="text-xs text-red-700 mt-2">
                        💡 Sugestões: Produto já entregue, Fora do prazo, Produto digital já utilizado
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setRefundAction(null)
                          setRefundReason('')
                        }}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
                        disabled={processingRefund}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRejectRefund}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                        disabled={processingRefund}
                      >
                        {processingRefund ? 'Processando...' : '❌ Confirmar Recusa'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => {
                    setShowRefundModal(false)
                    setRefundAction(null)
                    setRefundReason('')
                    setAdminNotes('')
                  }}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                  disabled={processingRefund}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AlertModal */}
        <AlertModal
          isOpen={alertState.isOpen}
          onClose={hideAlert}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          buttonText={alertState.buttonText}
        />

        {/* Modal de Confirmação */}
        {confirmState.isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
            onClick={() => setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone */}
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {confirmState.title}
              </h2>

              {/* Mensagem */}
              <p className="text-gray-600 mb-6 text-center">
                {confirmState.message}
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmState.onConfirm}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  )
}
