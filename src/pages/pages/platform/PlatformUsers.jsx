import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PlatformLayout from '../../components/PlatformLayout'
import * as api from '../../services/api'
import config from '../../config'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'
import PlatformModal from '../../components/PlatformModal'
import EditKYCModal from '../../components/EditKYCModal'
import EditBankModal from '../../components/EditBankModal'
import authenticatedFetch from '../../utils/authenticatedFetch'

export default function PlatformUsers() {
  const location = useLocation()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeSection, setActiveSection] = useState('kyc')
  const [activeTab, setActiveTab] = useState('todos') // 'todos', 'aguardando_documentos', 'aguardando_aprovacao', 'aguardando_ajuste', 'aprovado', 'rejeitado'
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({
    cadastro: true,
    financeiro: false,
    configuracoes: false
  })
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [creatingRecipient, setCreatingRecipient] = useState(false)
  const [messageType, setMessageType] = useState('') // 'kyc', 'documentos', 'conta_bancaria'
  const [balanceData, setBalanceData] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [expandedFeeSection, setExpandedFeeSection] = useState('pix') // 'pix', 'boleto', 'cartao', 'saque'
  const [userFees, setUserFees] = useState({
    pix: { fixedFee: '', variableFee: '', minFee: '', retentionRate: '', retentionDays: '' },
    boleto: { fixedFee: '', variableFee: '', retentionRate: '', retentionDays: '' },
    cartao: {
      fixedFee: '', variableFee: '',
      fixedFee6x: '', variableFee6x: '',
      fixedFee12x: '', variableFee12x: '',
      retentionRate: '', retentionDays: ''
    },
    saque: { fixedFee: '', variableFee: '', minWithdrawal: '' }
  })
  const [savingFees, setSavingFees] = useState(false)
  const [withdrawalConfig, setWithdrawalConfig] = useState({
    maxDailyWithdrawal: '',
    maxPerWithdrawal: '',
    minPerWithdrawal: '',
    autoApprovalEnabled: false
  })
  const [savingWithdrawal, setSavingWithdrawal] = useState(false)
  const [anticipationConfig, setAnticipationConfig] = useState({
    anticipationDays: '',
    anticipationRate: '',
    calculateByDays: false,
    customAnticipationEnabled: false
  })
  const [savingAnticipation, setSavingAnticipation] = useState(false)
  const [showLoginLinkModal, setShowLoginLinkModal] = useState(false)
  const [loginLink, setLoginLink] = useState('')
  const [linkExpiresIn, setLinkExpiresIn] = useState(60)
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' })
  const [showEditKYCModal, setShowEditKYCModal] = useState(false)
  const [showEditBankModal, setShowEditBankModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  // Carregar usuários da API
  useEffect(() => {
    loadUsers()
  }, [])

  // Recarregar quando clicar no menu ativo (detecta mudança no state.refresh)
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('🔄 Detectado clique no menu ativo - recarregando usuários...')
      loadUsers()
    }
  }, [location.state?.refresh])

  // Selecionar primeiro usuário quando os dados carregam
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      // Filtrar usuários pela aba ativa
      const usersInTab = users.filter(user => {
        if (activeTab === 'all') return true
        return user.status === activeTab
      })

      // Selecionar o primeiro usuário
      if (usersInTab.length > 0) {
        setSelectedUser(usersInTab[0])
      }
    }
  }, [users, activeTab])

  // Carregar dados de saldo quando a seção 'saldo' é acessada
  useEffect(() => {
    if (selectedUser && activeSection === 'saldo') {
      loadBalanceData(selectedUser.id)
    }
  }, [selectedUser, activeSection])

  // Carregar taxas do usuário quando a seção 'taxas' é acessada
  useEffect(() => {
    if (selectedUser && activeSection === 'taxas') {
      loadUserFees(selectedUser.id)
    }
  }, [selectedUser, activeSection])

  // Carregar configuração de saque quando a seção 'saques' é acessada
  useEffect(() => {
    if (selectedUser && activeSection === 'saques') {
      loadWithdrawalConfig(selectedUser.id)
    }
  }, [selectedUser, activeSection])

  // Carregar configuração de antecipação quando a seção 'antecipacao' é acessada
  useEffect(() => {
    if (selectedUser && activeSection === 'antecipacao') {
      loadAnticipationConfig(selectedUser.id)
    }
  }, [selectedUser, activeSection])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obter token do localStorage
      const token = localStorage.getItem('platform_token')

      // Carregar todos os usuários cadastrados com status (novo endpoint)
      const response = await authenticatedFetch(`${config.apiUrl}/api/platform/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários')
      }

      const usersData = await response.json()
      console.log('RESPONSE DA API:', usersData)
      console.log('TYPE:', typeof usersData)
      console.log('USERS ARRAY:', usersData.users)

      // Mapear usuários para o formato esperado pelo componente
      const mappedUsers = (usersData.users || []).map(user => {
        // Os dados de verification agora vêm direto no user (após correção do endpoint)
        console.log('🔍 [MAPPING USER]', user.email, '- Has formData:', !!user.formData, '- accountType:', user.accountType);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || user.formData?.phone || '',
          createdAt: user.createdAt,
          status: user.status, // aguardando_documentos, aguardando_aprovacao, aguardando_ajuste, aprovado, rejeitado
          accountType: user.accountType || 'pf',
          cpf: user.formData?.cpf || user.cpf || '',
          cnpj: user.formData?.cnpj || user.cnpj || '',
          kyc: user.kyc || { status: 'pending' },
          documentos: user.documentos || { statusSelfie: 'pending', statusDocumento: 'pending' },
          dadosBancarios: user.dadosBancarios || { status: 'pending' },
          formData: user.formData || {},
          documents: user.documents || {},
          notifications: user.notifications || [],
          editableByUser: user.editableByUser || null
        }
      })

      setUsers(mappedUsers)
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
      setError(err.message)
      // NÃO usar dados mockados - deixar array vazio
      setUsers([])
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (status) => {
    const colors = {
      aguardando_documentos: 'bg-gray-100 text-gray-800 border-gray-300',
      aguardando_aprovacao: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      aguardando_ajuste: 'bg-orange-100 text-orange-800 border-orange-300',
      aprovado: 'bg-green-100 text-green-800 border-green-300',
      rejeitado: 'bg-red-100 text-red-800 border-red-300',
      // Manter compatibilidade com status antigos
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      awaiting_adjustment: 'bg-orange-100 text-orange-800 border-orange-300'
    }
    return colors[status] || colors.aguardando_documentos
  }

  const getStatusLabel = (status) => {
    const labels = {
      aguardando_documentos: 'Aguardando Documentos',
      aguardando_aprovacao: 'Aguardando Aprovação',
      aguardando_ajuste: 'Aguardando Ajuste',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
      // Manter compatibilidade com status antigos
      pending: 'Aguardando Aprovação',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      awaiting_adjustment: 'Aguardando Ajuste'
    }
    return labels[status] || 'Aguardando Documentos'
  }

  const handleApprove = async () => {
    if (!confirm(`Aprovar todas as informações de ${selectedUser.name}?`)) return

    try {
      await api.approveUser(selectedUser.id)
      showAlert({
        title: 'Sucesso!',
        message: 'Usuário aprovado com sucesso!',
        type: 'success'
      })
      // Atualizar lista de usuários
      await loadUsers()
      // Atualizar usuário selecionado
      const updatedUser = await api.getUserById(selectedUser.id)
      setSelectedUser(updatedUser)
    } catch (err) {
      showAlert({
        title: 'Erro',
        message: `Erro ao aprovar usuário: ${err.message}`,
        type: 'error'
      })
      // Fallback para mock
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, status: 'approved' } : u
      ))
      setSelectedUser(prev => ({ ...prev, status: 'approved' }))
    }
  }

  const handleReject = async () => {
    const motivo = prompt('Informe o motivo da rejeição:')
    if (!motivo) return

    try {
      await api.rejectUser(selectedUser.id, motivo)
      showAlert({
        title: 'Usuário Rejeitado',
        message: `Usuário rejeitado. Motivo: ${motivo}`,
        type: 'warning'
      })
      // Atualizar lista
      await loadUsers()
      const updatedUser = await api.getUserById(selectedUser.id)
      setSelectedUser(updatedUser)
    } catch (err) {
      showAlert({
        title: 'Erro',
        message: `Erro ao rejeitar usuário: ${err.message}`,
        type: 'error'
      })
      // Fallback para mock
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, status: 'rejected', pendingReason: motivo } : u
      ))
      setSelectedUser(prev => ({ ...prev, status: 'rejected', pendingReason: motivo }))
    }
  }

  const handleLockUser = async () => {
    if (!confirm(`Deseja ${selectedUser.withdrawalLocked ? 'destravar' : 'travar'} o saque de ${selectedUser.name}?`)) return

    try {
      await api.lockUserWithdrawal(selectedUser.id, !selectedUser.withdrawalLocked)
      showAlert({
        title: 'Sucesso!',
        message: `Saque ${selectedUser.withdrawalLocked ? 'destravado' : 'travado'} com sucesso!`,
        type: 'success'
      })
      await loadUsers()
      const updatedUser = await api.getUserById(selectedUser.id)
      setSelectedUser(updatedUser)
    } catch (err) {
      showAlert({
        title: 'Erro',
        message: `Erro ao atualizar bloqueio de saque: ${err.message}`,
        type: 'error'
      })
      // Fallback para mock
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, withdrawalLocked: !u.withdrawalLocked } : u
      ))
      setSelectedUser(prev => ({ ...prev, withdrawalLocked: !prev.withdrawalLocked }))
    }
  }

  const handleDeleteUser = async () => {
    setDeletingUser(true)
    try {
      console.log('🗑️ [FRONTEND] Tentando excluir usuário:', selectedUser.id, selectedUser.name)

      const url = `${config.apiUrl}/api/platform/users/${selectedUser.id}`
      console.log('🗑️ [FRONTEND] URL:', url)

      const response = await authenticatedFetch(url, {
        method: 'DELETE'
      })

      console.log('🗑️ [FRONTEND] Response status:', response.status)
      console.log('🗑️ [FRONTEND] Response ok:', response.ok)

      const data = await response.json()
      console.log('🗑️ [FRONTEND] Response data:', data)

      if (response.ok && data.success) {
        showAlert({
          title: 'Sucesso!',
          message: `Usuário ${selectedUser.name} excluído com sucesso!`,
          type: 'success'
        })
        setShowDeleteModal(false)
        setSelectedUser(null)
        await loadUsers()
      } else {
        console.error('🗑️ [FRONTEND] Erro na resposta:', data)
        throw new Error(data.error || 'Erro ao excluir usuário')
      }
    } catch (err) {
      console.error('🗑️ [FRONTEND] Erro capturado:', err)
      showAlert({
        title: 'Erro',
        message: `Erro ao excluir usuário: ${err.message}`,
        type: 'error'
      })
    } finally {
      setDeletingUser(false)
      setShowDeleteModal(false)
    }
  }

  const handleRequestChanges = (section) => {
    setMessageType(section)
    setShowMessageModal(true)
  }

  const handleCreateSplitAccount = async () => {
    if (!selectedUser) return

    if (!window.confirm(`Tem certeza que deseja criar o split na Pagar.me para ${selectedUser.name}?\n\nClique em OK para continuar.`)) {
      return
    }

    setCreatingRecipient(true)

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/create-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Split Criado com Sucesso!',
          message: `ID do Recebedor: ${data.recipientId}\nStatus: Aprovado`,
          type: 'success'
        })

        // Atualizar usuário localmente
        setSelectedUser({
          ...selectedUser,
          pagarmeRecipientId: data.recipientId,
          splitStatus: 'active',
          splitCreatedAt: new Date().toISOString()
        })

        // Atualizar lista de usuários
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, pagarmeRecipientId: data.recipientId, splitStatus: 'active', splitCreatedAt: new Date().toISOString() }
            : u
        ))
      } else {
        throw new Error(data.error || 'Erro ao criar split')
      }
    } catch (error) {
      console.error('Erro ao criar split:', error)
      showAlert({
        title: 'Erro ao Criar Split',
        message: `${error.message}\n\nVerifique se:\n1. Os dados bancários do usuário estão aprovados\n2. A configuração Pagar.me está completa`,
        type: 'error'
      })
    } finally {
      setCreatingRecipient(false)
    }
  }

  const handleSyncRecipient = async () => {
    if (!selectedUser || !selectedUser.pagarmeRecipientId) return

    if (!window.confirm(`Sincronizar dados do split com a Pagar.me?\n\nClique em OK para continuar.`)) {
      return
    }

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/sync-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: 'Split sincronizado com sucesso!',
          type: 'success'
        })
      } else {
        throw new Error(data.error || 'Erro ao sincronizar')
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      showAlert({
        title: 'Erro ao Sincronizar',
        message: error.message,
        type: 'error'
      })
    }
  }

  const handleDisconnectRecipient = async () => {
    if (!selectedUser || !selectedUser.pagarmeRecipientId) return

    if (!window.confirm(`⚠️ ATENÇÃO: Desconectar o split removerá a integração com a Pagar.me.\n\nO usuário não poderá receber pagamentos até criar um novo split.\n\nClique em OK para confirmar a desconexão.`)) {
      return
    }

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/disconnect-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: 'Split desconectado com sucesso!',
          type: 'success'
        })

        // Atualizar usuário localmente
        setSelectedUser({
          ...selectedUser,
          pagarmeRecipientId: null,
          splitStatus: 'not_created',
          splitCreatedAt: null
        })

        // Atualizar lista de usuários
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, pagarmeRecipientId: null, splitStatus: 'not_created', splitCreatedAt: null }
            : u
        ))
      } else {
        throw new Error(data.error || 'Erro ao desconectar')
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error)
      showAlert({
        title: 'Erro ao Desconectar',
        message: error.message,
        type: 'error'
      })
    }
  }

  const loadBalanceData = async (userId) => {
    if (!userId) return

    setLoadingBalance(true)
    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${userId}/balance`)
      const data = await response.json()

      if (data.success) {
        setBalanceData(data)
      } else {
        console.error('Erro ao carregar saldo:', data.error)
        setBalanceData(null)
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error)
      setBalanceData(null)
    } finally {
      setLoadingBalance(false)
    }
  }

  // Função para formatar telefone
  const formatPhoneNumber = (phone) => {
    if (!phone) return null
    // Remove tudo que não é número
    const cleaned = phone.replace(/\D/g, '')
    // Formata: (11) 98765-4321
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  // Função para gerar link de login temporário
  const handleGenerateLoginLink = async () => {
    if (!selectedUser) return

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/generate-login-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success) {
        // Link com token que expira em 60 segundos
        const link = `http://localhost:5173/login-auto?token=${data.token}`
        setLoginLink(link)
        setShowLoginLinkModal(true)

        // Iniciar contador regressivo
        setLinkExpiresIn(60)
        const interval = setInterval(() => {
          setLinkExpiresIn(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Erro ao gerar link',
          message: 'Erro ao gerar link de acesso: ' + data.error
        })
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao gerar link',
        message: 'Erro ao gerar link de acesso. Tente novamente.'
      })
    }
  }

  // Função para copiar link
  const handleCopyLoginLink = () => {
    navigator.clipboard.writeText(loginLink)
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Link copiado!',
      message: 'Cole em uma guia anônima (Ctrl + Shift + N) para acessar como produtor.'
    })
  }

  const loadUserFees = async (userId) => {
    if (!userId) return

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${userId}/fees`)
      const data = await response.json()

      if (data.success && data.fees) {
        setUserFees({
          pix: {
            fixedFee: data.fees.pix?.fixedFee || '',
            variableFee: data.fees.pix?.variableFee || '',
            minFee: data.fees.pix?.minFee || '',
            retentionRate: data.fees.pix?.retentionRate || '',
            retentionDays: data.fees.pix?.retentionDays || ''
          },
          boleto: {
            fixedFee: data.fees.boleto?.fixedFee || '',
            variableFee: data.fees.boleto?.variableFee || '',
            retentionRate: data.fees.boleto?.retentionRate || '',
            retentionDays: data.fees.boleto?.retentionDays || ''
          },
          cartao: {
            fixedFee: data.fees.cartao?.fixedFee || '',
            variableFee: data.fees.cartao?.variableFee || '',
            fixedFee6x: data.fees.cartao?.fixedFee6x || '',
            variableFee6x: data.fees.cartao?.variableFee6x || '',
            fixedFee12x: data.fees.cartao?.fixedFee12x || '',
            variableFee12x: data.fees.cartao?.variableFee12x || '',
            retentionRate: data.fees.cartao?.retentionRate || '',
            retentionDays: data.fees.cartao?.retentionDays || ''
          },
          saque: {
            fixedFee: data.fees.saque?.fixedFee || '',
            variableFee: data.fees.saque?.variableFee || '',
            minWithdrawal: data.fees.saque?.minWithdrawal || ''
          }
        })
      }
    } catch (error) {
      console.error('Erro ao carregar taxas:', error)
    }
  }

  const handleSaveFees = async (feeType) => {
    if (!selectedUser) return

    setSavingFees(true)
    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeType,
          fees: userFees[feeType]
        })
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: `Taxas de ${feeType.toUpperCase()} salvas com sucesso!`,
          type: 'success'
        })
      } else {
        showAlert({
          title: 'Erro',
          message: `Erro ao salvar taxas: ${data.error}`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar taxas:', error)
      showAlert({
        title: 'Erro',
        message: `Erro ao salvar taxas: ${error.message}`,
        type: 'error'
      })
    } finally {
      setSavingFees(false)
    }
  }

  const loadWithdrawalConfig = async (userId) => {
    if (!userId) return

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${userId}/withdrawal-config`)
      const data = await response.json()

      if (data.success && data.config) {
        setWithdrawalConfig({
          maxDailyWithdrawal: data.config.maxDailyWithdrawal || '',
          maxPerWithdrawal: data.config.maxPerWithdrawal || '',
          minPerWithdrawal: data.config.minPerWithdrawal || '',
          autoApprovalEnabled: data.config.autoApprovalEnabled || false
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de saque:', error)
    }
  }

  const handleSaveWithdrawalConfig = async () => {
    if (!selectedUser) return

    setSavingWithdrawal(true)
    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/withdrawal-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withdrawalConfig)
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: 'Configuração de saques salva com sucesso!',
          type: 'success'
        })
      } else {
        showAlert({
          title: 'Erro',
          message: `Erro ao salvar: ${data.error}`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de saque:', error)
      showAlert({
        title: 'Erro',
        message: `Erro ao salvar: ${error.message}`,
        type: 'error'
      })
    } finally {
      setSavingWithdrawal(false)
    }
  }

  const loadAnticipationConfig = async (userId) => {
    if (!userId) return

    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${userId}/anticipation-config`)
      const data = await response.json()

      if (data.success && data.config) {
        setAnticipationConfig({
          anticipationDays: data.config.anticipationDays || '',
          anticipationRate: data.config.anticipationRate || '',
          calculateByDays: data.config.calculateByDays || false,
          customAnticipationEnabled: data.config.customAnticipationEnabled || false
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de antecipação:', error)
    }
  }

  const handleSaveAnticipationConfig = async () => {
    if (!selectedUser) return

    setSavingAnticipation(true)
    try {
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/anticipation-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anticipationConfig)
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: 'Configuração de antecipação salva com sucesso!',
          type: 'success'
        })
      } else {
        showAlert({
          title: 'Erro',
          message: `Erro ao salvar: ${data.error}`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de antecipação:', error)
      showAlert({
        title: 'Erro',
        message: `Erro ao salvar: ${error.message}`,
        type: 'error'
      })
    } finally {
      setSavingAnticipation(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showAlert({
        title: 'Atenção',
        message: 'Por favor, digite uma mensagem',
        type: 'warning'
      })
      return
    }

    // Mapear seção para o formato do backend
    const sectionMap = {
      'KYC': 'kyc',
      'Documentos': 'documentos',
      'Conta Bancária': 'dadosBancarios'
    }

    try {
      // Enviar solicitação de alteração para o backend
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/verification/${sectionMap[messageType]}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'changes_requested',
          message: messageText
        })
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: `Mensagem enviada ao usuário ${selectedUser.name} solicitando alteração em ${messageType}`,
          type: 'success'
        })

        // Recarregar dados do usuário do backend
        const verificationResponse = await fetch(`${config.apiUrl}/api/users/${selectedUser.id}/verification`)
        const verification = await verificationResponse.json()

        // Atualizar estado local com dados do backend
        setUsers(prev => prev.map(u => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              status: verification.status,
              kyc: verification.kyc,
              documentos: verification.documentos,
              dadosBancarios: verification.dadosBancarios,
              notifications: verification.notifications
            }
          }
          return u
        }))

        setSelectedUser(prev => ({
          ...prev,
          status: verification.status,
          kyc: verification.kyc,
          documentos: verification.documentos,
          dadosBancarios: verification.dadosBancarios,
          notifications: verification.notifications
        }))

        setShowMessageModal(false)
        setMessageText('')
        setMessageType('')
      } else {
        showAlert({
          title: 'Erro',
          message: 'Erro ao enviar mensagem. Tente novamente.',
          type: 'error'
        })
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao enviar mensagem. Verifique sua conexão e tente novamente.',
        type: 'error'
      })
    }
  }

  const handleApproveSection = async (section) => {
    if (!confirm(`Aprovar ${section} de ${selectedUser.name}?`)) return

    // Mapear seção para o formato do backend
    const sectionMap = {
      'KYC': 'kyc',
      'Documentos': 'documentos',
      'Conta Bancária': 'dadosBancarios'
    }

    try {
      // Enviar aprovação para o backend
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/verification/${sectionMap[section]}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Sucesso!',
          message: `${section} aprovado com sucesso!`,
          type: 'success'
        })

        // Recarregar dados do usuário do backend
        const verificationResponse = await fetch(`${config.apiUrl}/api/users/${selectedUser.id}/verification`)
        const verification = await verificationResponse.json()

        // Atualizar estado local com dados do backend
        setUsers(prev => prev.map(u => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              status: verification.status,
              kyc: verification.kyc,
              documentos: verification.documentos,
              dadosBancarios: verification.dadosBancarios,
              notifications: verification.notifications
            }
          }
          return u
        }))

        setSelectedUser(prev => ({
          ...prev,
          status: verification.status,
          kyc: verification.kyc,
          documentos: verification.documentos,
          dadosBancarios: verification.dadosBancarios,
          notifications: verification.notifications
        }))
      } else {
        showAlert({
          title: 'Erro',
          message: 'Erro ao aprovar seção. Tente novamente.',
          type: 'error'
        })
      }
    } catch (err) {
      console.error('Erro ao aprovar seção:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao aprovar seção. Verifique sua conexão e tente novamente.',
        type: 'error'
      })
    }
  }

  const handleRejectSection = async (section) => {
    const motivo = prompt(`Informe o motivo da rejeição de ${section}:`)
    if (!motivo) return

    // Mapear seção para o formato do backend
    const sectionMap = {
      'KYC': 'kyc',
      'Documentos': 'documentos',
      'Conta Bancária': 'dadosBancarios'
    }

    try {
      // Enviar rejeição para o backend
      const response = await authenticatedFetch(`${config.apiUrl}/api/users/${selectedUser.id}/verification/${sectionMap[section]}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          message: motivo
        })
      })

      const data = await response.json()

      if (data.success) {
        showAlert({
          title: 'Seção Rejeitada',
          message: `${section} rejeitado. Motivo: ${motivo}`,
          type: 'warning'
        })

        // Recarregar dados do usuário do backend
        const verificationResponse = await fetch(`${config.apiUrl}/api/users/${selectedUser.id}/verification`)
        const verification = await verificationResponse.json()

        // Atualizar estado local com dados do backend
        setUsers(prev => prev.map(u => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              status: verification.status,
              kyc: verification.kyc,
              documentos: verification.documentos,
              dadosBancarios: verification.dadosBancarios,
              notifications: verification.notifications
            }
          }
          return u
        }))

        setSelectedUser(prev => ({
          ...prev,
          status: verification.status,
          kyc: verification.kyc,
          documentos: verification.documentos,
          dadosBancarios: verification.dadosBancarios,
          notifications: verification.notifications
        }))
      } else {
        showAlert({
          title: 'Erro',
          message: 'Erro ao rejeitar seção. Tente novamente.',
          type: 'error'
        })
      }
    } catch (err) {
      console.error('Erro ao rejeitar seção:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao rejeitar seção. Verifique sua conexão e tente novamente.',
        type: 'error'
      })
    }
  }

  // Salvar edição de KYC
  const handleSaveKYC = (result) => {
    // Atualizar usuário na lista
    loadUsers() // Recarregar lista completa
    showAlert({
      title: 'Sucesso!',
      message: 'Dados KYC atualizados com sucesso!',
      type: 'success'
    })
  }

  // Salvar edição de dados bancários
  const handleSaveBank = (result) => {
    // Atualizar usuário na lista
    loadUsers() // Recarregar lista completa
    showAlert({
      title: 'Sucesso!',
      message: 'Dados bancários atualizados com sucesso!',
      type: 'success'
    })
  }

  // Função para mudar aba e selecionar primeiro usuário automaticamente
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)

    // Filtrar usuários da nova aba
    const usersInTab = users.filter(user => {
      if (newTab === 'all') return true
      if (newTab === 'todos') return true // Nova aba: todos usuários
      return user.status === newTab
    })

    // Selecionar o primeiro usuário da lista filtrada
    if (usersInTab.length > 0) {
      setSelectedUser(usersInTab[0])
      setActiveSection('kyc') // Voltar para a seção KYC ao mudar de usuário
    } else {
      setSelectedUser(null) // Limpar seleção se não houver usuários
    }
  }

  // Filtrar usuários por aba e busca
  const filteredUsers = users.filter(user => {
    // Nova lógica: mostrar TODOS os usuários na aba "todos"
    const matchesTab = activeTab === 'todos' || activeTab === 'all' || user.status === activeTab
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cpf && user.cpf.includes(searchTerm)) ||
      (user.cnpj && user.cnpj.includes(searchTerm))
    return matchesTab && matchesSearch
  })

  // Contadores por status (TODOS os status)
  const todosCount = users.length // TODOS os usuários cadastrados
  const novosCount = users.filter(u => u.status === 'novo').length
  const aguardandoAprovacaoCount = users.filter(u => u.status === 'aguardando_aprovacao' || u.status === 'pending').length
  const aguardandoAjusteCount = users.filter(u => u.status === 'aguardando_ajuste' || u.status === 'awaiting_adjustment').length
  const aprovadoCount = users.filter(u => u.status === 'aprovado' || u.status === 'approved').length
  const rejeitadoCount = users.filter(u => u.status === 'rejeitado' || u.status === 'rejected').length

  // Renderização se estiver carregando
  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando usuários...</p>
          </div>
        </div>
      </PlatformLayout>
    )
  }

  return (
    <PlatformLayout>
      {/* Mensagem de erro se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">⚠️ Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Verifique se o servidor backend está rodando em ${config.apiUrl}</p>
        </div>
      )}

      {/* Tabs de Filtro */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {/* 1ª ABA: Novos */}
          <button
            onClick={() => handleTabChange('novo')}
            className={`py-4 px-4 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'novo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            🆕 Novos
            {novosCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {novosCount}
              </span>
            )}
          </button>

          {/* 2ª ABA: Aguardando Aprovação */}
          <button
            onClick={() => handleTabChange('aguardando_aprovacao')}
            className={`py-4 px-4 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'aguardando_aprovacao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            ⏳ Aguardando Aprovação
            {aguardandoAprovacaoCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {aguardandoAprovacaoCount}
              </span>
            )}
          </button>

          {/* 3ª ABA: Aguardando Ajuste */}
          <button
            onClick={() => handleTabChange('aguardando_ajuste')}
            className={`py-4 px-4 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'aguardando_ajuste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📝 Aguardando Ajuste
            {aguardandoAjusteCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {aguardandoAjusteCount}
              </span>
            )}
          </button>

          {/* 4ª ABA: Aprovados */}
          <button
            onClick={() => handleTabChange('aprovado')}
            className={`py-4 px-4 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'aprovado'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            ✅ Aprovados
            <span className="ml-2 text-sm text-slate-500">({aprovadoCount})</span>
          </button>

          {/* 5ª ABA: Rejeitados */}
          <button
            onClick={() => handleTabChange('rejeitado')}
            className={`py-4 px-4 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'rejeitado'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            ❌ Rejeitados
            <span className="ml-2 text-sm text-slate-500">({rejeitadoCount})</span>
          </button>

          {/* 6ª ABA: Todos Usuários (ÚLTIMA) */}
          <button
            onClick={() => handleTabChange('todos')}
            className={`py-4 px-4 border-b-2 font-semibold text-sm transition whitespace-nowrap ${
              activeTab === 'todos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            👥 Todos Usuários
            <span className="ml-2 text-sm text-slate-500">({todosCount})</span>
          </button>
        </nav>
      </div>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Lista de Usuários - Esquerda */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Usuários</h2>
            <input
              type="text"
              placeholder="🔍 Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  console.log('👤 [SELECT USER]', user.email, user);
                  console.log('📋 FormData:', user.formData);
                  console.log('📄 AccountType:', user.accountType);
                  setSelectedUser(user)
                  setActiveSection('kyc')
                }}
                className={`w-full text-left p-4 hover:bg-slate-50 transition ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(user.status)}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{user.email}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {user.accountType === 'pf' ? user.cpf : user.cnpj}
                </p>
              </button>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>

        {/* Detalhes do Usuário - Direita */}
        {selectedUser ? (
          <div className="flex-1 bg-slate-50 overflow-y-auto">
            {/* Header do Usuário */}
            <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-800">{selectedUser.name}</h2>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded font-medium uppercase">
                        {selectedUser.accountType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        📧 {selectedUser.email}
                      </span>
                      <span className="flex items-center gap-1">
                        📞 {formatPhoneNumber(selectedUser.phone || selectedUser.phoneNumber) || 'Não informado'}
                      </span>
                      <button
                        onClick={handleGenerateLoginLink}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition hover:underline"
                      >
                        🔗 Login como produtor
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLockUser}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                  >
                    🔒 Travar saque
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Excluir usuário
                  </button>
                  <div className="relative">
                    <select
                      value={selectedUser.status}
                      className={`px-4 py-2 rounded-lg border-2 font-medium appearance-none pr-10 text-sm cursor-pointer ${getStatusColor(selectedUser.status)}`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Lateral Esquerdo + Conteúdo */}
            <div className="flex">
              {/* Sidebar de Seções - Menu Colapsável (Responsivo) */}
              <div className="w-64 lg:w-56 md:w-48 sm:w-16 bg-white border-r border-slate-200 flex-shrink-0">
                {/* Grupo: Cadastro */}
                <div className="border-b border-slate-200">
                  <button
                    onClick={() => toggleGroup('cadastro')}
                    className="w-full px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
                  >
                    <span className="sm:inline hidden">📋 Cadastro</span>
                    <span className="sm:hidden">📋</span>
                    <svg
                      className={`w-4 h-4 transition-transform sm:inline hidden ${expandedGroups.cadastro ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedGroups.cadastro && (
                    <div>
                      <button
                        onClick={() => setActiveSection('kyc')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'kyc' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        🏠 KYC
                      </button>
                      <button
                        onClick={() => setActiveSection('documentos')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'documentos' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        📄 Documentos
                      </button>
                      <button
                        onClick={() => setActiveSection('contas_bancarias')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'contas_bancarias' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        🏦 Contas bancárias
                      </button>
                    </div>
                  )}
                </div>

                {/* Grupo: Financeiro */}
                <div className="border-b border-slate-200">
                  <button
                    onClick={() => toggleGroup('financeiro')}
                    className="w-full px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
                  >
                    <span className="sm:inline hidden">💰 Financeiro</span>
                    <span className="sm:hidden">💰</span>
                    <svg
                      className={`w-4 h-4 transition-transform sm:inline hidden ${expandedGroups.financeiro ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedGroups.financeiro && (
                    <div>
                      <button
                        onClick={() => setActiveSection('contas_split')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'contas_split' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        👥 Contas Split
                      </button>
                      <button
                        onClick={() => setActiveSection('saldo')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'saldo' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        💵 Saldo
                      </button>
                      <button
                        onClick={() => setActiveSection('taxas')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'taxas' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        📊 Taxas
                      </button>
                      <button
                        onClick={() => setActiveSection('saques')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'saques' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                    💵 Saques
                  </button>
                  <button
                    onClick={() => setActiveSection('antecipacao')}
                    className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                      activeSection === 'antecipacao' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    ⚡ Antecipação
                  </button>
                </div>
                  )}
                </div>

                {/* Grupo: Configurações */}
                <div>
                  <button
                    onClick={() => toggleGroup('configuracoes')}
                    className="w-full px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
                  >
                    <span className="sm:inline hidden">⚙️ Configurações</span>
                    <span className="sm:hidden">⚙️</span>
                    <svg
                      className={`w-4 h-4 transition-transform sm:inline hidden ${expandedGroups.configuracoes ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedGroups.configuracoes && (
                    <div>
                      <button
                        onClick={() => setActiveSection('adquirentes_vendas')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'adquirentes_vendas' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        💳 Adquirentes de Vendas
                      </button>
                      <button
                        onClick={() => setActiveSection('produtos')}
                        className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${
                          activeSection === 'produtos' ? 'bg-blue-50 border-l-4 border-blue-600 font-medium text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        🛒 Produtos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="flex-1 p-6">
                {/* Seção KYC */}
                {activeSection === 'kyc' && (
                  <div>
                    {/* Header com botão de editar */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-800">🏠 Informações KYC</h3>
                      <button
                        onClick={() => setShowEditKYCModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        ✏️ Editar KYC
                      </button>
                    </div>

                    <div className={`border-2 rounded-lg p-4 mb-6 ${
                      selectedUser.status === 'aprovado' || selectedUser.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : selectedUser.status === 'rejeitado' || selectedUser.status === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <p className={`font-medium ${
                        selectedUser.status === 'aprovado' || selectedUser.status === 'approved'
                          ? 'text-green-800'
                          : selectedUser.status === 'rejeitado' || selectedUser.status === 'rejected'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {getStatusLabel(selectedUser.status)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Documento</label>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="text-slate-900 font-medium">
                              {selectedUser.accountType === 'pf'
                                ? (selectedUser.formData?.cpf || selectedUser.cpf || '-')
                                : (selectedUser.formData?.cnpj || selectedUser.cnpj || '-')}
                            </p>
                            <button className="text-green-600 hover:text-green-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-600">Email</label>
                          <p className="mt-1 text-slate-900 break-all">{selectedUser.formData?.email || selectedUser.email || '-'}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-600">Telefone</label>
                          <p className="mt-1 text-slate-900">{selectedUser.formData?.phone || selectedUser.phone || '-'}</p>
                        </div>

                        <div className="col-span-2">
                          <label className="text-sm font-medium text-slate-600">Nome Completo</label>
                          <p className="mt-1 text-slate-900">{selectedUser.formData?.fullName || selectedUser.name || '-'}</p>
                        </div>
                      </div>

                      {/* Informações do empresário (PJ) */}
                      {selectedUser.accountType === 'pj' && selectedUser.empresario && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações do empresário</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600">Nome Completo</label>
                              <p className="mt-1 text-slate-900">{selectedUser.empresario.nomeCompleto}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">CPF</label>
                              <p className="mt-1 text-slate-900 font-mono">{selectedUser.empresario.cpf}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Data de Nascimento</label>
                              <p className="mt-1 text-slate-900">
                                {new Date(selectedUser.empresario.dataNascimento).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Telefone</label>
                              <p className="mt-1 text-slate-900">{selectedUser.empresario.telefone}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Endereço */}
                      {(selectedUser.enderecoPF || selectedUser.formData?.cep) && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4">Endereço</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600">CEP</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPF?.cep || selectedUser.formData?.cep || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Logradouro</label>
                              <p className="mt-1 text-slate-900">
                                {selectedUser.enderecoPF?.logradouro || selectedUser.formData?.address || '-'}, {selectedUser.enderecoPF?.numero || selectedUser.formData?.addressNumber || ''}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Complemento</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPF?.complemento || selectedUser.formData?.addressComplement || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Bairro</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPF?.bairro || selectedUser.formData?.neighborhood || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Cidade</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPF?.cidade || selectedUser.formData?.city || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Estado</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPF?.estado || selectedUser.formData?.state || '-'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedUser.enderecoPJ && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4">Endereço da empresa</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600">CEP</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPJ.cep}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Logradouro</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPJ.logradouro}, {selectedUser.enderecoPJ.numero}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Bairro</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPJ.bairro}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Cidade/UF</label>
                              <p className="mt-1 text-slate-900">{selectedUser.enderecoPJ.cidade} - {selectedUser.enderecoPJ.estado}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-4 mt-6">
                      {selectedUser.kyc?.status === 'approved' ? (
                        <div className="flex-1 bg-green-50 border-2 border-green-500 rounded-lg px-6 py-3 flex items-center justify-center">
                          <span className="text-green-700 font-bold text-lg">✅ KYC APROVADO</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRequestChanges('KYC')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                          >
                            📝 Solicitar alteração
                          </button>
                          <button
                            onClick={() => handleRejectSection('KYC')}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            ❌ Rejeitar
                          </button>
                          <button
                            onClick={() => handleApproveSection('KYC')}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                          >
                            ✅ Aprovar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção Documentos */}
                {activeSection === 'documentos' && (
                  <div>
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Documentos Enviados</h3>

                      <div className="space-y-4">
                        {/* Selfie com Documento */}
                        <div className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-slate-800">📸 Selfie com documento</p>
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${
                              selectedUser.documentos?.statusSelfie === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : selectedUser.documentos?.statusSelfie === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusLabel(selectedUser.documentos?.statusSelfie || 'pending')}
                            </span>
                          </div>
                          <div className="bg-slate-100 h-48 rounded-lg flex items-center justify-center overflow-hidden">
                            {selectedUser.documents?.selfieUrl ? (
                              <img
                                src={selectedUser.documents.selfieUrl}
                                alt="Selfie com documento"
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(selectedUser.documents.selfieUrl, '_blank')}
                                title="Clique para ampliar"
                              />
                            ) : selectedUser.documents?.selfie ? (
                              <div className="text-center p-4 w-full">
                                <svg className="w-16 h-16 text-emerald-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm font-medium text-slate-700 mb-1">Arquivo enviado</p>
                                <p className="text-xs text-slate-500 break-all px-2">{selectedUser.documents.selfie}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <svg className="w-16 h-16 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-slate-400 text-sm">Aguardando envio</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Documento de Identificação (aberto) */}
                        <div className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-slate-800">🪪 Documento de identificação (aberto)</p>
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${
                              selectedUser.documentos?.statusDocumento === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : selectedUser.documentos?.statusDocumento === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusLabel(selectedUser.documentos?.statusDocumento || 'pending')}
                            </span>
                          </div>
                          <div className="bg-slate-100 h-48 rounded-lg flex items-center justify-center overflow-hidden">
                            {selectedUser.documents?.idDocumentUrl ? (
                              <img
                                src={selectedUser.documents.idDocumentUrl}
                                alt="Documento de identificação"
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(selectedUser.documents.idDocumentUrl, '_blank')}
                                title="Clique para ampliar"
                              />
                            ) : selectedUser.documents?.idDocument ? (
                              <div className="text-center p-4 w-full">
                                <svg className="w-16 h-16 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                <p className="text-sm font-medium text-slate-700 mb-1">Arquivo enviado</p>
                                <p className="text-xs text-slate-500 break-all px-2">{selectedUser.documents.idDocument}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <svg className="w-16 h-16 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                <p className="text-slate-400 text-sm">Aguardando envio</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-4 mt-6">
                      {selectedUser.documentos?.statusSelfie === 'approved' && selectedUser.documentos?.statusDocumento === 'approved' ? (
                        <div className="flex-1 bg-green-50 border-2 border-green-500 rounded-lg px-6 py-3 flex items-center justify-center">
                          <span className="text-green-700 font-bold text-lg">✅ DOCUMENTOS APROVADOS</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRequestChanges('Documentos')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                          >
                            📝 Solicitar alteração
                          </button>
                          <button
                            onClick={() => handleRejectSection('Documentos')}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            ❌ Rejeitar
                          </button>
                          <button
                            onClick={() => handleApproveSection('Documentos')}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                          >
                            ✅ Aprovar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção Contas Bancárias */}
                {activeSection === 'contas_bancarias' && (
                  <div>
                    {/* Header com botão de editar */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-800">🏦 Dados Bancários</h3>
                      <button
                        onClick={() => setShowEditBankModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        ✏️ Editar Conta
                      </button>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Informações Bancárias</h4>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Banco</label>
                          <p className="mt-1 text-slate-900">{selectedUser.formData?.bankName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Tipo de Conta</label>
                          <p className="mt-1 text-slate-900">{selectedUser.formData?.accountType || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Agência</label>
                          <p className="mt-1 text-slate-900 font-mono">
                            {selectedUser.formData?.agency || '-'}
                            {selectedUser.formData?.agencyDigit ? `-${selectedUser.formData.agencyDigit}` : ''}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Conta</label>
                          <p className="mt-1 text-slate-900 font-mono">
                            {selectedUser.formData?.accountNumber || '-'}
                            {selectedUser.formData?.accountDigit ? `-${selectedUser.formData.accountDigit}` : ''}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Titular</label>
                          <p className="mt-1 text-slate-900">{selectedUser.formData?.accountHolder || selectedUser.formData?.fullName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">CPF/CNPJ do Titular</label>
                          <p className="mt-1 text-slate-900 font-mono">{selectedUser.formData?.accountHolderDocument || selectedUser.formData?.cpf || selectedUser.formData?.cnpj || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Tipo de Chave PIX</label>
                          <p className="mt-1 text-slate-900">{selectedUser.formData?.pixKeyType || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Chave PIX</label>
                          <p className="mt-1 text-slate-900 font-mono">{selectedUser.formData?.pixKey || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-4 mt-6">
                      {selectedUser.dadosBancarios?.status === 'approved' ? (
                        <div className="flex-1 bg-green-50 border-2 border-green-500 rounded-lg px-6 py-3 flex items-center justify-center">
                          <span className="text-green-700 font-bold text-lg">✅ CONTA BANCÁRIA APROVADA</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRequestChanges('Conta Bancária')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                          >
                            📝 Solicitar alteração
                          </button>
                          <button
                            onClick={() => handleRejectSection('Conta Bancária')}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            ❌ Rejeitar
                          </button>
                          <button
                            onClick={() => handleApproveSection('Conta Bancária')}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                          >
                            ✅ Aprovar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção Contas Split */}
                {activeSection === 'contas_split' && (
                  <div>
                    {selectedUser.splitStatus === 'pending' ? (
                      <div className="bg-white rounded-lg border border-yellow-200 p-8 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">⏳</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Criando Split...</h3>
                        <p className="text-slate-600 mb-4">
                          Aguarde enquanto o recipient está sendo criado na Pagar.me
                        </p>
                        <div className="animate-pulse bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-yellow-800 font-medium">Status: Pendente</p>
                        </div>
                      </div>
                    ) : selectedUser.splitStatus === 'not_created' || !selectedUser.pagarmeRecipientId ? (
                      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🔌</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Split não criado</h3>
                        <p className="text-slate-600 mb-6">
                          Este usuário ainda não possui split configurado na Pagar.me
                        </p>
                        <button
                          onClick={handleCreateSplitAccount}
                          disabled={creatingRecipient}
                          className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium ${creatingRecipient ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {creatingRecipient ? '⏳ Criando...' : '🔌 Criar Split'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                          <p className="text-green-800 font-medium">✅ Status: Aprovado</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="text-sm font-medium text-slate-600">ID do Recebedor (Recipient ID)</label>
                            <p className="mt-1 text-slate-900 font-mono text-sm bg-slate-50 px-3 py-2 rounded border border-slate-200">
                              {selectedUser.pagarmeRecipientId}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Criado em</label>
                            <p className="mt-1 text-slate-900">
                              {selectedUser.splitCreatedAt
                                ? new Date(selectedUser.splitCreatedAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={handleSyncRecipient}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            🔄 Sincronizar
                          </button>
                          <button
                            onClick={handleDisconnectRecipient}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            ❌ Desconectar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Seção Saldo */}
                {activeSection === 'saldo' && (
                  <div>
                    {loadingBalance ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-slate-600">Carregando saldo...</p>
                        </div>
                      </div>
                    ) : balanceData ? (
                      <div className="space-y-6">
                        {/* Saldo Consolidado */}
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-4">Saldo Consolidado</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {/* Saldo Disponível */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">✅</span>
                                <h4 className="text-sm font-semibold text-green-800">Saldo Disponível</h4>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-green-700">Total</span>
                                <span className="text-2xl font-bold text-green-700">
                                  R$ {((balanceData.balance?.available?.total || 0) / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Saldo Pendente */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">💰</span>
                                <h4 className="text-sm font-semibold text-blue-800">Saldo Pendente</h4>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-700">Total</span>
                                <span className="text-2xl font-bold text-blue-700">
                                  R$ {((balanceData.balance?.pending?.total || 0) / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Total Transferido */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">💚</span>
                                <h4 className="text-sm font-semibold text-purple-800">Total Transferido</h4>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-purple-700">Total</span>
                                <span className="text-2xl font-bold text-purple-700">
                                  R$ {((balanceData.balance?.transferred?.total || 0) / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalhamento por Adquirente (Admin View) */}
                        {balanceData.breakdown && balanceData.breakdown.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Detalhamento por Adquirente</h3>
                            <div className="space-y-3">
                              {balanceData.breakdown.map((acquirer, index) => (
                                <div key={index} className="bg-white rounded-lg border border-slate-200 p-5">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-lg font-semibold text-slate-800">{acquirer.acquirer}</h4>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Ativo</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Disponível</p>
                                      <p className="text-lg font-bold text-green-600">
                                        R$ {(acquirer.available / 100).toFixed(2)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Pendente</p>
                                      <p className="text-lg font-bold text-blue-600">
                                        R$ {(acquirer.pending / 100).toFixed(2)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Transferido</p>
                                      <p className="text-lg font-bold text-purple-600">
                                        R$ {(acquirer.transferred / 100).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Informações Adicionais */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-blue-900 mb-1">Saldo Consolidado de Múltiplas Adquirentes</p>
                              <p className="text-xs text-blue-700">
                                Este saldo é a soma de todas as adquirentes configuradas para este usuário.
                                {balanceData.source === 'consolidated_api' && ' Os valores são atualizados em tempo real via API.'}
                              </p>
                              {balanceData.lastUpdate && (
                                <p className="text-xs text-blue-600 mt-2">
                                  Última atualização: {new Date(balanceData.lastUpdate).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                        <p className="text-slate-600">Nenhum dado de saldo disponível</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Certifique-se de que o usuário possui um recipient configurado e adquirentes ativas.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Seção Taxas */}
                {activeSection === 'taxas' && (
                  <div className="space-y-4">
                    {/* Configurações PIX */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedFeeSection(expandedFeeSection === 'pix' ? '' : 'pix')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <span className="text-base font-medium text-slate-800">Configurações PIX</span>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedFeeSection === 'pix' ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedFeeSection === 'pix' && (
                        <div className="px-6 py-4 border-t border-slate-200">
                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de operação</h3>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa fixa <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.pix.fixedFee}
                                  onChange={(e) => setUserFees({...userFees, pix: {...userFees.pix, fixedFee: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor fixo cobrado por transação.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.pix.variableFee}
                                  onChange={(e) => setUserFees({...userFees, pix: {...userFees.pix, variableFee: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem cobrada por transação.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa mínima <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.pix.minFee}
                                  onChange={(e) => setUserFees({...userFees, pix: {...userFees.pix, minFee: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor mínimo da taxa cobrada por transação.</p>
                            </div>
                          </div>

                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de retenção</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.pix.retentionRate}
                                  onChange={(e) => setUserFees({...userFees, pix: {...userFees.pix, retentionRate: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem da reserva de garantia.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Dias <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={userFees.pix.retentionDays}
                                onChange={(e) => setUserFees({...userFees, pix: {...userFees.pix, retentionDays: e.target.value}})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Deixe vazio para usar padrão"
                              />
                              <p className="text-xs text-slate-500 mt-1">Dias da reserva de garantia</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveFees('pix')}
                            disabled={savingFees}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-green-400"
                          >
                            {savingFees ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Configurações Boleto */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedFeeSection(expandedFeeSection === 'boleto' ? '' : 'boleto')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <span className="text-base font-medium text-slate-800">Configurações Boleto</span>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedFeeSection === 'boleto' ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedFeeSection === 'boleto' && (
                        <div className="px-6 py-4 border-t border-slate-200">
                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de operação</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa fixa <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.boleto.fixedFee}
                                  onChange={(e) => setUserFees({...userFees, boleto: {...userFees.boleto, fixedFee: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor fixo cobrado por transação.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.boleto.variableFee}
                                  onChange={(e) => setUserFees({...userFees, boleto: {...userFees.boleto, variableFee: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem cobrada por transação.</p>
                            </div>
                          </div>

                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de retenção</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.boleto.retentionRate}
                                  onChange={(e) => setUserFees({...userFees, boleto: {...userFees.boleto, retentionRate: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem da reserva de garantia.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Dias <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={userFees.boleto.retentionDays}
                                onChange={(e) => setUserFees({...userFees, boleto: {...userFees.boleto, retentionDays: e.target.value}})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Deixe vazio para usar padrão"
                              />
                              <p className="text-xs text-slate-500 mt-1">Dias da reserva de garantia</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveFees('boleto')}
                            disabled={savingFees}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-green-400"
                          >
                            {savingFees ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Configurações Cartão */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedFeeSection(expandedFeeSection === 'cartao' ? '' : 'cartao')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <span className="text-base font-medium text-slate-800">Configurações Cartão</span>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedFeeSection === 'cartao' ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedFeeSection === 'cartao' && (
                        <div className="px-6 py-4 border-t border-slate-200">
                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de operação</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa fixa <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.cartao.fixedFee}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, fixedFee: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor fixo cobrado por transação.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.cartao.variableFee}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, variableFee: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem cobrada por transação.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa fixa 6x <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.cartao.fixedFee6x}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, fixedFee6x: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor fixo cobrado para transações em 6x.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável 6x <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.cartao.variableFee6x}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, variableFee6x: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem cobrada para transações em 6x.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa fixa 12x <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.cartao.fixedFee12x}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, fixedFee12x: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor fixo cobrado para transações em 12x.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável 12x <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.cartao.variableFee12x}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, variableFee12x: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem cobrada para transações em 12x.</p>
                            </div>
                          </div>

                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de retenção</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Porcentagem <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.cartao.retentionRate}
                                  onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, retentionRate: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem da reserva de garantia.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Dias <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={userFees.cartao.retentionDays}
                                onChange={(e) => setUserFees({...userFees, cartao: {...userFees.cartao, retentionDays: e.target.value}})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Deixe vazio para usar padrão"
                              />
                              <p className="text-xs text-slate-500 mt-1">Dias da reserva de garantia</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveFees('cartao')}
                            disabled={savingFees}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-green-400"
                          >
                            {savingFees ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Configurações Saque */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedFeeSection(expandedFeeSection === 'saque' ? '' : 'saque')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <span className="text-base font-medium text-slate-800">Configurações Saque</span>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedFeeSection === 'saque' ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedFeeSection === 'saque' && (
                        <div className="px-6 py-4 border-t border-slate-200">
                          <h3 className="text-base font-semibold text-slate-800 mb-4">Taxa de operação</h3>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa fixa <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <input
                                  type="text"
                                  value={userFees.saque.fixedFee}
                                  onChange={(e) => setUserFees({...userFees, saque: {...userFees.saque, fixedFee: e.target.value}})}
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor fixo cobrado por saque.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa variável <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.saque.variableFee}
                                  onChange={(e) => setUserFees({...userFees, saque: {...userFees.saque, variableFee: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Porcentagem cobrada por saque.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Taxa mínima de saque <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={userFees.saque.minWithdrawal}
                                  onChange={(e) => setUserFees({...userFees, saque: {...userFees.saque, minWithdrawal: e.target.value}})}
                                  className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Deixe vazio para usar padrão"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Valor mínimo cobrado por saque.</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveFees('saque')}
                            disabled={savingFees}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-green-400"
                          >
                            {savingFees ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção Saques */}
                {activeSection === 'saques' && (
                  <div className="bg-white rounded-lg border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Configuração de saques</h2>

                    {/* Limites */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Limites</h3>
                      <div className="space-y-4">
                        {/* Saque máximo diário */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Saque máximo diário
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500">R$</span>
                            <input
                              type="text"
                              value={withdrawalConfig.maxDailyWithdrawal}
                              onChange={(e) => setWithdrawalConfig({...withdrawalConfig, maxDailyWithdrawal: e.target.value})}
                              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                              placeholder="Sem limite"
                            />
                          </div>
                        </div>

                        {/* Valor máximo por saque */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Valor máximo por saque
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500">R$</span>
                            <input
                              type="text"
                              value={withdrawalConfig.maxPerWithdrawal}
                              onChange={(e) => setWithdrawalConfig({...withdrawalConfig, maxPerWithdrawal: e.target.value})}
                              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                              placeholder="Sem limite"
                            />
                          </div>
                        </div>

                        {/* Valor mínimo por saque */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Valor mínimo por saque
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500">R$</span>
                            <input
                              type="text"
                              value={withdrawalConfig.minPerWithdrawal}
                              onChange={(e) => setWithdrawalConfig({...withdrawalConfig, minPerWithdrawal: e.target.value})}
                              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                              placeholder="R$ 10,00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configurações adicionais */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Configurações adicionais</h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setWithdrawalConfig({...withdrawalConfig, autoApprovalEnabled: !withdrawalConfig.autoApprovalEnabled})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            withdrawalConfig.autoApprovalEnabled ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              withdrawalConfig.autoApprovalEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <label className="text-sm text-slate-700">
                          Habilitar aprovação automática de saques pelo painel
                        </label>
                      </div>
                    </div>

                    {/* Botão Salvar */}
                    <button
                      onClick={handleSaveWithdrawalConfig}
                      disabled={savingWithdrawal}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {savingWithdrawal ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}

                {/* Seção Antecipação */}
                {activeSection === 'antecipacao' && (
                  <div className="bg-white rounded-lg border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Alterar taxas de Antecipação</h2>

                    {/* Avisos */}
                    <div className="space-y-3 mb-6">
                      <p className="text-sm text-slate-700">
                        As taxas de antecipação são aplicadas sobre o valor total da transação e são cobradas no momento da venda.
                      </p>
                      <p className="text-sm text-slate-700">
                        Caso você use alguma adquirente que seja bolsão, é necessário que você tenha liberado na sua conta master nessa adquirente o mínimo possível de antecipação, para que a antecipação seja feita corretamente.
                      </p>
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-sm text-red-700">
                          No campo de 'Antecipação' você precisa colocar o maior valor de antecipação que você conseguiu entre as adquirentes. Exemplo: Se você conseguiu com a PagarMe uma antecipação de D+2, mas com a Iugu você conseguiu apenas D+14, você deve colocar D+14 no campo de 'Antecipação'.
                        </p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <p className="text-sm text-blue-700">
                          A antecipação funciona apenas para vendas no cartão.
                        </p>
                      </div>
                    </div>

                    {/* Formulário */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      {/* Antecipação */}
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Antecipação <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={anticipationConfig.anticipationDays}
                          onChange={(e) => setAnticipationConfig({...anticipationConfig, anticipationDays: e.target.value})}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 14"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Selecione a antecipação em dias para o produtor utilizar
                        </p>
                      </div>

                      {/* Taxa de antecipação */}
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Taxa de antecipação <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={anticipationConfig.anticipationRate}
                            onChange={(e) => setAnticipationConfig({...anticipationConfig, anticipationRate: e.target.value})}
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 2.5"
                          />
                          <span className="absolute right-3 top-3 text-slate-500">%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Valor cobrado para a antecipação de valores
                        </p>
                      </div>

                      {/* Ativar antecipação customizada */}
                      <div className="flex items-center">
                        <div className="flex flex-col justify-center">
                          <label className="block text-sm font-medium text-slate-900 mb-3">
                            Ativar antecipação customizada
                          </label>
                          <button
                            onClick={() => setAnticipationConfig({
                              ...anticipationConfig,
                              customAnticipationEnabled: !anticipationConfig.customAnticipationEnabled
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              anticipationConfig.customAnticipationEnabled ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                anticipationConfig.customAnticipationEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Calcular por dias antecipados */}
                    <div className="mb-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={anticipationConfig.calculateByDays}
                          onChange={(e) => setAnticipationConfig({...anticipationConfig, calculateByDays: e.target.checked})}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Calcular por dias antecipados</span>
                      </label>
                    </div>

                    {/* Botão Salvar */}
                    <button
                      onClick={handleSaveAnticipationConfig}
                      disabled={savingAnticipation}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {savingAnticipation ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}

                {/* Outras seções - Placeholder */}
                {!['kyc', 'documentos', 'contas_bancarias', 'contas_split', 'saldo', 'taxas', 'saques', 'antecipacao'].includes(activeSection) && (
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {activeSection.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h3>
                    <p className="text-slate-600">Conteúdo desta seção será implementado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-600 font-medium">Selecione um usuário para ver os detalhes</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal para solicitar alterações */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                Solicitar alteração - {messageType}
              </h3>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessageText('')
                  setMessageType('')
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                Usuário: <span className="font-medium text-slate-800">{selectedUser?.name}</span>
              </p>
              <p className="text-sm text-slate-600 mb-4">
                Email: <span className="font-medium text-slate-800">{selectedUser?.email}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensagem para o usuário
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Descreva quais alterações são necessárias em ${messageType}...`}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                O usuário receberá esta mensagem e poderá fazer as alterações solicitadas.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessageText('')
                  setMessageType('')
                }}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendMessage}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                📤 Enviar mensagem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Link de Acesso */}
      {showLoginLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Link de acesso - {selectedUser?.name}
              </h3>
              <button
                onClick={() => setShowLoginLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Corpo */}
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Você pode acessar o painel do produtor através do botão abaixo.
                Você deve copiar o link e acessar em uma <strong>nova guia anônima</strong> no seu navegador.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Dica:</strong> Use o comando <code className="bg-blue-100 px-1 py-0.5 rounded text-xs font-mono">Ctrl + Shift + N</code> para abrir uma nova guia anônima.
                </p>
              </div>

              {/* Botão Copiar */}
              <button
                onClick={handleCopyLoginLink}
                className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium"
              >
                📋 Copiar link de acesso
              </button>

              {/* Contador de expiração */}
              {linkExpiresIn > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    ⚠️ Link expira em <strong>{linkExpiresIn} segundos</strong>
                  </p>
                </div>
              ) : (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-semibold">
                    ❌ Link expirado! Feche e gere um novo.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLoginLinkModal(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />

      {/* Platform Modal */}
      <PlatformModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Modal de Edição de KYC */}
      <EditKYCModal
        isOpen={showEditKYCModal}
        onClose={() => setShowEditKYCModal(false)}
        user={selectedUser}
        onSave={handleSaveKYC}
      />

      {/* Modal de Edição de Dados Bancários */}
      <EditBankModal
        isOpen={showEditBankModal}
        onClose={() => setShowEditBankModal(false)}
        user={selectedUser}
        onSave={handleSaveBank}
      />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Confirmar Exclusão</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-600 mb-2">
                Tem certeza que deseja excluir o usuário <span className="font-semibold text-slate-900">{selectedUser.name}</span>?
              </p>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingUser}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingUser ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  'Sim, excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformLayout>
  )
}
