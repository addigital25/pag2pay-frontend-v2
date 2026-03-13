import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'
import config from '../../config'

export default function PlatformFinancial() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')
  const [adquirenteTab, setAdquirenteTab] = useState('lista')
  const [tipoTransacao, setTipoTransacao] = useState('deposito')
  const [loading, setLoading] = useState(true)

  // Estados para drag & drop de adquirentes
  const [pixOrder, setPixOrder] = useState(['Pagar.me', 'Mercado Pago', 'PagSeguro'])
  const [cartaoOrder, setCartaoOrder] = useState(['Pagar.me', 'Cielo'])
  const [boletoOrder, setBoletoOrder] = useState(['Pagar.me', 'Banco do Brasil'])
  const [saqueOrder, setSaqueOrder] = useState(['Pagar.me', 'Mercado Pago'])

  // Dados reais da API
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    monthlyGrowth: 0,
    averageTicket: 0
  })

  const [recentTransactions, setRecentTransactions] = useState([])
  const [payoutSchedule, setPayoutSchedule] = useState([])

  // Estados para Reembolsos
  const [refunds, setRefunds] = useState([])
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAction, setRefundAction] = useState(null) // 'approve' ou 'reject'
  const [refundReason, setRefundReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [loadingRefunds, setLoadingRefunds] = useState(false)
  const [processingRefund, setProcessingRefund] = useState(false)

  // Carregar dados financeiros da API
  useEffect(() => {
    loadFinancialData()
    if (activeTab === 'reembolsos') {
      loadRefunds()
    }
  }, [activeTab])

  const loadFinancialData = async () => {
    try {
      setLoading(true)

      const response = await fetch(`${config.apiUrl}/api/platform/financial-stats`)
      const data = await response.json()

      if (data.success) {
        setFinancialData({
          totalRevenue: data.stats.totalRevenue || 0,
          platformCommission: data.stats.platformCommission || 0,
          totalPayouts: data.stats.totalPayouts || 0,
          pendingPayouts: data.stats.pendingPayouts || 0,
          monthlyGrowth: data.stats.monthlyGrowth || 0,
          averageTicket: data.stats.averageTicket || 0
        })

        setRecentTransactions(data.recentTransactions || [])
        setPayoutSchedule(data.payoutSchedule || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

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
  const handleApproveRefund = async () => {
    if (!selectedRefund) return

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
        setAdminNotes('')
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

  // Recusar reembolso
  const handleRejectRefund = async () => {
    if (!selectedRefund) return

    if (!refundReason || refundReason.trim() === '') {
      showAlert({
        title: 'Atenção',
        message: 'Por favor, informe o motivo da recusa',
        type: 'warning'
      })
      return
    }

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
        setRefundReason('')
        setAdminNotes('')
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

  const getTransactionBadge = (type) => {
    return type === 'commission' ? (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
        Comissão
      </span>
    ) : (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
        Repasse
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-slate-100 text-slate-800'
    }
    const labels = {
      completed: 'Concluído',
      pending: 'Pendente',
      processing: 'Processando',
      scheduled: 'Agendado'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Funções de Drag & Drop
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index)
    e.currentTarget.classList.add('opacity-40')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-40')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex, orderArray, setOrderFunction) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'))

    if (dragIndex === dropIndex) return

    const newOrder = [...orderArray]
    const draggedItem = newOrder[dragIndex]

    newOrder.splice(dragIndex, 1)
    newOrder.splice(dropIndex, 0, draggedItem)

    setOrderFunction(newOrder)
  }

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll('.order-item:not(.opacity-40)')]

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element
  }

  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dados financeiros...</p>
          </div>
        </div>
      </PlatformLayout>
    )
  }

  return (
    <PlatformLayout>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Financeiro da Plataforma</h2>
          <p className="text-slate-600 mt-1">Acompanhe receitas, comissões e repasses</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Receita Total</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">R$ {financialData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm mt-2 opacity-90">
              <span className="text-green-200">↗ +{financialData.monthlyGrowth}%</span> vs mês anterior
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Comissão da Plataforma</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">R$ {financialData.platformCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm mt-2 opacity-90">
              ~3% sobre as vendas
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Repasses Pendentes</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">R$ {financialData.pendingPayouts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm mt-2 opacity-90">
              {payoutSchedule.length} repasses agendados
            </p>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'transactions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Transações
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'payouts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Repasses Agendados
              </button>
              <button
                onClick={() => setActiveTab('adquirentes')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'adquirentes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Adquirentes
              </button>
              <button
                onClick={() => setActiveTab('reembolsos')}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === 'reembolsos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Reembolsos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Visão Geral */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Total Repassado aos Vendedores</p>
                    <p className="text-2xl font-bold text-slate-800">
                      R$ {financialData.totalPayouts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Ticket Médio</p>
                    <p className="text-2xl font-bold text-slate-800">
                      R$ {financialData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>ℹ️ Informação:</strong>
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Os repasses são feitos automaticamente via Pagarme de acordo com o cronograma configurado (D+7, D+14, D+30).
                    A comissão da plataforma é retida automaticamente antes do repasse.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Transações */}
            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                {recentTransactions.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-slate-600">{txn.id}</td>
                          <td className="px-4 py-3">{getTransactionBadge(txn.type)}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{txn.seller}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{txn.product}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            R$ {txn.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{txn.date}</td>
                          <td className="px-4 py-3">{getStatusBadge(txn.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-12 text-center">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-500 font-medium">Nenhuma transação encontrada</p>
                    <p className="text-sm text-slate-400 mt-1">As transações aparecerão aqui quando houver vendas</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Repasses Agendados */}
            {activeTab === 'payouts' && (
              <div className="overflow-x-auto">
                {payoutSchedule.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Agendada</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedores</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payoutSchedule.map((payout, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {new Date(payout.scheduledDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 font-bold text-green-600">
                            R$ {payout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {payout.sellersCount} vendedor(es)
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {payout.ordersCount} pedido(s)
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(payout.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-12 text-center">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-500 font-medium">Nenhum repasse agendado</p>
                    <p className="text-sm text-slate-400 mt-1">Os repasses aparecerão aqui conforme as vendas forem liberadas</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Adquirentes */}
            {activeTab === 'adquirentes' && (
              <div>
                {/* Sub-menu: Lista / Roteamento Inteligente / Conexões */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-6">
                    <button
                      onClick={() => setAdquirenteTab('lista')}
                      className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                        adquirenteTab === 'lista'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Lista de Adquirentes
                    </button>
                    <button
                      onClick={() => setAdquirenteTab('roteamento')}
                      className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                        adquirenteTab === 'roteamento'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Roteamento Inteligente
                    </button>
                    <button
                      onClick={() => setAdquirenteTab('conexoes')}
                      className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                        adquirenteTab === 'conexoes'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Conexões
                    </button>
                  </nav>
                </div>

                {/* Conteúdo: Lista de Adquirentes */}
                {adquirenteTab === 'lista' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Card: Pagar.me */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Pagar.me</h3>
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-1">Ativa</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Métodos:</strong> PIX, Cartão, Boleto, Saque</p>
                          <p><strong>Taxa PIX:</strong> 0.99% + R$ 0,10</p>
                          <p><strong>Taxa Cartão:</strong> 3.99%</p>
                          <p><strong>Última sync:</strong> Há 5 min</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                            Configurar
                          </button>
                          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition">
                            Desativar
                          </button>
                        </div>
                      </div>

                      {/* Card: Mercado Pago */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Mercado Pago</h3>
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-1">Ativa</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Métodos:</strong> PIX, Saque</p>
                          <p><strong>Taxa PIX:</strong> 1.50%</p>
                          <p><strong>Taxa Saque:</strong> R$ 1,50</p>
                          <p><strong>Última sync:</strong> Há 12 min</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                            Configurar
                          </button>
                          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition">
                            Desativar
                          </button>
                        </div>
                      </div>

                      {/* Card: Cielo */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Cielo</h3>
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-1">Ativa</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Métodos:</strong> Cartão</p>
                          <p><strong>Taxa Débito:</strong> 2.49%</p>
                          <p><strong>Taxa Crédito:</strong> 3.99%</p>
                          <p><strong>Última sync:</strong> Há 1 hora</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                            Configurar
                          </button>
                          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition">
                            Desativar
                          </button>
                        </div>
                      </div>

                      {/* Card: PagSeguro */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">PagSeguro</h3>
                              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mt-1">Inativa</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Métodos:</strong> PIX, Cartão, Boleto</p>
                          <p><strong>Taxa PIX:</strong> 1.99%</p>
                          <p><strong>Taxa Cartão:</strong> 4.99%</p>
                          <p><strong>Última sync:</strong> -</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                            Configurar
                          </button>
                          <button className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold rounded-lg transition">
                            Ativar
                          </button>
                        </div>
                      </div>

                      {/* Card: Banco do Brasil */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Banco do Brasil</h3>
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-1">Ativa</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Métodos:</strong> Boleto</p>
                          <p><strong>Taxa Boleto:</strong> R$ 3,49</p>
                          <p><strong>Prazo:</strong> D+2</p>
                          <p><strong>Última sync:</strong> Há 30 min</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                            Configurar
                          </button>
                          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition">
                            Desativar
                          </button>
                        </div>
                      </div>

                      {/* Card: Adicionar Nova */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-dashed border-emerald-300 rounded-lg p-6 hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Adicionar Adquirente</h3>
                        <p className="text-sm text-gray-600">Conecte uma nova adquirente à plataforma</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conteúdo: Roteamento Inteligente */}
                {adquirenteTab === 'roteamento' && (
                  <div>
                    {/* Sub-abas: Depósito / Saque */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-6">
                        <button
                          onClick={() => setTipoTransacao('deposito')}
                          className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                            tipoTransacao === 'deposito'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          Depósito
                        </button>
                        <button
                          onClick={() => setTipoTransacao('saque')}
                          className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                            tipoTransacao === 'saque'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          Saque
                        </button>
                      </nav>
                    </div>

                    {/* Conteúdo: Depósito (3 colunas) */}
                    {tipoTransacao === 'deposito' && (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                          {/* Coluna 1: PIX */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de PIX</h3>
                            <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4">
                              <option>Pagar.me</option>
                              <option>Mercado Pago</option>
                              <option>PagSeguro</option>
                              <option>Stripe</option>
                              <option>Asaas</option>
                            </select>

                            <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para PIX (arraste para reordenar)</label>
                            <div className="space-y-2">
                              {pixOrder.map((item, index) => (
                                <div
                                  key={item}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index, pixOrder, setPixOrder)}
                                  className="order-item flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3 cursor-move hover:bg-gray-50 transition-all duration-200"
                                >
                                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                  </svg>
                                  <span className="flex-1 font-medium text-gray-900">#{index + 1} {item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Coluna 2: Cartão */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de Cartão</h3>
                            <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4">
                              <option>Pagar.me</option>
                              <option>Cielo</option>
                              <option>Rede</option>
                              <option>Stone</option>
                              <option>GetNet</option>
                            </select>

                            <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para cartão (arraste para reordenar)</label>
                            <div className="space-y-2">
                              {cartaoOrder.map((item, index) => (
                                <div
                                  key={item}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index, cartaoOrder, setCartaoOrder)}
                                  className="order-item flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3 cursor-move hover:bg-gray-50 transition-all duration-200"
                                >
                                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                  </svg>
                                  <span className="flex-1 font-medium text-gray-900">#{index + 1} {item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Coluna 3: Boleto */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de Boleto</h3>
                            <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4">
                              <option>Pagar.me</option>
                              <option>Banco do Brasil</option>
                              <option>Bradesco</option>
                              <option>Itaú</option>
                            </select>

                            <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para boleto (arraste para reordenar)</label>
                            <div className="space-y-2">
                              {boletoOrder.map((item, index) => (
                                <div
                                  key={item}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index, boletoOrder, setBoletoOrder)}
                                  className="order-item flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3 cursor-move hover:bg-gray-50 transition-all duration-200"
                                >
                                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                  </svg>
                                  <span className="flex-1 font-medium text-gray-900">#{index + 1} {item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Restaurar Configurações - Depósito */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Restaurar configurações de adquirente dos produtores</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Essa ação irá restaurar todas as configurações específicas de adquirente dos produtores para a configuração padrão da empresa.
                          </p>
                          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-sm">
                            Restaurar
                          </button>
                        </div>
                      </>
                    )}

                    {/* Conteúdo: Saque (1 coluna) */}
                    {tipoTransacao === 'saque' && (
                      <>
                        <div className="max-w-xl mb-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de Saque</h3>
                          <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4">
                            <option>Pagar.me</option>
                            <option>Mercado Pago</option>
                            <option>PagSeguro</option>
                            <option>Stripe</option>
                            <option>Asaas</option>
                          </select>

                          <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para Saque (arraste para reordenar)</label>
                          <div className="space-y-2">
                            {saqueOrder.map((item, index) => (
                              <div
                                key={item}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index, saqueOrder, setSaqueOrder)}
                                className="order-item flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3 cursor-move hover:bg-gray-50 transition-all duration-200"
                              >
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                                <span className="flex-1 font-medium text-gray-900">#{index + 1} {item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Restaurar Configurações - Saque */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Restaurar configurações de adquirentes de saque dos produtores</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Essa ação irá restaurar todas as configurações específicas de adquirentes de saque dos produtores para a configuração padrão da empresa.
                          </p>
                          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-sm">
                            Restaurar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Conteúdo: Conexões */}
                {adquirenteTab === 'conexoes' && (
                  <div>
                    {/* Filtros */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">Filtros <span className="text-gray-500">(1 conexão)</span></h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Nome</label>
                          <input
                            type="text"
                            placeholder="Buscar por nome..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Funcionalidades</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option>Todas</option>
                            <option>Split</option>
                            <option>Pix</option>
                            <option>Cartão</option>
                            <option>Boleto</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Ativas */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Ativas (1)</h3>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Pagar.me - Ativa */}
                        <div className="bg-white border-2 border-emerald-500 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-500">⭐</span>
                                  <h4 className="font-bold text-gray-900">Pagar.me</h4>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Split, Pix, Cartão, Boleto</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Ativo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuradas */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Configuradas (0)</h3>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-500">Nenhuma adquirente configurada</p>
                      </div>
                    </div>

                    {/* Novas */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Novas (0)</h3>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-500">Nenhuma nova adquirente disponível no momento</p>
                      </div>
                    </div>

                    {/* Todas as outras */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Todas as outras (0)</h3>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-500">
                          Outras adquirentes estarão disponíveis em breve.
                          <br />
                          <span className="text-xs text-gray-400">Cada adquirente possui uma integração específica e será adicionada conforme necessário.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reembolsos */}
            {activeTab === 'reembolsos' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Reembolsos Pendentes ({refunds.length})
                  </h3>
                  <button
                    onClick={loadRefunds}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Atualizar
                  </button>
                </div>

                {loadingRefunds ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
                    <p className="text-slate-600 mt-2">Carregando reembolsos...</p>
                  </div>
                ) : refunds.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-600 text-lg">✅ Nenhum reembolso pendente</p>
                    <p className="text-slate-500 text-sm mt-2">Todos os reembolsos foram processados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {refunds.map((refund) => (
                      <div key={refund.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-semibold text-slate-800">
                                Pedido #{refund.orderNumber || refund.id.substring(0, 8)}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                Reembolso Pendente
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
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
                                <p className="font-bold text-red-600">
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

                              <div className="col-span-2">
                                <p className="text-slate-600">📝 Motivo</p>
                                <p className="text-slate-800 text-sm mt-1">
                                  {refund.refundReason && refund.refundReason.length > 100
                                    ? `${refund.refundReason.substring(0, 100)}...`
                                    : refund.refundReason || 'Não informado'}
                                </p>
                              </div>

                              <div>
                                <p className="text-slate-600">📅 Solicitado em</p>
                                <p className="text-slate-800 text-sm">
                                  {refund.refundRequestedAt
                                    ? new Date(refund.refundRequestedAt).toLocaleString('pt-BR')
                                    : 'Data não disponível'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => openRefundDetails(refund)}
                            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap"
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </PlatformLayout>
  )
}
