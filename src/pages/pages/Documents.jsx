import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../contexts/AuthContext'

// Dados mock do usuário com status de aprovação
const mockUserApprovalData = {
  id: 2,
  name: 'João Silva',
  email: 'joao@email.com',
  status: 'not_submitted', // 'not_submitted', 'pending', 'awaiting_adjustment', 'approved'

  kyc: {
    status: 'not_submitted' // 'not_submitted', 'pending', 'approved', 'rejected'
  },

  documentos: {
    statusSelfie: 'not_submitted', // 'not_submitted', 'pending', 'approved', 'rejected'
    statusDocumento: 'not_submitted' // 'not_submitted', 'pending', 'approved', 'rejected'
  },

  dadosBancarios: {
    status: 'not_submitted' // 'not_submitted', 'pending', 'approved', 'rejected'
  },

  notifications: [] // Inicia vazio - só adiciona quando admin realmente enviar mensagem
}

export default function Documents() {
  const { user } = useAuth()
  const [userApproval, setUserApproval] = useState(null)
  const [accountType, setAccountType] = useState('pf')
  const [formData, setFormData] = useState({
    // PF
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    cep: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',

    // PJ
    companyName: '',
    tradeName: '',
    cnpj: '',
    legalRepresentative: '',
    legalRepresentativeCpf: '',
    legalRepresentativeBirthDate: '',

    // KYC adicional
    email: '',

    // Bancários
    bankName: '',
    bankCode: '',
    accountType: 'corrente',
    agency: '',
    agencyDigit: '',
    accountNumber: '',
    accountDigit: '',
    accountHolder: '',
    accountHolderDocument: '',
    pixKeyType: 'cpf',
    pixKey: ''
  })

  const [documents, setDocuments] = useState({
    selfie: null,
    idDocument: null
  })

  const [agreedTerms, setAgreedTerms] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'success' ou 'error'
  const [modalMessage, setModalMessage] = useState('')

  // Carregar dados de aprovação do usuário
  useEffect(() => {
    if (user && user.id) {
      loadUserVerification()
    }
  }, [user])

  const loadUserVerification = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/verification`)
      const data = await response.json()
      setUserApproval(data)

      // Carregar dados do formulário salvos anteriormente
      if (data.formData) {
        setFormData({
          fullName: data.formData.fullName || '',
          cpf: data.formData.cpf || '',
          birthDate: data.formData.birthDate || '',
          phone: data.formData.phone || '',
          cep: data.formData.cep || '',
          address: data.formData.address || '',
          addressNumber: data.formData.addressNumber || '',
          addressComplement: data.formData.addressComplement || '',
          neighborhood: data.formData.neighborhood || '',
          city: data.formData.city || '',
          state: data.formData.state || '',
          // PJ
          companyName: data.formData.companyName || '',
          tradeName: data.formData.tradeName || '',
          cnpj: data.formData.cnpj || '',
          legalRepresentative: data.formData.legalRepresentative || '',
          legalRepresentativeCpf: data.formData.legalRepresentativeCpf || '',
          legalRepresentativeBirthDate: data.formData.legalRepresentativeBirthDate || '',
          // KYC adicional
          email: data.formData.email || '',
          // Bancários
          bankName: data.formData.bankName || '',
          bankCode: data.formData.bankCode || '',
          accountType: data.formData.accountType || 'corrente',
          agency: data.formData.agency || '',
          agencyDigit: data.formData.agencyDigit || '',
          accountNumber: data.formData.accountNumber || '',
          accountDigit: data.formData.accountDigit || '',
          accountHolder: data.formData.accountHolder || '',
          accountHolderDocument: data.formData.accountHolderDocument || '',
          pixKeyType: data.formData.pixKeyType || 'cpf',
          pixKey: data.formData.pixKey || ''
        })
      }

      // Carregar tipo de conta selecionado
      if (data.accountType) {
        setAccountType(data.accountType)
      }

      // Carregar documentos enviados (se existirem)
      if (data.documents) {
        const loadedDocs = {}
        if (data.documents.selfie) {
          loadedDocs.selfie = {
            name: data.documents.selfie,
            data: data.documents.selfieUrl
          }
        }
        // ✅ Carregar documento de identificação (idDocument)
        if (data.documents.idDocument) {
          loadedDocs.idDocument = {
            name: data.documents.idDocument,
            data: data.documents.idDocumentUrl
          }
        }
        if (data.documents.idFront) {
          loadedDocs.idFront = {
            name: data.documents.idFront,
            data: data.documents.idFrontUrl
          }
        }
        if (data.documents.idBack) {
          loadedDocs.idBack = {
            name: data.documents.idBack,
            data: data.documents.idBackUrl
          }
        }
        if (data.documents.socialContract) {
          loadedDocs.socialContract = {
            name: data.documents.socialContract,
            data: data.documents.socialContractUrl
          }
        }
        if (Object.keys(loadedDocs).length > 0) {
          setDocuments(loadedDocs)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar verificação:', error)
      setUserApproval(mockUserApprovalData)
    }
  }

  // Auto-save: Salvar rascunho automaticamente quando dados mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && (formData.fullName || formData.cpf || Object.keys(documents).length > 0)) {
        saveDraft()
      }
    }, 2000) // Salva 2 segundos após a última alteração

    return () => clearTimeout(timeoutId)
  }, [formData, documents, accountType])

  const saveDraft = async () => {
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/verification/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          documents,
          accountType
        })
      })
      console.log('✅ Rascunho salvo automaticamente')
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    // Limpar erro do campo ao digitar
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: false })
    }
  }

  // Função auxiliar para classe de input com validação
  const getInputClassName = (fieldName) => {
    return `w-full px-4 py-2 border-2 rounded-lg focus:ring-2 ${
      fieldErrors[fieldName]
        ? 'border-red-500 focus:ring-red-500 bg-red-50'
        : 'border-gray-300 focus:ring-emerald-500'
    }`
  }

  const handleFileChange = (docType, file) => {
    // Converter arquivo para base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setDocuments({
        ...documents,
        [docType]: {
          name: file.name,
          data: reader.result // Base64 string
        }
      })
    }
    reader.readAsDataURL(file)
  }

  // Formatar data automaticamente ao sair do campo
  const formatBirthDate = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
    }
    return value
  }

  // Formatar telefone automaticamente ao sair do campo
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    }
    return value
  }

  // Buscar CEP automaticamente
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setFormData({
            ...formData,
            cep: cep,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          })
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleSubmit = async () => {
    // Limpar mensagens e erros anteriores
    setValidationError(null)
    setSuccessMessage(null)
    const errors = {}

    // Validações - marcar campos com erro
    if (!formData.fullName) errors.fullName = true
    if (!formData.cpf) errors.cpf = true
    if (!formData.phone) errors.phone = true
    if (!formData.birthDate) errors.birthDate = true
    if (!formData.email) errors.email = true

    // Validar campos de endereço
    if (!formData.cep) errors.cep = true
    if (!formData.address) errors.address = true
    if (!formData.addressNumber) errors.addressNumber = true
    if (!formData.neighborhood) errors.neighborhood = true
    if (!formData.city) errors.city = true
    if (!formData.state) errors.state = true

    if (accountType === 'pj') {
      if (!formData.cnpj) errors.cnpj = true
      if (!formData.companyName) errors.companyName = true
      if (!formData.legalRepresentative) errors.legalRepresentative = true
      if (!formData.legalRepresentativeCpf) errors.legalRepresentativeCpf = true
      if (!formData.legalRepresentativeBirthDate) errors.legalRepresentativeBirthDate = true
    }

    if (!documents.selfie) errors.selfie = true
    if (!documents.idDocument) errors.idDocument = true

    if (!formData.bankName) errors.bankName = true
    if (!formData.agency) errors.agency = true
    if (!formData.accountNumber) errors.accountNumber = true
    if (!formData.accountDigit) errors.accountDigit = true
    if (!formData.accountHolder) errors.accountHolder = true
    if (!formData.accountHolderDocument) errors.accountHolderDocument = true
    if (!formData.pixKeyType) errors.pixKeyType = true
    if (!formData.pixKey) errors.pixKey = true

    if (!agreedTerms) errors.agreedTerms = true

    setFieldErrors(errors)

    // Se houver erros, mostrar modal de erro
    if (Object.keys(errors).length > 0) {
      setModalType('error')
      setModalMessage('Por favor, preencha todos os campos obrigatórios marcados em vermelho antes de enviar.')
      setShowModal(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Enviar para o backend
    setIsSubmitting(true)
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          documents,
          accountType
        })
      })

      const data = await response.json()

      if (data.success) {
        setModalType('success')
        setModalMessage('Documentos enviados para análise com sucesso! Você receberá uma notificação quando forem analisados.')
        setShowModal(true)
        loadUserVerification()
      } else {
        setModalType('error')
        setModalMessage('Erro ao enviar documentos. Tente novamente.')
        setShowModal(true)
      }
    } catch (error) {
      console.error('Erro ao enviar documentos:', error)
      setModalType('error')
      setModalMessage('Erro ao enviar documentos. Verifique sua conexão e tente novamente.')
      setShowModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para determinar se documentos foram enviados
  const isDocumentSubmitted = () => {
    return userApproval?.status !== 'not_submitted'
  }

  // Função para obter status de cada seção
  const getSectionStatus = (sectionStatus) => {
    // Se não foi enviado ainda OU se o status da seção é 'not_submitted'
    if (!isDocumentSubmitted() || sectionStatus === 'not_submitted') {
      return {
        icon: '📋',
        text: 'Aguardando Preenchimento',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300'
      }
    }

    // Mapeamento de status após envio
    const statusMap = {
      approved: {
        icon: '✅',
        text: 'Aprovado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500'
      },
      pending: {
        icon: '⏳',
        text: 'Em Análise',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500'
      },
      rejected: {
        icon: '⚠️',
        text: 'Aguardando Reenvio',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500'
      }
    }
    return statusMap[sectionStatus] || statusMap.pending
  }

  // Status específico para documentos (precisa verificar selfie E documento)
  const getDocumentStatus = () => {
    const selfieStatus = userApproval?.documentos?.statusSelfie
    const docStatus = userApproval?.documentos?.statusDocumento

    // Se não foi enviado ainda OU se os status são 'not_submitted'
    if (!isDocumentSubmitted() || selfieStatus === 'not_submitted' || docStatus === 'not_submitted') {
      return {
        icon: '📄',
        text: 'Aguardando Envio',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300'
      }
    }

    if (selfieStatus === 'approved' && docStatus === 'approved') {
      return getSectionStatus('approved')
    } else if (selfieStatus === 'rejected' || docStatus === 'rejected') {
      return getSectionStatus('rejected')
    } else {
      return getSectionStatus('pending')
    }
  }

  const kycStatus = getSectionStatus(userApproval?.kyc?.status || 'pending')
  const docsStatus = getDocumentStatus()
  const bankStatus = getSectionStatus(userApproval?.dadosBancarios?.status || 'pending')

  const bankList = [
    '001 - Banco do Brasil',
    '003 - Banco da Amazônia',
    '004 - Banco do Nordeste',
    '012 - Banco Inbursa',
    '021 - Banestes',
    '025 - Banco Alfa',
    '033 - Santander',
    '036 - Banco Bradesco BBI',
    '037 - Banco do Estado do Pará',
    '041 - Banrisul',
    '047 - Banco do Estado de Sergipe',
    '060 - Confidence',
    '062 - Hipercard',
    '063 - Banco Bradescard',
    '065 - AndBank',
    '066 - Banco Morgan Stanley',
    '069 - Banco Crefisa',
    '070 - BRB - Banco de Brasília',
    '074 - Banco J. Safra',
    '075 - Banco ABN Amro',
    '076 - Banco KDB',
    '077 - Inter',
    '078 - Haitong',
    '079 - Banco Original do Agronegócio',
    '080 - BT',
    '081 - BancoSeguro',
    '082 - Banco Topázio',
    '083 - Banco da China Brasil',
    '084 - Uniprime',
    '085 - Cooperativa Central de Crédito - Ailos',
    '089 - Credisan',
    '091 - Unicred',
    '092 - BRK',
    '093 - Pólocred',
    '094 - Banco Finaxis',
    '095 - Banco Confidence de Câmbio',
    '096 - Banco B3',
    '097 - Credisis',
    '098 - Credialiança',
    '099 - Uniprime Central',
    '100 - Planner',
    '101 - Renascença',
    '102 - XP Investimentos',
    '104 - Caixa Econômica Federal',
    '105 - Lecca',
    '107 - Banco Bocom BBM',
    '108 - PortoCred',
    '111 - Oliveira Trust',
    '113 - Magliano',
    '114 - Central das Cooperativas de Economia e Crédito Mútuo',
    '117 - Advanced',
    '118 - Standard Chartered',
    '119 - Banco Western Union',
    '120 - Banco Rodobens',
    '121 - Banco Agibank',
    '122 - Banco Bradesco BERJ',
    '124 - Banco Woori Bank',
    '125 - Brasil Plural',
    '126 - BR Partners',
    '127 - Codepe',
    '128 - MS Bank',
    '129 - UBS Brasil',
    '130 - Caruana',
    '131 - Tullett Prebon',
    '132 - ICBC do Brasil',
    '133 - Cresol',
    '134 - BGC Liquidez',
    '135 - Gradual',
    '136 - Unicred',
    '137 - Multimoney',
    '138 - Get Money',
    '139 - Intesa Sanpaolo',
    '140 - Easynvest',
    '142 - Broker Brasil',
    '143 - Treviso',
    '144 - Bexs',
    '145 - Levycam',
    '146 - Guitta',
    '149 - Facta',
    '157 - ICAP do Brasil',
    '159 - Casa Credito',
    '163 - Commerzbank',
    '169 - Banco Olé',
    '172 - Albatross',
    '173 - BRL Trust',
    '174 - Pernambucanas',
    '177 - Guide',
    '180 - CM Capital Markets',
    '183 - Socred',
    '184 - Banco Itaú BBA',
    '188 - Ativa Investimentos',
    '189 - HS Financeira',
    '190 - Cooperativa de Economia e Crédito Mútuo dos Servidores Públicos Estaduais do Rio',
    '191 - Nova Futura',
    '194 - Parmetal',
    '196 - Fair Corretora de Câmbio',
    '197 - Stone Pagamentos',
    '208 - Banco BTG Pactual',
    '212 - Banco Original',
    '213 - Banco Arbi',
    '217 - Banco John Deere',
    '218 - Banco BS2',
    '222 - Banco Credit Agrícole',
    '224 - Banco Fibra',
    '233 - Banco Cifra',
    '237 - Bradesco',
    '241 - Banco Clássico',
    '243 - Banco Máxima',
    '246 - Banco ABC Brasil',
    '249 - Banco Investcred',
    '250 - BCV',
    '253 - Bexs Corretora de Câmbio',
    '254 - Parana Banco',
    '260 - Nu Pagamentos (Nubank)',
    '265 - Banco Fator',
    '266 - Banco Cédula',
    '268 - Barigui',
    '269 - HSBC',
    '270 - Sagitur',
    '271 - IB Corretora de Câmbio, Títulos e Valores Mobiliários',
    '276 - Senff',
    '278 - Genial Investimentos',
    '279 - CCR de Primavera do Leste',
    '280 - Avista',
    '281 - Cooperativa de Crédito Rural Coopavel',
    '283 - RB Capital',
    '285 - Frente Corretora de Câmbio',
    '286 - CCR de Ouro',
    '288 - Carol',
    '289 - Decyseo',
    '290 - PagSeguro',
    '292 - BS2 Distribuidora de Títulos e Valores Mobiliários',
    '293 - Lastro RDV',
    '296 - Vision',
    '298 - Vips',
    '299 - Sorocred',
    '300 - Banco de la Nacion Argentina',
    '301 - BPP Instituição de Pagamentos',
    '306 - Portopar',
    '307 - Terra Investimentos',
    '309 - DigitalGarou',
    '310 - Vortx',
    '318 - Banco BMG',
    '320 - China Construction Bank',
    '321 - Crefaz',
    '322 - Cooperativa de Crédito Rural de Abelardo Luz',
    '323 - Mercado Pago',
    '325 - Órama',
    '329 - QI Sociedade de Crédito Direto',
    '330 - Banco Bari de Investimentos e Financiamentos',
    '331 - Fram Capital',
    '332 - Acesso Soluções de Pagamento',
    '335 - Banco Digio',
    '336 - C6 Bank',
    '340 - Super Pagamentos',
    '341 - Itaú',
    '342 - Creditas',
    '343 - FFA Sociedade de Crédito ao Microempreendedor e à Empresa de Pequeno Porte',
    '348 - Banco XP',
    '349 - AL5',
    '352 - Toro Investimentos',
    '354 - Necton Investimentos',
    '355 - Ótimo Sociedade de Crédito Direto',
    '359 - Zema Crédito, Financiamento e Investimento',
    '360 - Trinus Capital',
    '362 - Cielo',
    '364 - Gerencianet Pagamentos do Brasil',
    '365 - Solidus',
    '366 - Banco Societe Generale Brasil',
    '367 - Vitreo',
    '368 - Banco CSF',
    '369 - BanQi',
    '370 - Mizuho',
    '371 - Warren Corretora de Valores Mobiliários e Câmbio',
    '373 - UP.P Sociedade de Empréstimo Entre Pessoas',
    '374 - Realize Crédito, Financiamento e Investimento',
    '376 - Banco J.P. Morgan',
    '377 - BNY Mellon',
    '378 - BBC Leasing',
    '379 - Cecred',
    '380 - PicPay',
    '381 - Banco Mercedes-Benz',
    '382 - Fiducia Sociedade de Crédito ao Microempreendedor e à Empresa de Pequeno Porte',
    '383 - Boletobancário.com',
    '384 - Global Finanças Sociedade de Crédito ao Microempreendedor e à Empresa de Pequeno Porte',
    '387 - Banco Toyota',
    '389 - Banco Mercantil do Brasil',
    '390 - Banco GM',
    '391 - CCR de Ibiam',
    '393 - Banco Volkswagen',
    '394 - Banco Bradesco Financiamentos',
    '396 - Banco Hub',
    '397 - Listo Sociedade de Credito Direto',
    '399 - Kirton Bank',
    '403 - Cora Sociedade de Crédito Direto',
    '404 - Sumup Sociedade de Crédito Direto',
    '406 - Accredito Sociedade de Crédito Direto',
    '407 - Banco Cartos',
    '408 - Bônuscred Sociedade de Crédito Direto',
    '410 - Planner Sociedade de Crédito ao Microempreendedor',
    '412 - Banco Capital',
    '413 - BV Financeira',
    '416 - Banco Inter',
    '418 - Neon Pagamentos',
    '419 - Bari Companhia Hipotecária',
    '422 - Banco Safra',
    '450 - Fitbank Pagamentos Eletrônicos',
    '456 - Banco MUFG',
    '460 - Banco Triângulo',
    '463 - Banco Rendimento',
    '473 - Banco Caixa Geral - Brasil',
    '477 - Citibank',
    '479 - Banco ItauBank',
    '487 - Deutsche Bank',
    '488 - JPMorgan Chase Bank',
    '492 - ING Bank',
    '495 - Banco de La Provincia de Buenos Aires',
    '505 - Banco Credit Suisse',
    '600 - Banco Luso Brasileiro',
    '604 - Banco Industrial do Brasil',
    '610 - Banco VR',
    '611 - Banco Paulista',
    '612 - Banco Guanabara',
    '613 - Omni Banco',
    '623 - Banco Pan',
    '626 - Banco C6 Consignado',
    '630 - Banco Smartbank',
    '633 - Banco Rendimento',
    '634 - Banco Triângulo',
    '637 - Banco Sofisa',
    '643 - Banco Pine',
    '653 - Banco Indusval',
    '654 - Banco A.J. Renner',
    '655 - Banco Votorantim',
    '707 - Banco Daycoval',
    '712 - Banco Ourinvest',
    '739 - Banco Cetelem',
    '741 - Banco Ribeirão Preto',
    '743 - Banco Semear',
    '745 - Banco Citibank',
    '746 - Banco Modal',
    '747 - Banco Rabobank International',
    '748 - Sicredi',
    '751 - Scotiabank',
    '752 - Banco BNP Paribas Brasil',
    '753 - Novo Banco Continental',
    '754 - Banco Sistema',
    '755 - Bank of America Merrill Lynch',
    '756 - Sicoob',
    '757 - Banco Keb Hana do Brasil'
  ]

  // Filtrar notificações não lidas
  const unreadNotifications = userApproval?.notifications?.filter(n => !n.read) || []

  // Determinar quais seções precisam de reenvio
  const getRejectedSections = () => {
    const sections = []
    if (userApproval?.kyc?.status === 'rejected') sections.push('Cadastro (KYC)')
    if (userApproval?.documentos?.statusSelfie === 'rejected' || userApproval?.documentos?.statusDocumento === 'rejected') {
      sections.push('Documentos')
    }
    if (userApproval?.dadosBancarios?.status === 'rejected') sections.push('Conta Bancária')
    return sections
  }

  const rejectedSections = getRejectedSections()

  return (
    <>
      {/* Modal de Alerta Profissional */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            {/* Header do Modal */}
            <div className={`px-6 pt-6 pb-4 rounded-t-2xl ${
              modalType === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {modalType === 'success' ? (
                      <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">
                    {modalType === 'success' ? '✓ Sucesso!' : '⚠ Atenção'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {modalMessage}
              </p>
            </div>

            {/* Footer do Modal */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition transform hover:scale-105 ${
                  modalType === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                OK, Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📄 Verificação de Conta</h2>
          <p className="text-sm text-gray-600">Complete seu cadastro para ativar sua conta</p>
        </div>

        {/* Mensagem de Erro de Validação */}
        {validationError && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-1">Atenção</h3>
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
              <button
                onClick={() => setValidationError(null)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 mb-1">Sucesso!</h3>
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="flex-shrink-0 text-green-500 hover:text-green-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Banner de Status Geral */}
        {/* Estado: Não enviado (inicial) */}
        {!isDocumentSubmitted() && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800 font-semibold text-center">
                ⚠️ Sua conta está pendente de verificação. Envie os documentos para liberar sua conta e começar a vender.
              </p>
            </div>
          </div>
        )}

        {/* Estado: Em análise (documentos enviados) */}
        {isDocumentSubmitted() && userApproval?.status === 'pending' && rejectedSections.length === 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-6">
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 text-orange-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <p className="text-orange-800 font-semibold text-center">
                ⏳ Seus documentos estão em análise. Aguarde a aprovação do administrador.
              </p>
            </div>
          </div>
        )}

        {/* Estado: Aguardando reenvio (alguma seção rejeitada) */}
        {rejectedSections.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800 font-semibold text-center">
                📝 Ajustes necessários em <strong>{rejectedSections.join(' e ')}</strong>. Verifique as observações e reenvie.
              </p>
            </div>
          </div>
        )}

        {/* Estado: Aprovado - Banner não aparece */}

        {/* Notificações do Administrador */}
        {unreadNotifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-orange-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📬 Mensagens do Administrador</h3>
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <div key={notification.id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="font-bold text-orange-900 mb-1">
                        {notification.section}
                      </p>
                      <p className="text-sm text-orange-800 mb-2">{notification.message}</p>
                      <p className="text-xs text-orange-600">
                        {new Date(notification.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status das Seções */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* KYC Status */}
          <div className={`bg-white rounded-lg shadow border-l-4 ${kycStatus.borderColor} p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${kycStatus.bgColor} rounded-full flex items-center justify-center text-2xl`}>
                {kycStatus.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Cadastro (KYC)</h4>
                <p className={`text-sm font-medium ${kycStatus.color}`}>{kycStatus.text}</p>
              </div>
            </div>
          </div>

          {/* Documentos Status */}
          <div className={`bg-white rounded-lg shadow border-l-4 ${docsStatus.borderColor} p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${docsStatus.bgColor} rounded-full flex items-center justify-center text-2xl`}>
                {docsStatus.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Documentos</h4>
                <p className={`text-sm font-medium ${docsStatus.color}`}>{docsStatus.text}</p>
              </div>
            </div>
          </div>

          {/* Dados Bancários Status */}
          <div className={`bg-white rounded-lg shadow border-l-4 ${bankStatus.borderColor} p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${bankStatus.bgColor} rounded-full flex items-center justify-center text-2xl`}>
                {bankStatus.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Conta Bancária</h4>
                <p className={`text-sm font-medium ${bankStatus.color}`}>{bankStatus.text}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* ETAPA 1: KYC */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-emerald-600 flex-1">
                ETAPA 1: DADOS CADASTRAIS (KYC)
              </h3>
              {userApproval?.kyc?.status === 'approved' && (
                <span className="ml-4 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✅ Aprovado
                </span>
              )}
            </div>

            {/* Tipo de Conta */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={accountType === 'pf'}
                    onChange={() => setAccountType('pf')}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pessoa Física (PF)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={accountType === 'pj'}
                    onChange={() => setAccountType('pj')}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pessoa Jurídica (PJ)</span>
                </label>
              </div>
            </div>

            {/* Dados PF */}
            {accountType === 'pf' && (
              <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4">Dados Pessoais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={getInputClassName('fullName')}
                      placeholder="João Silva Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className={getInputClassName('cpf')}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      onBlur={(e) => handleInputChange('birthDate', formatBirthDate(e.target.value))}
                      className={getInputClassName('birthDate')}
                      placeholder="DD/MM/AAAA"
                      maxLength="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                      className={getInputClassName('phone')}
                      placeholder="(51) 98765-4321"
                    />
                  </div>
                </div>

                {/* Campo Email */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={getInputClassName('email')}
                    placeholder="seuemail@exemplo.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      onBlur={handleCepBlur}
                      className={getInputClassName('cep')}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={getInputClassName('address')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.addressNumber}
                      onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                      className={getInputClassName('addressNumber')}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.addressComplement}
                      onChange={(e) => handleInputChange('addressComplement', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      className={getInputClassName('neighborhood')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={getInputClassName('city')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={getInputClassName('state')}
                      required
                    >
                      <option value="">UF</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Dados PJ */}
            {accountType === 'pj' && (
              <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4">Dados da Empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razão Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={getInputClassName('companyName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                    <input
                      type="text"
                      value={formData.tradeName}
                      onChange={(e) => handleInputChange('tradeName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      className={getInputClassName('cnpj')}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável Legal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.legalRepresentative}
                      onChange={(e) => handleInputChange('legalRepresentative', e.target.value)}
                      className={getInputClassName('legalRepresentative')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF do Responsável <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.legalRepresentativeCpf}
                      onChange={(e) => handleInputChange('legalRepresentativeCpf', e.target.value)}
                      className={getInputClassName('legalRepresentativeCpf')}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento do Responsável <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.legalRepresentativeBirthDate}
                      onChange={(e) => handleInputChange('legalRepresentativeBirthDate', e.target.value)}
                      onBlur={(e) => handleInputChange('legalRepresentativeBirthDate', formatBirthDate(e.target.value))}
                      className={getInputClassName('legalRepresentativeBirthDate')}
                      placeholder="DD/MM/AAAA"
                      maxLength="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="51987654321"
                    />
                  </div>
                </div>

                {/* Campo Email */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={getInputClassName('email')}
                    placeholder="seuemail@exemplo.com"
                    required
                  />
                </div>

                {/* Endereço PJ (mesma estrutura do PF) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      onBlur={handleCepBlur}
                      className={getInputClassName('cep')}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={getInputClassName('address')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.addressNumber}
                      onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                      className={getInputClassName('addressNumber')}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.addressComplement}
                      onChange={(e) => handleInputChange('addressComplement', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      className={getInputClassName('neighborhood')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={getInputClassName('city')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={getInputClassName('state')}
                      required
                    >
                      <option value="">UF</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ETAPA 2: DOCUMENTOS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-emerald-600 flex-1">
                ETAPA 2: DOCUMENTOS
              </h3>
              {(userApproval?.documentos?.statusSelfie === 'approved' && userApproval?.documentos?.statusDocumento === 'approved') && (
                <span className="ml-4 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✅ Aprovado
                </span>
              )}
            </div>

            <div className="border rounded-lg p-6 bg-gray-50 space-y-6">
              {/* Selfie com Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Selfie com Documento na Mão <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 ${fieldErrors.selfie ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 bg-white`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange('selfie', e.target.files[0])
                      setFieldErrors({...fieldErrors, selfie: false})
                    }}
                    className="w-full"
                  />
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-semibold mb-1">⚠️ Importante:</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Segure o documento <strong>aberto</strong> próximo ao rosto</li>
                      <li>O documento deve estar <strong>visível e legível</strong></li>
                      <li>Seu <strong>rosto não deve ficar escondido</strong> pelo documento</li>
                      <li>Foto em ambiente bem iluminado</li>
                    </ul>
                  </div>
                  {documents.selfie && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Arquivo enviado: {documents.selfie.name}
                    </p>
                  )}
                  {fieldErrors.selfie && (
                    <p className="text-sm text-red-600 mt-2">⚠️ Selfie com documento é obrigatória</p>
                  )}
                </div>
              </div>

              {/* Documento de Identificação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🆔 Documento de Identificação (RG/CNH/RNE) <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 ${fieldErrors.idDocument ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 bg-white`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange('idDocument', e.target.files[0])
                      setFieldErrors({...fieldErrors, idDocument: false})
                    }}
                    className="w-full"
                  />
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 font-semibold mb-1">⚠️ Importante:</p>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                      <li>Tire foto do documento <strong>totalmente aberto</strong></li>
                      <li>Deve aparecer <strong>frente E verso</strong> na mesma foto</li>
                      <li>Todos os dados devem estar <strong>visíveis e legíveis</strong></li>
                      <li>Sem reflexos ou sombras sobre o documento</li>
                    </ul>
                  </div>
                  {documents.idDocument && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Arquivo enviado: {documents.idDocument.name}
                    </p>
                  )}
                  {fieldErrors.idDocument && (
                    <p className="text-sm text-red-600 mt-2">⚠️ Documento de identificação é obrigatório</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ETAPA 3: DADOS BANCÁRIOS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-emerald-600 flex-1">
                ETAPA 3: DADOS BANCÁRIOS
              </h3>
              {userApproval?.dadosBancarios?.status === 'approved' && (
                <span className="ml-4 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✅ Aprovado
                </span>
              )}
            </div>

            <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => {
                      const selectedBank = e.target.value
                      // Extrair código do banco (ex: "001 - Banco do Brasil" -> "001")
                      const bankCode = selectedBank.split(' - ')[0] || ''
                      // Atualizar ambos os campos de uma vez
                      setFormData({
                        ...formData,
                        bankName: selectedBank,
                        bankCode: bankCode
                      })
                      // Limpar erro do campo ao selecionar
                      if (fieldErrors.bankName) {
                        setFieldErrors({ ...fieldErrors, bankName: false })
                      }
                    }}
                    className={getInputClassName('bankName')}
                  >
                    <option value="">Selecione o banco</option>
                    {bankList.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                  <div className="flex gap-4 items-center h-full">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.accountType === 'corrente'}
                        onChange={() => handleInputChange('accountType', 'corrente')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="ml-2 text-sm">Corrente</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.accountType === 'poupanca'}
                        onChange={() => handleInputChange('accountType', 'poupanca')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="ml-2 text-sm">Poupança</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Agência <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.agency}
                      onChange={(e) => handleInputChange('agency', e.target.value)}
                      className={getInputClassName('agency')}
                      placeholder="0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dígito
                    </label>
                    <input
                      type="text"
                      value={formData.agencyDigit}
                      onChange={(e) => handleInputChange('agencyDigit', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                      maxLength="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Conta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className={getInputClassName('accountNumber')}
                      placeholder="00000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dígito <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.accountDigit}
                      onChange={(e) => handleInputChange('accountDigit', e.target.value)}
                      className={getInputClassName('accountDigit')}
                      placeholder="0"
                      maxLength="2"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Titular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                    className={getInputClassName('accountHolder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ do Titular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolderDocument}
                    onChange={(e) => handleInputChange('accountHolderDocument', e.target.value)}
                    className={getInputClassName('accountHolderDocument')}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-800 mb-3">Chave PIX <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Chave <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.pixKeyType}
                      onChange={(e) => handleInputChange('pixKeyType', e.target.value)}
                      className={getInputClassName('pixKeyType')}
                      required
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Telefone</option>
                      <option value="aleatoria">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chave PIX <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pixKey}
                      onChange={(e) => handleInputChange('pixKey', e.target.value)}
                      className={getInputClassName('pixKey')}
                      placeholder={
                        formData.pixKeyType === 'cpf' ? '000.000.000-00' :
                        formData.pixKeyType === 'email' ? 'seu@email.com' :
                        formData.pixKeyType === 'telefone' ? '(00) 00000-0000' : ''
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Termos */}
          <div className="space-y-3">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 text-emerald-600 mt-1"
              />
              <span className="ml-2 text-sm text-gray-700">
                Declaro que as informações fornecidas são verdadeiras e li e aceito os{' '}
                <Link to="/user-terms" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Termos de Uso</Link> e a{' '}
                <Link to="/user-privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Política de Privacidade</Link>.
              </span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium"
              onClick={() => {
                // Limpar formulário ou voltar
                window.location.reload()
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg transition font-medium shadow-lg flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : userApproval?.status === 'awaiting_adjustment' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reenviar Documentos
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Enviar para Análise
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
    </>
  )
}
