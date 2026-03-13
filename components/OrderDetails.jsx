import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PixIcon from './PixIcon'
import AlertModal from './AlertModal'
import ConfirmModal from './ConfirmModal'
import { useAlert } from '../hooks/useAlert'

export default function OrderDetails({ orderId, onClose, isAdminView = false }) {
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detalhes')
  const [commissions, setCommissions] = useState([])
  const [loadingCommissions] = useState(false)

  // Form states
  const [showTrackingForm, setShowTrackingForm] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [showBoletoForm, setShowBoletoForm] = useState(false)
  const [showPhoneEditForm, setShowPhoneEditForm] = useState(false)
  const [newPhone, setNewPhone] = useState('')

  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  })

  const [trackingCode, setTrackingCode] = useState('')
  const [carrier, setCarrier] = useState('Correios')
  const [cancelReason, setCancelReason] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [newBoletoDate, setNewBoletoDate] = useState('')
  const [newBoletoUrl, setNewBoletoUrl] = useState(null) // 🆕 URL do boleto alterado

  // 🆕 States para rastreio dos Correios
  const [trackingInfo, setTrackingInfo] = useState(null)
  const [loadingTracking, setLoadingTracking] = useState(false)
  const [lastTrackingUpdate, setLastTrackingUpdate] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  // 🆕 Buscar rastreio automaticamente quando abrir aba "rastreio"
  useEffect(() => {
    if (order && order.trackingCode && activeTab === 'rastreio') {
      fetchCorreiosTracking()
    }
  }, [order, activeTab])

  // 🆕 Buscar comissões automaticamente quando abrir aba "comissoes"
  useEffect(() => {
    if (order && activeTab === 'comissoes') {
      fetchCommissions()
    }
  }, [order, activeTab])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}`)
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Erro ao carregar pedido:', error)
    }
    setLoading(false)
  }

  // 🆕 Função para buscar rastreio dos Correios
  const fetchCorreiosTracking = async () => {
    if (!order?.trackingCode) return

    setLoadingTracking(true)
    try {
      const response = await fetch(
        `https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/correios-tracking`
      )
      const data = await response.json()

      if (response.ok) {
        setTrackingInfo(data)
        setLastTrackingUpdate(new Date())
      } else {
        console.error('Erro ao buscar rastreio:', data.error)
        setTrackingInfo(null)
      }
    } catch (error) {
      console.error('Erro ao buscar rastreio:', error)
      setTrackingInfo(null)
    }
    setLoadingTracking(false)
  }

  // 🆕 Função para buscar comissões do pedido
  const fetchCommissions = async () => {
    setLoadingCommissions(true)
    try {
      const response = await fetch(
        `https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/commissions`
      )
      const data = await response.json()

      if (response.ok) {
        setCommissions(data.commissions || [])
      } else {
        console.error('Erro ao buscar comissões:', data.error)
        setCommissions([])
      }
    } catch (error) {
      console.error('Erro ao buscar comissões:', error)
      setCommissions([])
    }
    setLoadingCommissions(false)
  }

  // Helper: Retornar ícone e cor baseado no tipo
  const getCommissionStyle = (type) => {
    switch (type) {
      case 'platform':
        return {
          icon: '🏢',
          label: 'Plataforma',
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          description: 'Taxa da plataforma'
        }
      case 'manager':
        return {
          icon: '🎯',
          label: 'Gerente',
          color: 'purple',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          description: 'Comissão do gerente'
        }
      case 'affiliate':
        return {
          icon: '🏆',
          label: 'Afiliado',
          color: 'orange',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          description: 'Comissão do afiliado'
        }
      case 'supplier':
        return {
          icon: '📦',
          label: 'Fornecedor (Frete)',
          color: 'blue',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          description: 'Valor fixo para o fornecedor'
        }
      case 'producer':
        return {
          icon: '💰',
          label: 'Produtor',
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          description: 'Valor líquido do produtor'
        }
      default:
        return {
          icon: '❓',
          label: 'Outro',
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          description: 'Outro tipo'
        }
    }
  }

  const handleAddTracking = () => {
    if (!trackingCode) {
      showAlert({
        title: 'Atenção',
        message: 'Preencha o código de rastreio',
        type: 'warning'
      })
      return
    }

    setConfirmModal({
      isOpen: true,
      title: 'Adicionar Código de Rastreio',
      message: `Deseja adicionar o código ${trackingCode} da transportadora ${carrier}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackingCode, carrier })
          })

          showAlert({
            title: 'Sucesso!',
            message: 'Código de rastreio adicionado!',
            type: 'success'
          })
          setShowTrackingForm(false)
          setTrackingCode('')
          fetchOrderDetails()
        } catch (error) {
          showAlert({
            title: 'Erro',
            message: 'Erro ao adicionar rastreio',
            type: 'error'
          })
        }
      }
    })
  }

  const handleConfirmDelivery = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Entrega',
      message: 'Deseja confirmar que o produto foi entregue ao cliente? Esta ação não pode ser desfeita.',
      type: 'success',
      onConfirm: async () => {
        try {
          await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/confirm-delivery`, {
            method: 'POST'
          })

          showAlert({
            title: 'Sucesso!',
            message: 'Entrega confirmada!',
            type: 'success'
          })
          fetchOrderDetails()
        } catch (error) {
          showAlert({
            title: 'Erro',
            message: 'Erro ao confirmar entrega',
            type: 'error'
          })
        }
      }
    })
  }

  const handleCancelOrder = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Venda',
      message: 'Tem certeza que deseja cancelar esta venda? Esta ação não pode ser desfeita e o cliente será notificado.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/cancel`, {
            method: 'POST'
          })

          showAlert({
            title: 'Sucesso!',
            message: 'Venda cancelada!',
            type: 'success'
          })
          fetchOrderDetails()
        } catch (error) {
          showAlert({
            title: 'Erro',
            message: 'Erro ao cancelar venda',
            type: 'error'
          })
        }
      }
    })
  }

  const handleRequestCancellation = async () => {
    if (!cancelReason || cancelReason.length < 20) {
      showAlert({
        title: 'Atenção',
        message: 'A justificativa deve ter no mínimo 20 caracteres',
        type: 'warning'
      })
      return
    }

    // Se for admin, executa cancelamento direto com confirmação
    if (isAdminView) {
      setConfirmModal({
        isOpen: true,
        title: 'Executar Cancelamento',
        message: `Confirma o cancelamento desta venda?\n\nMotivo: ${cancelReason}`,
        type: 'danger',
        onConfirm: async () => {
          try {
            await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/cancel`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: cancelReason, isAdmin: true })
            })

            showAlert({
              title: 'Sucesso!',
              message: 'Venda cancelada pelo administrador!',
              type: 'success'
            })
            setShowCancelForm(false)
            setCancelReason('')
            fetchOrderDetails()
          } catch (error) {
            showAlert({
              title: 'Erro',
              message: 'Erro ao cancelar venda',
              type: 'error'
            })
          }
        }
      })
      return
    }

    // Se não for admin, solicita aprovação (comportamento original)
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/request-cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      })

      showAlert({
        title: 'Sucesso!',
        message: 'Solicitação de cancelamento enviada para aprovação do admin',
        type: 'success'
      })
      setShowCancelForm(false)
      setCancelReason('')
      fetchOrderDetails()
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao solicitar cancelamento',
        type: 'error'
      })
    }
  }

  const handleRequestRefund = async () => {
    if (!refundReason || refundReason.length < 20) {
      showAlert({
        title: 'Atenção',
        message: 'A justificativa deve ter no mínimo 20 caracteres',
        type: 'warning'
      })
      return
    }

    // Se for admin, executa estorno direto com confirmação
    if (isAdminView) {
      setConfirmModal({
        isOpen: true,
        title: 'Executar Estorno',
        message: `Confirma o estorno desta venda?\n\nMotivo: ${refundReason}\n\nO valor será devolvido ao cliente.`,
        type: 'danger',
        onConfirm: async () => {
          try {
            await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/refund`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: refundReason, isAdmin: true })
            })

            showAlert({
              title: 'Sucesso!',
              message: 'Estorno executado pelo administrador!',
              type: 'success'
            })
            setShowRefundForm(false)
            setRefundReason('')
            fetchOrderDetails()
          } catch (error) {
            showAlert({
              title: 'Erro',
              message: 'Erro ao executar estorno',
              type: 'error'
            })
          }
        }
      })
      return
    }

    // Se não for admin, solicita aprovação (comportamento original)
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/request-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason })
      })

      showAlert({
        title: 'Sucesso!',
        message: 'Solicitação de estorno enviada para aprovação do admin',
        type: 'success'
      })
      setShowRefundForm(false)
      setRefundReason('')
      fetchOrderDetails()
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao solicitar estorno',
        type: 'error'
      })
    }
  }

  const handleUpdatePhone = async () => {
    if (!newPhone || newPhone.trim().length < 10) {
      showAlert({
        title: 'Atenção',
        message: 'Digite um telefone válido',
        type: 'warning'
      })
      return
    }

    setConfirmModal({
      isOpen: true,
      title: 'Alterar Telefone do Cliente',
      message: `Deseja alterar o telefone do cliente para:\n\n${newPhone}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/update-phone`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: newPhone })
          })

          const data = await response.json()

          if (response.ok) {
            showAlert({
              title: 'Sucesso!',
              message: 'Telefone atualizado com sucesso!',
              type: 'success'
            })
            setShowPhoneEditForm(false)
            setNewPhone('')
            fetchOrderDetails()
          } else {
            showAlert({
              title: 'Erro',
              message: data.error || 'Erro ao atualizar telefone',
              type: 'error'
            })
          }
        } catch (error) {
          showAlert({
            title: 'Erro',
            message: 'Erro ao atualizar telefone',
            type: 'error'
          })
        }
      }
    })
  }

  const handleUpdateBoleto = () => {
    if (!newBoletoDate) {
      showAlert({
        title: 'Atenção',
        message: 'Selecione a nova data de vencimento',
        type: 'warning'
      })
      return
    }

    setConfirmModal({
      isOpen: true,
      title: 'Alterar Data do Boleto',
      message: `Deseja gerar um novo boleto com vencimento em ${new Date(newBoletoDate).toLocaleDateString('pt-BR')}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/orders/${orderId}/update-boleto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newDueDate: newBoletoDate })
          })

          const data = await response.json()

          if (response.ok && data.boletoUrl) {
            // Salvar URL do novo boleto
            setNewBoletoUrl(data.boletoUrl)
          }

          showAlert({
            title: 'Sucesso!',
            message: 'Novo boleto gerado!',
            type: 'success'
          })

          setShowBoletoForm(false)
          setNewBoletoDate('')
          fetchOrderDetails()
        } catch (error) {
          showAlert({
            title: 'Erro',
            message: 'Erro ao gerar novo boleto',
            type: 'error'
          })
        }
      }
    })
  }

  const handleDownloadBoleto = () => {
    if (newBoletoUrl) {
      window.open(newBoletoUrl, '_blank')
    }
  }

  const copyCheckoutLink = () => {
    // Criar parâmetros com os dados do cliente
    const params = new URLSearchParams({
      name: order.customer.name || '',
      email: order.customer.email || '',
      phone: order.customer.phone || '',
      cpf: order.customer.cpf || '',
      zipCode: order.shipping?.zipCode || '',
      address: order.shipping?.address || '',
      number: order.shipping?.number || '',
      complement: order.shipping?.complement || '',
      neighborhood: order.shipping?.neighborhood || '',
      city: order.shipping?.city || '',
      state: order.shipping?.state || ''
    })

    // Adicionar plano se existir
    if (order.plan?.code) {
      params.append('plan', order.plan.code)
    }

    const url = `${window.location.origin}/checkout/${order.productId}?${params.toString()}`
    navigator.clipboard.writeText(url)
    showAlert({
      title: 'Sucesso!',
      message: 'Link copiado com dados do cliente!',
      type: 'success'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!order) return null

  const isProducer = user.id === order.producerId
  const isPaid = order.paymentStatus === 'paid'
  const isScheduled = order.paymentMethod === 'afterPay' && order.paymentStatus === 'scheduled'
  const isPending = order.paymentMethod === 'afterPay' && order.paymentStatus === 'pending_payment'
  const isOverdue = order.paymentMethod === 'afterPay' && order.paymentStatus === 'overdue'
  const isFrustrated = order.paymentMethod === 'afterPay' && order.paymentStatus === 'frustrated'
  const isBoleto = order.paymentMethod === 'boleto' && order.paymentStatus === 'pending'

  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Agendado' },
      pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Aguardando Pagamento' },
      overdue: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Atrasado' },
      frustrated: { bg: 'bg-red-100', text: 'text-red-800', label: 'Frustrado' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    }
    const s = statusMap[status] || statusMap.pending
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    )
  }

  const getPaymentMethodIcon = (method) => {
    if (method === 'pix') {
      return <PixIcon className="w-5 h-5 inline" />
    }
    const icons = {
      boleto: '🏦',
      creditCard: '💳',
      afterPay: '🚚'
    }
    return icons[method] || '💰'
  }

  const tabs = [
    { id: 'detalhes', label: 'Detalhes' },
    { id: 'itens', label: 'Itens' },
    { id: 'comprador', label: 'Comprador' },
    { id: 'rastreio', label: 'Rastreio' },
    { id: 'pagamentos', label: 'Pagamentos' },
    { id: 'comissoes', label: 'Comissões' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Pedido #{order.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {order.productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab: Detalhes */}
          {activeTab === 'detalhes' && (
            <div className="space-y-6">
              {/* Tabela de Informações */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">Status do Pagamento</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{getStatusBadge(order.paymentStatus)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Valor Total</td>
                      <td className="px-4 py-3 text-base font-bold text-gray-900">
                        R$ {order.totalValue.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Data do Pedido</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                    {order.paidAt && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Data do Pagamento</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(order.paidAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              {isProducer && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Ações</h3>
                  <div className="flex flex-col items-start gap-2">

                    {/* Copiar Checkout - ALL statuses except PAGO */}
                    {/* Admin vê TODOS os botões, usuário normal vê condicionalmente */}
                    {(isAdminView || !isPaid) && (
                      <button
                        onClick={copyCheckoutLink}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 inline-flex items-center gap-2"
                      >
                        🔗 Copiar Link Checkout
                      </button>
                    )}

                    {/* AGENDADO specific buttons - Admin vê sempre */}
                    {(isAdminView || isScheduled) && (
                      <>
                        <button
                          onClick={() => setShowTrackingForm(!showTrackingForm)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          🚚 Adicionar Código Rastreio
                        </button>

                      {showTrackingForm && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <input
                            type="text"
                            placeholder="Código de rastreio"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option>Correios</option>
                            <option>Jadlog</option>
                            <option>Total Express</option>
                          </select>
                          <button
                            onClick={handleAddTracking}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Salvar
                          </button>
                        </div>
                      )}

                        <button
                          onClick={handleConfirmDelivery}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 inline-flex items-center gap-2"
                        >
                          ✅ Confirmar Entrega
                        </button>

                        <button
                          onClick={handleCancelOrder}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 inline-flex items-center gap-2"
                        >
                          ❌ Cancelar Venda
                        </button>
                      </>
                    )}

                    {/* FRUSTRADO - Solicitar Cancelamento - Admin vê sempre */}
                    {(isAdminView || isFrustrated) && (
                      <>
                        <button
                          onClick={() => setShowCancelForm(!showCancelForm)}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 inline-flex items-center gap-2"
                        >
                          ❌ {isAdminView ? 'Cancelar Pedido' : 'Solicitar Cancelamento'}
                        </button>

                      {showCancelForm && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <textarea
                            placeholder="Justificativa detalhada (mínimo 20 caracteres)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg h-24"
                          />
                          <button
                            onClick={handleRequestCancellation}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            {isAdminView ? 'Executar Cancelamento' : 'Enviar Solicitação'}
                          </button>
                        </div>
                        )}
                      </>
                    )}

                    {/* PAGO - Adicionar Código de Rastreio e Solicitar Estorno - Admin vê sempre */}
                    {(isAdminView || isPaid) && (
                      <>
                        <button
                          onClick={() => setShowTrackingForm(!showTrackingForm)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          🚚 Adicionar Código Rastreio
                        </button>

                      {showTrackingForm && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <input
                            type="text"
                            placeholder="Código de rastreio"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option>Correios</option>
                            <option>Jadlog</option>
                            <option>Total Express</option>
                          </select>
                          <button
                            onClick={handleAddTracking}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Salvar
                          </button>
                        </div>
                      )}

                        <button
                          onClick={() => setShowRefundForm(!showRefundForm)}
                          className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 inline-flex items-center gap-2"
                        >
                          🔄 {isAdminView ? 'Executar Estorno' : 'Solicitar Estorno'}
                        </button>

                      {showRefundForm && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <textarea
                            placeholder="Justificativa detalhada (mínimo 20 caracteres)"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg h-24"
                          />
                          <button
                            onClick={handleRequestRefund}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                          >
                            {isAdminView ? 'Confirmar Estorno' : 'Enviar Solicitação'}
                          </button>
                        </div>
                        )}
                      </>
                    )}

                    {/* BOLETO - Alterar Data - Admin vê sempre */}
                    {(isAdminView || isBoleto) && (
                      <>
                        <button
                          onClick={() => setShowBoletoForm(!showBoletoForm)}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 inline-flex items-center gap-2"
                        >
                          📅 Alterar Data Boleto
                        </button>

                      {showBoletoForm && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <input
                            type="date"
                            value={newBoletoDate}
                            onChange={(e) => setNewBoletoDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <button
                            onClick={handleUpdateBoleto}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Gerar Novo Boleto
                          </button>
                        </div>
                        )}

                        {/* 🆕 Botão para baixar boleto alterado */}
                        {newBoletoUrl && (
                          <button
                            onClick={handleDownloadBoleto}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 inline-flex items-center gap-2"
                          >
                            📄 Baixar Boleto Alterado
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Itens */}
          {activeTab === 'itens' && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">Produto</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{order.productName}</td>
                  </tr>
                  {order.plan && (
                    <>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Plano</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.plan.name}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Quantidade</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.plan.itemsQuantity || order.quantity || 1}</td>
                      </tr>
                    </>
                  )}
                  {!order.plan && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Quantidade</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.quantity}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Preço Unitário</td>
                    <td className="px-4 py-3 text-base font-bold text-gray-900">
                      R$ {order.productPrice.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Comprador */}
          {activeTab === 'comprador' && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">Nome</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.customer.name}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Email</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.customer.email}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">CPF</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">{order.customer.cpf}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Telefone</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center justify-between">
                          <span>{order.customer.phone}</span>
                          <button
                            onClick={() => {
                              setNewPhone(order.customer.phone || '')
                              setShowPhoneEditForm(true)
                            }}
                            className="ml-3 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Alterar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {order.customer.address && (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Endereço</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.customer.address}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Cidade</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.customer.city} - {order.customer.state}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">CEP</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">{order.customer.zipCode}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {showPhoneEditForm && (
                <div className="mt-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Alterar Telefone do Cliente
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Novo Telefone
                      </label>
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Digite o novo número de telefone com DDD
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdatePhone}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar Alteração
                      </button>
                      <button
                        onClick={() => {
                          setShowPhoneEditForm(false)
                          setNewPhone('')
                        }}
                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab: Rastreio */}
          {activeTab === 'rastreio' && (
            <div className="space-y-4">
              {order.trackingCode ? (
                <>
                  {/* Informações do Rastreio */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">Código de Rastreio</td>
                          <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{order.trackingCode}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Transportadora</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.shippingInfo?.carrier || 'Correios'}</td>
                        </tr>
                        {trackingInfo && trackingInfo.status && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Status Atual</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                trackingInfo.status?.toLowerCase().includes('entregue')
                                  ? 'bg-green-100 text-green-800'
                                  : trackingInfo.status?.toLowerCase().includes('trânsito') || trackingInfo.status?.toLowerCase().includes('transito')
                                  ? 'bg-blue-100 text-blue-800'
                                  : trackingInfo.status?.toLowerCase().includes('saiu para entrega')
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {trackingInfo.status}
                              </span>
                            </td>
                          </tr>
                        )}
                        {lastTrackingUpdate && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Última Atualização</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{lastTrackingUpdate.toLocaleString('pt-BR')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Botão Atualizar */}
                  <div className="flex justify-start">
                    <button
                      onClick={fetchCorreiosTracking}
                      disabled={loadingTracking}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:bg-gray-400 inline-flex items-center gap-2"
                    >
                      {loadingTracking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Atualizando...
                        </>
                      ) : (
                        <>
                          🔄 Atualizar Rastreio
                        </>
                      )}
                    </button>
                  </div>

                  {/* Histórico de Rastreamento */}
                  {loadingTracking ? (
                    <div className="flex items-center justify-center py-12 border rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : trackingInfo && trackingInfo.events?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <h3 className="text-sm font-semibold text-gray-700">Histórico de Rastreamento</h3>
                      </div>
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Data/Hora</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Local</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {trackingInfo.events.map((event, index) => (
                            <tr key={index} className={index === 0 ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'}>
                              <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                                {new Date(event.date).toLocaleString('pt-BR')}
                              </td>
                              <td className={`px-4 py-3 text-xs font-medium ${index === 0 ? 'text-emerald-900' : 'text-gray-900'}`}>
                                {event.status}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-700">
                                {event.location || '-'}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600">
                                {event.description || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border-2 border-yellow-300 rounded-lg p-6 text-center bg-yellow-50">
                      <p className="text-yellow-800 font-medium mb-1">
                        Rastreio não disponível
                      </p>
                      <p className="text-yellow-700 text-sm">
                        Clique em "Atualizar Rastreio" para buscar informações dos Correios
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-12 text-center">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 font-semibold mb-2">
                    Nenhum código de rastreio adicionado
                  </p>
                  <p className="text-gray-500 text-sm">
                    Adicione um código manualmente ou aguarde o envio automático do Notazz
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Pagamentos */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-4">
              {/* Tabela: Informações de Pagamento */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">Forma de Pagamento</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.paymentMethod === 'pix' && '💳 PIX'}
                        {order.paymentMethod === 'boleto' && '📄 Boleto Bancário'}
                        {order.paymentMethod === 'creditCard' && '💳 Cartão de Crédito'}
                        {order.paymentMethod === 'afterPay' && '🚚 Receba e Pague'}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Status do Pagamento</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{getStatusBadge(order.paymentStatus)}</td>
                    </tr>

                    {/* Detalhes do Cartão de Crédito */}
                    {order.paymentMethod === 'creditCard' && order.cardDetails && (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Status da Transação</td>
                          <td className="px-4 py-3 text-sm">
                            {order.cardDetails.status === 'approved' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Aprovado
                              </span>
                            )}
                            {order.cardDetails.status === 'declined' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Recusado
                              </span>
                            )}
                          </td>
                        </tr>
                        {order.cardDetails.authorizationCode && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Código de Autorização</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{order.cardDetails.authorizationCode}</td>
                          </tr>
                        )}
                        {order.cardDetails.tid && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">TID</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{order.cardDetails.tid}</td>
                          </tr>
                        )}
                        {order.cardDetails.nsu && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">NSU</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{order.cardDetails.nsu}</td>
                          </tr>
                        )}
                        {order.cardDetails.declineReason && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Motivo da Recusa</td>
                            <td className="px-4 py-3 text-sm text-red-600">{order.cardDetails.declineReason}</td>
                          </tr>
                        )}
                        {order.cardDetails.brand && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Bandeira</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{order.cardDetails.brand}</td>
                          </tr>
                        )}
                        {order.cardDetails.lastFourDigits && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Últimos 4 Dígitos</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">**** {order.cardDetails.lastFourDigits}</td>
                          </tr>
                        )}
                        {order.cardDetails.installments && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Parcelas</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{order.cardDetails.installments}x</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tabela: Valores */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">Valor Total</td>
                      <td className="px-4 py-3 text-base font-bold text-gray-900">
                        R$ {order.totalValue.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                    {order.producerCommission && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Comissão do Produtor</td>
                        <td className="px-4 py-3 text-base font-semibold text-green-600">
                          R$ {order.producerCommission.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    )}
                    {order.affiliateCommission > 0 && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">Comissão do Afiliado</td>
                        <td className="px-4 py-3 text-base font-semibold text-blue-600">
                          R$ {order.affiliateCommission.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Comissões */}
          {activeTab === 'comissoes' && (
            <div className="space-y-4">
              {/* Header com informação */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">Ordem de Distribuição</p>
                  <p className="text-xs text-blue-700 mt-1">
                    As comissões são distribuídas na seguinte ordem: 1º Plataforma, 2º Gerente(s), 3º Afiliado, 4º Fornecedor (se houver), 5º Produtor
                  </p>
                </div>
              </div>

              {/* Loading state */}
              {loadingCommissions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Carregando comissões...</p>
                </div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Nenhuma comissão encontrada</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Este pedido não possui comissões registradas
                  </p>
                </div>
              ) : (
                <>
                  {/* Tabela de Comissões */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ordem</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Participante</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {commissions.map((commission, index) => {
                          const style = getCommissionStyle(commission.type)
                          return (
                            <tr key={commission.id} className="hover:bg-gray-50 transition">
                              {/* Ordem */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{style.icon}</span>
                                  <span className="text-sm font-bold text-gray-600">#{commission.order}</span>
                                </div>
                              </td>

                              {/* Participante */}
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-gray-900">{commission.userName || 'Sistema'}</p>
                                  {commission.userEmail && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-sm text-gray-600">{commission.userEmail}</p>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(commission.userEmail)
                                          showAlert({
                                            title: 'Sucesso!',
                                            message: 'Email copiado!',
                                            type: 'success'
                                          })
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Copiar email"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Tipo */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700">{style.label}</span>
                                  <div className="relative group">
                                    <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </button>
                                    <div className="absolute left-0 top-8 hidden group-hover:block z-10 w-56 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
                                      <p>{style.description}</p>
                                      {commission.percentage && (
                                        <p className="mt-1">Percentual: {commission.percentage}%</p>
                                      )}
                                      {commission.commissionType && (
                                        <p className="mt-1">Tipo: {commission.commissionType === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Valor */}
                              <td className="px-6 py-4 text-right">
                                <span className={`inline-block ${style.bgColor} ${style.textColor} font-bold px-4 py-2 rounded-full`}>
                                  R$ {commission.amount.toFixed(2).replace('.', ',')}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 text-center">
                                {commission.status === 'paid' ? (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Pago
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pendente
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Resumo Total */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Valor Total da Venda</p>
                        <p className="text-2xl font-bold text-indigo-700">
                          R$ {commissions.reduce((sum, c) => sum + c.amount, 0).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Soma de {commissions.length} comissão(ões)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-green-600">Divisão verificada</span>
                      </div>
                    </div>
                  </div>

                  {/* Legenda */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Legenda:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏢</span>
                        <span className="text-sm text-gray-600">Plataforma</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <span className="text-sm text-gray-600">Gerente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <span className="text-sm text-gray-600">Afiliado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <span className="text-sm text-gray-600">Produtor</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </div>
  )
}
