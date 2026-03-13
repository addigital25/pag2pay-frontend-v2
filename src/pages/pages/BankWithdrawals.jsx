import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'

export default function BankWithdrawals() {
  const { user } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [availableBalance, setAvailableBalance] = useState(0)
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [showAdvanceForm, setShowAdvanceForm] = useState(false)

  // Buscar dados reais do backend
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // ✅ Buscar saques do usuário (novo endpoint)
        const withdrawalsResponse = await fetch(`${config.apiUrl}/api/users/${user.id}/withdrawals`)
        if (withdrawalsResponse.ok) {
          const withdrawalsData = await withdrawalsResponse.json()
          setWithdrawals(withdrawalsData.withdrawals || [])
        } else {
          console.error('Erro ao buscar saques:', withdrawalsResponse.status)
          setWithdrawals([])
        }

        // Buscar contas bancárias cadastradas
        const accountsResponse = await fetch(`${config.apiUrl}/api/bank-accounts?userId=${user.id}`)
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          setBankAccounts(accountsData || [])
        } else {
          console.error('Erro ao buscar contas:', accountsResponse.status)
          setBankAccounts([])
        }

        // Buscar saldo disponível
        const balanceResponse = await fetch(`${config.apiUrl}/api/users/${user.id}/balance`)
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json()
          console.log('Dados de saldo recebidos:', balanceData)
          // Saldo vem em centavos, converter para reais
          const balanceInCents = balanceData.balance?.available?.total || 0
          setAvailableBalance(balanceInCents / 100)
        } else {
          console.error('Erro ao buscar saldo:', balanceResponse.status)
          setAvailableBalance(0)
        }

      } catch (error) {
        console.error('Erro ao buscar dados de saques:', error)
        setWithdrawals([])
        setBankAccounts([])
        setAvailableBalance(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Calcular valores
  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0)

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0)

  // ✅ Saque Inteligente - Novo sistema
  const handleRequestWithdrawal = async () => {
    if (!withdrawalAmount) {
      showAlert({
        title: 'Atenção',
        message: 'Informe o valor do saque',
        type: 'warning'
      })
      return
    }

    const amount = parseFloat(withdrawalAmount.replace(',', '.'))

    if (amount <= 0) {
      showAlert({
        title: 'Atenção',
        message: 'Informe um valor válido',
        type: 'warning'
      })
      return
    }

    if (amount > availableBalance) {
      showAlert({
        title: 'Atenção',
        message: 'Saldo insuficiente',
        type: 'warning'
      })
      return
    }

    try {
      // ✅ Chamar novo endpoint de saque inteligente
      const amountInCents = Math.round(amount * 100)

      const response = await fetch(`${config.apiUrl}/api/users/${user.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountInCents
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Buscar lista atualizada de saques
        const withdrawalsResponse = await fetch(`${config.apiUrl}/api/users/${user.id}/withdrawals`)
        if (withdrawalsResponse.ok) {
          const withdrawalsData = await withdrawalsResponse.json()
          setWithdrawals(withdrawalsData.withdrawals || [])
        }

        setShowWithdrawalForm(false)
        setWithdrawalAmount('')

        // Atualizar saldo
        const netAmountInReais = data.withdrawal.netAmount / 100
        setAvailableBalance(prev => prev - amount)

        // Mensagem de sucesso
        const numTransfers = data.withdrawal.numberOfTransfers
        const message = numTransfers > 1
          ? `Saque solicitado! O valor será depositado em ${numTransfers} transferências.`
          : 'Saque solicitado com sucesso!'

        showAlert({
          title: 'Sucesso!',
          message: message,
          type: 'success'
        })
      } else {
        const errorData = await response.json()
        showAlert({
          title: 'Erro',
          message: errorData.error || 'Erro ao solicitar saque',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao solicitar saque:', error)
      showAlert({
        title: 'Erro',
        message: 'Erro ao processar solicitação',
        type: 'error'
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Concluído', class: 'bg-green-100 text-green-800' },
      pending: { label: 'Em Análise', class: 'bg-yellow-100 text-yellow-800' },
      rejected: { label: 'Rejeitado', class: 'bg-red-100 text-red-800' }
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-600">Carregando dados de saques...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Saques</h2>
            <p className="text-sm text-gray-600">Gerencie suas solicitações de saque</p>
          </div>
          <div className="flex gap-3">
            {/* Botão Antecipação - Azul */}
            <button
              onClick={() => setShowAdvanceForm(true)}
              disabled={availableBalance <= 0}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Antecipação
            </button>

            {/* Botão Solicitar Saque - Verde */}
            <button
              onClick={() => setShowWithdrawalForm(true)}
              disabled={availableBalance <= 0}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Solicitar Saque
            </button>
          </div>
        </div>

        {/* Dashboard de Saques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Saldo Disponível */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Saldo Disponível</p>
                <p className="text-3xl font-bold text-emerald-600">
                  R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Saque em Análise */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Saque em Análise</p>
                <p className="text-3xl font-bold text-yellow-600">
                  R$ {pendingWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Já Sacado */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Já Sacado</p>
                <p className="text-3xl font-bold text-blue-600">
                  R$ {totalWithdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Saques */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Histórico de Saques</h3>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum saque solicitado</h3>
              <p className="text-gray-600">Você ainda não realizou nenhuma solicitação de saque.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => {
                // ✅ Converter valores de centavos para reais
                const requestedAmount = (withdrawal.requestedAmount || withdrawal.amount) / 100
                const feeUserPaid = (withdrawal.feeUserPaid || 0) / 100
                const netAmount = (withdrawal.netAmount || requestedAmount) / 100
                const numTransfers = withdrawal.numberOfTransfers || 1

                return (
                  <div key={withdrawal.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Data e Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`w-3 h-3 rounded-full ${
                            withdrawal.status === 'completed' ? 'bg-green-500' :
                            withdrawal.status === 'pending' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(withdrawal.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          {getStatusBadge(withdrawal.status)}
                        </div>

                        {/* Valores */}
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Valor Solicitado</p>
                            <p className="text-sm font-semibold text-gray-900">
                              R$ {requestedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Taxa</p>
                            <p className="text-sm font-semibold text-gray-900">
                              R$ {feeUserPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Valor Líquido</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              R$ {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* ✅ Aviso Condicional - Só aparece se > 1 transferência */}
                        {numTransfers > 1 && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Depositado em {numTransfers} transferências</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal de Antecipação */}
        {showAdvanceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Antecipação de Recebíveis
                </h3>
                <button
                  onClick={() => setShowAdvanceForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Informação do Saldo */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-indigo-700 font-medium mb-1">Saldo Disponível para Antecipação</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-full">
                      <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Como Funciona */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Como Funciona a Antecipação
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">1</div>
                      <div>
                        <p className="text-gray-700"><strong>Solicite a antecipação:</strong> Escolha o valor que deseja antecipar do seu saldo futuro.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">2</div>
                      <div>
                        <p className="text-gray-700"><strong>Análise automática:</strong> O sistema analisa sua capacidade de antecipação em tempo real.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">3</div>
                      <div>
                        <p className="text-gray-700"><strong>Receba rapidamente:</strong> Após aprovação, o valor é creditado em sua conta em até 1 dia útil.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Taxas e Condições */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Taxas e Condições
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Taxa de antecipação:</span>
                      <span className="font-semibold text-gray-900">2,99% a.m.</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Prazo de crédito:</span>
                      <span className="font-semibold text-gray-900">Até 1 dia útil</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Valor mínimo:</span>
                      <span className="font-semibold text-gray-900">R$ 100,00</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Limite disponível:</span>
                      <span className="font-semibold text-indigo-600">
                        R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vantagens */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Vantagens da Antecipação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Liquidez imediata para seu negócio</span>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Processo 100% digital e automático</span>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Sem burocracia ou análise de crédito</span>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Taxas competitivas do mercado</span>
                    </div>
                  </div>
                </div>

                {/* Aviso Importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Atenção</p>
                      <p className="text-sm text-yellow-700">
                        A antecipação de recebíveis está sujeita à análise. O valor antecipado será descontado automaticamente de seus recebimentos futuros.
                        Certifique-se de que possui fluxo de caixa suficiente antes de solicitar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAdvanceForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowAdvanceForm(false)
                      showAlert({
                        title: 'Em Breve',
                        message: 'A funcionalidade de antecipação estará disponível em breve. Você será notificado assim que for liberada.',
                        type: 'info'
                      })
                    }}
                    disabled={availableBalance < 100}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Solicitar Antecipação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Solicitar Saque */}
        {showWithdrawalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-6">Solicitar Saque</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saldo Disponível
                  </label>
                  <div className="text-2xl font-bold text-emerald-600">
                    R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor do Saque <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conta de Destino <span className="text-red-500">*</span>
                  </label>
                  {bankAccounts.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Você ainda não possui contas bancárias cadastradas.
                        Acesse a página de Contas Bancárias para cadastrar uma conta.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecione a conta</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankCode} - {account.bankName} - Ag: {account.agency} - Cc: {account.accountNumber}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    O saque será processado em até 2 dias úteis após a aprovação.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowWithdrawalForm(false)
                      setWithdrawalAmount('')
                      setSelectedAccount('')
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRequestWithdrawal}
                    disabled={bankAccounts.length === 0}
                    className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </AdminLayout>
  )
}
