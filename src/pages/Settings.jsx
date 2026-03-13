import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'

export default function Settings() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [activeSection, setActiveSection] = useState('webhook')
  const [activeIntegrationTab, setActiveIntegrationTab] = useState('general') // 'general' ou 'notazz'

  // Abrir a seção correta baseado no parâmetro da URL
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && ['webhook', 'api', 'pixel', 'integration'].includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  // Estados para listas de itens
  const [webhooks, setWebhooks] = useState([])
  const [apis, setApis] = useState([])
  const [pixels, setPixels] = useState([])
  const [products, setProducts] = useState([])

  const [settings, setSettings] = useState({
    integration: {
      whatsapp: '',
      telegram: '',
      email: 'contato@afterpay.com',
      enableNotifications: true
    }
  })

  // Estado para integração Notazz
  const [notazzWebhookId, setNotazzWebhookId] = useState('')
  const [notazzEnabled, setNotazzEnabled] = useState(false)

  // Estados para integração Correios
  const [correiosContracts, setCorreiosContracts] = useState([])
  const [showCorreiosModal, setShowCorreiosModal] = useState(false)
  const [showEditCorreiosModal, setShowEditCorreiosModal] = useState(false)
  const [showTestCorreiosModal, setShowTestCorreiosModal] = useState(false)
  const [currentContract, setCurrentContract] = useState(null)
  const [correiosForm, setCorreiosForm] = useState({
    name: '',
    username: '',
    accessToken: '',
    contractNumber: '',
    isActive: true
  })
  const [testTrackingCode, setTestTrackingCode] = useState('')
  const [testResult, setTestResult] = useState(null)

  // Estados para integração 123Log
  const [log123Config, setLog123Config] = useState({
    enabled: false,
    webhookKey: '',
    webhookUrl: '',
    notificationSettings: {
      notifyViaBotConversa: true,
      eventsToNotify: []
    }
  })
  const [log123Logs, setLog123Logs] = useState([])
  const [showLog123TestModal, setShowLog123TestModal] = useState(false)
  const [log123TestResult, setLog123TestResult] = useState(null)

  // Buscar produtos disponíveis (criados e afiliados) do usuário
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (!user || !user.id) return

      try {
        // Buscar produtos criados pelo usuário
        const myProductsResponse = await fetch(`${config.apiUrl}/api/products?userId=${user.id}&type=my-products`)
        const myProductsData = await myProductsResponse.json()

        // Buscar produtos que o usuário está afiliado
        const affiliatedResponse = await fetch(`${config.apiUrl}/api/products?userId=${user.id}&type=affiliated`)
        const affiliatedData = await affiliatedResponse.json()

        // Combinar todos os produtos com marcador de origem
        const allProducts = [
          ...myProductsData.map(p => ({ ...p, source: 'created' })),
          ...affiliatedData.map(p => ({ ...p, source: 'affiliated' }))
        ]

        // Remover duplicatas baseado no ID do produto
        const uniqueProducts = allProducts.filter((product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
        )

        setProducts(uniqueProducts)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        setProducts([])
      }
    }
    fetchAllProducts()
  }, [user])

  // Carregar webhooks do backend
  useEffect(() => {
    const fetchWebhooks = async () => {
      if (!user || !user.id) return

      try {
        const response = await fetch(`${config.apiUrl}/api/webhooks?userId=${user.id}`)
        const data = await response.json()
        setWebhooks(data)
      } catch (error) {
        console.error('Erro ao carregar webhooks:', error)
        setWebhooks([])
      }
    }
    fetchWebhooks()
  }, [user])

  // Carregar configuração Notazz
  useEffect(() => {
    const fetchNotazzConfig = async () => {
      if (!user || !user.id) return

      try {
        const response = await fetch(`${config.apiUrl}/api/integrations/notazz?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setNotazzWebhookId(data.webhookId || '')
          setNotazzEnabled(data.enabled || false)
        }
      } catch (error) {
        console.error('Erro ao carregar configuração Notazz:', error)
      }
    }
    fetchNotazzConfig()
  }, [user])

  // Carregar contratos dos Correios
  useEffect(() => {
    const fetchCorreiosContracts = async () => {
      if (!user || !user.id) return

      try {
        const response = await fetch(`${config.apiUrl}/api/correios-contracts?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setCorreiosContracts(data)
        }
      } catch (error) {
        console.error('Erro ao carregar contratos dos Correios:', error)
        setCorreiosContracts([])
      }
    }
    fetchCorreiosContracts()
  }, [user])

  // Carregar configuração da 123Log
  useEffect(() => {
    const fetch123LogConfig = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/integrations/123log`)
        if (response.ok) {
          const data = await response.json()
          setLog123Config(data)

          // Definir URL do webhook baseado no ambiente
          if (!data.webhookUrl) {
            const webhookUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api/webhooks/123log`
            setLog123Config(prev => ({ ...prev, webhookUrl }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configuração 123Log:', error)
      }
    }
    fetch123LogConfig()
  }, [])

  // Carregar logs de webhooks da 123Log
  useEffect(() => {
    const fetch123LogLogs = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/webhooks/logs?source=123log&limit=20`)
        if (response.ok) {
          const data = await response.json()
          setLog123Logs(data)
        }
      } catch (error) {
        console.error('Erro ao carregar logs 123Log:', error)
      }
    }
    fetch123LogLogs()

    // Atualizar logs a cada 10 segundos
    const interval = setInterval(fetch123LogLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  // ============ WEBHOOK FUNCTIONS ============
  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [currentWebhook, setCurrentWebhook] = useState(null)

  const handleAddWebhook = () => {
    setCurrentWebhook({
      id: Date.now(),
      code: `cowxj${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      url: '',
      product: '',
      status: true,
      events: {
        aguardandoPagamento: true,
        pagamentoAprovado: false,
        cancelada: false,
        agendado: false,
        frustrada: false,
        codigoRastreio: false,
        pedidoEntregue: false,
        saiuParaEntrega: false,
        aguardandoRetirada: false
      }
    })
    setShowWebhookForm(true)
  }

  const handleEditWebhook = (webhook) => {
    setCurrentWebhook({ ...webhook })
    setShowWebhookForm(true)
  }

  const handleSaveWebhook = async () => {
    if (!currentWebhook.name || !currentWebhook.url) {
      showAlert('Validação', 'Preencha o nome e a URL do webhook', 'warning')
      return
    }

    try {
      // Verificar se é criação ou atualização
      const webhookExists = webhooks.find(w => w.id === currentWebhook.id)

      if (webhookExists) {
        // Atualizar webhook existente
        const response = await fetch(`${config.apiUrl}/api/webhooks/${currentWebhook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentWebhook.name,
            url: currentWebhook.url,
            product: currentWebhook.product,
            status: currentWebhook.status,
            events: currentWebhook.events
          })
        })

        const data = await response.json()

        if (data.success) {
          setWebhooks(webhooks.map(w => w.id === currentWebhook.id ? data.webhook : w))
          showAlert('Sucesso', 'Webhook atualizado com sucesso!', 'success')
        } else {
          showAlert('Erro', 'Erro ao atualizar webhook', 'error')
        }
      } else {
        // Criar novo webhook
        const response = await fetch(`${config.apiUrl}/api/webhooks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            name: currentWebhook.name,
            url: currentWebhook.url,
            product: currentWebhook.product,
            events: currentWebhook.events
          })
        })

        const data = await response.json()

        if (data.success) {
          setWebhooks([...webhooks, data.webhook])
          showAlert('Sucesso', 'Webhook criado com sucesso!', 'success')
        } else {
          showAlert('Erro', 'Erro ao criar webhook', 'error')
        }
      }

      setShowWebhookForm(false)
      setCurrentWebhook(null)
    } catch (error) {
      console.error('Erro ao salvar webhook:', error)
      showAlert('Erro de Conexão', 'Erro ao salvar webhook. Verifique a conexão com o servidor.', 'error')
    }
  }

  const handleDeleteWebhook = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este webhook?')) {
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/webhooks/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setWebhooks(webhooks.filter(w => w.id !== id))
        showAlert('Sucesso', 'Webhook excluído com sucesso!', 'success')
      } else {
        showAlert('Erro', 'Erro ao excluir webhook', 'error')
      }
    } catch (error) {
      console.error('Erro ao excluir webhook:', error)
      showAlert('Erro de Conexão', 'Erro ao excluir webhook. Verifique a conexão com o servidor.', 'error')
    }
  }

  const handleTestWebhook = async (id) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/webhooks/${id}/test`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        showAlert('Sucesso', 'Webhook de teste enviado com sucesso!\n\nVerifique os logs para mais detalhes.', 'success')
        console.log('Payload enviado:', data.payload)
      } else {
        showAlert('Erro', 'Erro ao enviar webhook de teste', 'error')
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error)
      showAlert('Erro de Conexão', 'Erro ao testar webhook. Verifique a conexão com o servidor.', 'error')
    }
  }

  const handleViewWebhookLogs = async (id) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/webhooks/${id}/logs?limit=10`)
      const logs = await response.json()

      if (logs.length === 0) {
        showAlert('Informação', 'Nenhum log encontrado para este webhook.', 'info')
        return
      }

      // Mostrar logs no console
      console.log('=== LOGS DO WEBHOOK ===')
      logs.forEach(log => {
        console.log(`\n[${log.dataHora}] ${log.evento}`)
        console.log(`Sucesso: ${log.sucesso ? 'Sim' : 'Não'}`)
        console.log(`Status: ${log.statusCode || 'N/A'}`)
        console.log(`Resposta: ${log.resposta || log.erro || 'N/A'}`)
        console.log(`Payload:`, log.payload)
      })

      showAlert('Logs Encontrados', `${logs.length} log(s) encontrado(s).\n\nVerifique o console do navegador (F12) para ver os detalhes.`, 'info')
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      showAlert('Erro', 'Erro ao buscar logs do webhook.', 'error')
    }
  }

  // ============ API FUNCTIONS ============
  const [showApiForm, setShowApiForm] = useState(false)
  const [currentApi, setCurrentApi] = useState(null)

  const handleAddApi = () => {
    setCurrentApi({
      id: Date.now(),
      name: '',
      publicKey: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
      secretKey: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      enabled: true
    })
    setShowApiForm(true)
  }

  const handleEditApi = (api) => {
    setCurrentApi({ ...api })
    setShowApiForm(true)
  }

  const handleSaveApi = () => {
    if (!currentApi.name) {
      showAlert('Validação', 'Preencha o nome da API', 'warning')
      return
    }

    if (apis.find(a => a.id === currentApi.id)) {
      setApis(apis.map(a => a.id === currentApi.id ? currentApi : a))
    } else {
      setApis([...apis, currentApi])
    }

    setShowApiForm(false)
    setCurrentApi(null)
  }

  const handleDeleteApi = (id) => {
    if (confirm('Tem certeza que deseja excluir esta API?')) {
      setApis(apis.filter(a => a.id !== id))
    }
  }

  // ============ PIXEL FUNCTIONS ============
  const [showPixelForm, setShowPixelForm] = useState(false)
  const [currentPixel, setCurrentPixel] = useState(null)

  const handleAddPixel = () => {
    setCurrentPixel({
      id: Date.now(),
      code: `pixvl${Math.random().toString(36).substring(2, 5)}`,
      cadastro: new Date().toLocaleDateString('pt-BR'),
      name: '',
      type: 'facebook',
      pixelId: '',
      domain: '',
      accessToken: '',
      enabled: true,
      executeOnBoleto: true,
      executeOnPix: true,
      whenExecute: 'checkout',
      valueType: 'commission',
      customValuePerPayment: 'Não',
      fixedValue: '0,00',
      checkouts: [],
      campanhas: []
    })
    setShowPixelForm(true)
  }

  const handleEditPixel = (pixel) => {
    setCurrentPixel({ ...pixel })
    setShowPixelForm(true)
  }

  const handleSavePixel = () => {
    if (!currentPixel.name || !currentPixel.pixelId) {
      showAlert('Validação', 'Preencha o nome e o ID do pixel', 'warning')
      return
    }

    if (pixels.find(p => p.id === currentPixel.id)) {
      setPixels(pixels.map(p => p.id === currentPixel.id ? currentPixel : p))
    } else {
      setPixels([...pixels, currentPixel])
    }

    setShowPixelForm(false)
    setCurrentPixel(null)
  }

  const handleDeletePixel = (id) => {
    if (confirm('Tem certeza que deseja excluir este pixel?')) {
      setPixels(pixels.filter(p => p.id !== id))
    }
  }

  // Salvar configuração Notazz
  const handleSaveNotazz = async () => {
    if (!notazzWebhookId.trim()) {
      showAlert('Validação', 'Por favor, preencha o ID do webhook Notazz', 'warning')
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/integrations/notazz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          webhookId: notazzWebhookId,
          enabled: notazzEnabled,
          autoSend: notazzEnabled // autoSend sempre igual a enabled
        })
      })

      const data = await response.json()

      if (data.success) {
        showAlert('Sucesso', 'Configuração Notazz salva com sucesso!', 'success')
      } else {
        showAlert('Erro', 'Erro ao salvar configuração Notazz', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar Notazz:', error)
      showAlert('Erro de Conexão', 'Erro ao salvar configuração. Verifique a conexão com o servidor.', 'error')
    }
  }

  // ============ CORREIOS FUNCTIONS ============
  const handleAddCorreiosContract = () => {
    setCorreiosForm({
      name: '',
      username: '',
      accessToken: '',
      contractNumber: '',
      isActive: true
    })
    setCurrentContract(null)
    setShowCorreiosModal(true)
  }

  const handleEditCorreiosContract = (contract) => {
    setCorreiosForm({
      name: contract.name,
      username: contract.username,
      accessToken: '', // Não carregar o token por segurança
      contractNumber: contract.contractNumber,
      isActive: contract.isActive
    })
    setCurrentContract(contract)
    setShowEditCorreiosModal(true)
  }

  const handleSaveCorreiosContract = async () => {
    // Validações
    if (!correiosForm.name.trim()) {
      showAlert('Validação', 'Por favor, preencha a finalidade do contrato', 'warning')
      return
    }
    if (!correiosForm.username.trim()) {
      showAlert('Validação', 'Por favor, preencha o nome de usuário', 'warning')
      return
    }
    if (!currentContract && !correiosForm.accessToken.trim()) {
      showAlert('Validação', 'Por favor, preencha a chave de acesso', 'warning')
      return
    }
    if (!correiosForm.contractNumber.trim()) {
      showAlert('Validação', 'Por favor, preencha o número do contrato', 'warning')
      return
    }

    try {
      const payload = {
        userId: user.id,
        name: correiosForm.name,
        username: correiosForm.username,
        contractNumber: correiosForm.contractNumber,
        isActive: correiosForm.isActive
      }

      // Só envia o token se foi preenchido
      if (correiosForm.accessToken.trim()) {
        payload.accessToken = correiosForm.accessToken
      }

      const url = currentContract
        ? `${config.apiUrl}/api/correios-contracts/${currentContract.id}`
        : `${config.apiUrl}/api/correios-contracts`

      const method = currentContract ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        showAlert('Sucesso', currentContract ? 'Contrato atualizado com sucesso!' : 'Contrato criado com sucesso!', 'success')
        setShowCorreiosModal(false)
        setShowEditCorreiosModal(false)

        // Recarregar lista
        const listResponse = await fetch(`${config.apiUrl}/api/correios-contracts?userId=${user.id}`)
        const contracts = await listResponse.json()
        setCorreiosContracts(contracts)
      } else {
        showAlert('Erro', 'Erro ao salvar contrato: ' + (data.error || 'Erro desconhecido'), 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar contrato:', error)
      showAlert('Erro de Conexão', 'Erro ao salvar contrato. Verifique a conexão com o servidor.', 'error')
    }
  }

  const handleDeleteCorreiosContract = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) {
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/correios-contracts/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        showAlert('Sucesso', 'Contrato deletado com sucesso!', 'success')
        setCorreiosContracts(correiosContracts.filter(c => c.id !== id))
      } else {
        showAlert('Erro', 'Erro ao deletar contrato', 'error')
      }
    } catch (error) {
      console.error('Erro ao deletar contrato:', error)
      showAlert('Erro de Conexão', 'Erro ao deletar contrato. Verifique a conexão com o servidor.', 'error')
    }
  }

  const handleTestCorreiosContract = (contract) => {
    setCurrentContract(contract)
    setTestTrackingCode('')
    setTestResult(null)
    setShowTestCorreiosModal(true)
  }

  const handleExecuteTest = async () => {
    if (!testTrackingCode.trim()) {
      showAlert('Validação', 'Por favor, digite um código de rastreio', 'warning')
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/correios-contracts/${currentContract.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode: testTrackingCode })
      })

      const data = await response.json()
      setTestResult(data)

      // Recarregar lista para atualizar status do último teste
      const listResponse = await fetch(`${config.apiUrl}/api/correios-contracts?userId=${user.id}`)
      const contracts = await listResponse.json()
      setCorreiosContracts(contracts)
    } catch (error) {
      console.error('Erro ao testar contrato:', error)
      setTestResult({
        success: false,
        message: 'Erro ao conectar com o servidor',
        error: error.message
      })
    }
  }

  const handleSave = () => {
    showAlert('Sucesso', 'Configurações salvas com sucesso!', 'success')
    console.log('Settings:', { webhooks, apis, pixels, settings })
  }

  return (
    <AdminLayout>
      <div className="p-6">

        {/* =============== WEBHOOK SECTION =============== */}
        {activeSection === 'webhook' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Webhooks</h2>
                <p className="text-sm text-gray-600">Configure URLs para receber notificações automáticas</p>
              </div>
              <button
                onClick={handleAddWebhook}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Criar Webhook
              </button>
            </div>

            {/* Tabela de Webhooks */}
            {webhooks.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Nenhum webhook cadastrado. Clique em "Criar Webhook" para adicionar.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Código
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Nome
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        URL de retorno
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Produto
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                        Eventos
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {webhooks.map((webhook) => {
                      const activeEvents = Object.entries(webhook.events).filter(([_, value]) => value)
                      const firstEvent = activeEvents[0]?.[0] || ''

                      const eventLabels = {
                        aguardandoPagamento: 'Aguardando pagamento',
                        pagamentoAprovado: 'Pagamento Aprovado',
                        cancelada: 'Cancelada',
                        agendado: 'Agendado',
                        frustrada: 'Frustrada',
                        codigoRastreio: 'Código de rastreio',
                        pedidoEntregue: 'Pedido entregue',
                        saiuParaEntrega: 'Saiu para entrega',
                        aguardandoRetirada: 'Aguardando retirada'
                      }

                      return (
                        <tr key={webhook.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="truncate max-w-[80px]" title={webhook.code}>
                              {webhook.code}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900">
                            <div className="truncate max-w-[120px]" title={webhook.name}>
                              {webhook.name}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600 font-mono">
                            <div className="truncate max-w-[200px]" title={webhook.url}>
                              {webhook.url}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="truncate max-w-[180px]" title={webhook.product || 'Todos os produtos'}>
                              {webhook.product || 'Todos'}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            {firstEvent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                {eventLabels[firstEvent]}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center">
                              <div className={`w-3 h-3 rounded-full ${webhook.status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleEditWebhook(webhook)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                                title="Editar"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleTestWebhook(webhook.id)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-cyan-500 hover:bg-cyan-600 text-white"
                                title="Testar Webhook"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleViewWebhookLogs(webhook.id)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-orange-500 hover:bg-orange-600 text-white"
                                title="Ver Logs"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white"
                                title="Excluir"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Webhook */}
            {showWebhookForm && currentWebhook && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                  <h3 className="text-xl font-bold mb-4">
                    {webhooks.find(w => w.id === currentWebhook.id) ? 'Editar' : 'Criar'} Webhook
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={currentWebhook.name}
                        onChange={(e) => setCurrentWebhook({ ...currentWebhook, name: e.target.value })}
                        placeholder="Ex: Webhook Principal"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={currentWebhook.url}
                        onChange={(e) => setCurrentWebhook({ ...currentWebhook, url: e.target.value })}
                        placeholder="https://seu-site.com/webhook"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                      <select
                        value={currentWebhook.product}
                        onChange={(e) => setCurrentWebhook({ ...currentWebhook, product: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Todos os produtos</option>
                        {products.map((product) => {
                          const productCode = product.code || product.productCode || `prod${product.id}`
                          const displayText = `${productCode} - ${product.name}`
                          return (
                            <option key={product.id} value={displayText}>
                              {displayText}
                            </option>
                          )
                        })}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Se nenhum produto for selecionado, o webhook será disparado para todos os produtos
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Eventos</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.aguardandoPagamento}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, aguardandoPagamento: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Aguardando pagamento</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.pagamentoAprovado}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, pagamentoAprovado: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Pagamento Aprovado</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.cancelada}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, cancelada: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Cancelada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.agendado}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, agendado: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Agendado</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.frustrada}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, frustrada: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Frustrada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.codigoRastreio}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, codigoRastreio: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Código de rastreio adicionado</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.pedidoEntregue}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, pedidoEntregue: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Pedido entregue</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.saiuParaEntrega}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, saiuParaEntrega: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Saiu para entrega</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentWebhook.events.aguardandoRetirada}
                            onChange={(e) => setCurrentWebhook({
                              ...currentWebhook,
                              events: { ...currentWebhook.events, aguardandoRetirada: e.target.checked }
                            })}
                            className="rounded text-emerald-600"
                          />
                          <span className="ml-2 text-sm">Aguardando retirada</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveWebhook}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => { setShowWebhookForm(false); setCurrentWebhook(null) }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============== API SECTION =============== */}
        {activeSection === 'api' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Chaves API</h2>
                <p className="text-sm text-gray-600">Gerencie as chaves de acesso à API</p>
              </div>
              <button
                onClick={handleAddApi}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Criar API
              </button>
            </div>

            {/* Lista de APIs */}
            {apis.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Nenhuma API cadastrada. Clique em "Criar API" para adicionar.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {apis.map((api) => (
                  <div key={api.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-gray-900">{api.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${api.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {api.enabled ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Chave Pública:</p>
                            <p className="text-sm font-mono text-gray-700">{api.publicKey}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Chave Secreta:</p>
                            <p className="text-sm font-mono text-gray-700">••••••••••••••••</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditApi(api)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteApi(api.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal API */}
            {showApiForm && currentApi && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                  <h3 className="text-xl font-bold mb-4">
                    {apis.find(a => a.id === currentApi.id) ? 'Editar' : 'Criar'} API
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={currentApi.name}
                        onChange={(e) => setCurrentApi({ ...currentApi, name: e.target.value })}
                        placeholder="Ex: API Produção"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chave Pública</label>
                      <input
                        type="text"
                        value={currentApi.publicKey}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chave Secreta</label>
                      <input
                        type="text"
                        value={currentApi.secretKey}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <p className="text-xs text-red-500 mt-1">⚠️ Guarde esta chave em segurança!</p>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentApi.enabled}
                          onChange={(e) => setCurrentApi({ ...currentApi, enabled: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span className="ml-2 text-sm font-medium">API Habilitada</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveApi}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => { setShowApiForm(false); setCurrentApi(null) }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============== PIXEL SECTION =============== */}
        {activeSection === 'pixel' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Pixels de Rastreamento</h2>
                <p className="text-sm text-gray-600">Configure pixels para rastrear conversões</p>
              </div>
              <button
                onClick={handleAddPixel}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Criar Pixel
              </button>
            </div>

            {/* Tabela de Pixels */}
            {pixels.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Nenhum pixel cadastrado. Clique em "Criar Pixel" para adicionar.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cadastro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plataforma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pixels.map((pixel) => {
                      const platformName = pixel.type === 'facebook' ? 'Facebook' :
                                          pixel.type === 'google' ? 'Google' :
                                          pixel.type === 'tiktok' ? 'TikTok' : pixel.type

                      return (
                        <tr key={pixel.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pixel.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pixel.cadastro}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pixel.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              pixel.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pixel.enabled ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-cyan-500 text-white">
                              {platformName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPixel(pixel)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePixel(pixel.id)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white"
                                title="Excluir"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded bg-orange-500 hover:bg-orange-600 text-white"
                                title="Copiar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Pixel */}
            {showPixelForm && currentPixel && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[calc(100vh-4rem)]" style={{overflowY: 'auto'}}>
                  <h3 className="text-2xl font-bold mb-6">
                    {pixels.find(p => p.id === currentPixel.id) ? 'Editar' : 'Criar'} Pixel
                  </h3>

                  <div className="space-y-6">
                    {/* Nome do Pixel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Pixel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentPixel.name}
                        onChange={(e) => setCurrentPixel({ ...currentPixel, name: e.target.value })}
                        placeholder="Ex: Pixel Facebook - Campanha Principal"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    {/* Status do Pixel */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status do Pixel
                        </label>
                        <p className="text-xs text-gray-600">
                          {currentPixel.enabled ? 'Pixel ativo e funcionando' : 'Pixel desativado'}
                        </p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={currentPixel.enabled}
                            onChange={(e) => setCurrentPixel({ ...currentPixel, enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                      </label>
                    </div>

                    {/* Executar pixel no boleto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Executar pixel no boleto?
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={currentPixel.executeOnBoleto}
                            onChange={(e) => setCurrentPixel({ ...currentPixel, executeOnBoleto: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                      </label>
                    </div>

                    {/* Executar pixel no pix */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Executar pixel no pix?
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={currentPixel.executeOnPix}
                            onChange={(e) => setCurrentPixel({ ...currentPixel, executeOnPix: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                      </label>
                    </div>

                    {/* Seção 3 - Configurações do Pixel */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">3. Configurações do Pixel</h4>

                      {/* Quando executar pixel */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Quando executar pixel?
                        </label>
                        <select
                          value={currentPixel.whenExecute}
                          onChange={(e) => setCurrentPixel({ ...currentPixel, whenExecute: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="checkout">Somente no checkout (InitiateCheckout)</option>
                          <option value="purchase">Somente na compra (Purchase)</option>
                          <option value="both">Checkout e compra</option>
                        </select>
                      </div>

                      {/* Valor */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Valor
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Personalizar valor por forma de pagamento</span>
                            <select
                              value={currentPixel.customValuePerPayment}
                              onChange={(e) => setCurrentPixel({ ...currentPixel, customValuePerPayment: e.target.value })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="Não">Não</option>
                              <option value="Sim">Sim</option>
                            </select>
                          </div>
                        </div>

                        {/* Opções de Valor */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Valor Total */}
                          <div
                            onClick={() => setCurrentPixel({ ...currentPixel, valueType: 'total' })}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                              currentPixel.valueType === 'total'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start mb-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                                currentPixel.valueType === 'total' ? 'border-indigo-500' : 'border-gray-300'
                              }`}>
                                {currentPixel.valueType === 'total' && (
                                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 flex items-center">
                                  Valor total
                                  <span className="ml-2 text-gray-400">$$$</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Valor total da venda com taxas e juros de parcelamento.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Minha Comissão */}
                          <div
                            onClick={() => setCurrentPixel({ ...currentPixel, valueType: 'commission' })}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                              currentPixel.valueType === 'commission'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start mb-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                                currentPixel.valueType === 'commission' ? 'border-indigo-500' : 'border-gray-300'
                              }`}>
                                {currentPixel.valueType === 'commission' && (
                                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 flex items-center">
                                  Minha comissão
                                  <span className="ml-2 text-gray-400">$$</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Somente valor que será depositado na sua conta como comissão.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Valor Fixo */}
                          <div
                            onClick={() => setCurrentPixel({ ...currentPixel, valueType: 'fixed' })}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                              currentPixel.valueType === 'fixed'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start mb-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                                currentPixel.valueType === 'fixed' ? 'border-indigo-500' : 'border-gray-300'
                              }`}>
                                {currentPixel.valueType === 'fixed' && (
                                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 flex items-center">
                                  Valor fixo
                                  <span className="ml-2 text-gray-400">$</span>
                                </div>
                                {currentPixel.valueType === 'fixed' && (
                                  <input
                                    type="text"
                                    value={currentPixel.fixedValue}
                                    onChange={(e) => setCurrentPixel({ ...currentPixel, fixedValue: e.target.value })}
                                    placeholder="R$ 0,00"
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Selecione uma plataforma */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Selecione uma plataforma e insira seu ID:
                        </label>
                        <div className="relative">
                          <select
                            value={currentPixel.type}
                            onChange={(e) => setCurrentPixel({ ...currentPixel, type: e.target.value })}
                            className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                          >
                            <option value="facebook">Facebook</option>
                            <option value="google">Google</option>
                            <option value="tiktok">TikTok</option>
                            <option value="other">Outro</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* ID do Pixel */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID do Pixel do Facebook <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentPixel.pixelId}
                          onChange={(e) => setCurrentPixel({ ...currentPixel, pixelId: e.target.value })}
                          placeholder="XXXXXXXXXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      {/* Domínio */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Domínio
                          </label>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={currentPixel.domain}
                          onChange={(e) => setCurrentPixel({ ...currentPixel, domain: e.target.value })}
                          placeholder="seudominio.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Ao inserir o domínio, os eventos serão enviados <span className="font-semibold">somente via API de Conversões</span> para o Facebook e não será possível visualiza-los através do Pixel Helper.
                        </p>
                      </div>

                      {/* Token de Acesso */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Token de Acesso
                          </label>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <textarea
                          value={currentPixel.accessToken}
                          onChange={(e) => setCurrentPixel({ ...currentPixel, accessToken: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                          placeholder="Cole seu token de acesso aqui..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-6 border-t">
                    <button
                      onClick={handleSavePixel}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold"
                    >
                      Salvar Pixel
                    </button>
                    <button
                      onClick={() => { setShowPixelForm(false); setCurrentPixel(null) }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============== INTEGRATION SECTION =============== */}
        {activeSection === 'integration' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Integrações</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveIntegrationTab('general')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                  activeIntegrationTab === 'general'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => setActiveIntegrationTab('notazz')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                  activeIntegrationTab === 'notazz'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Notazz
              </button>
              <button
                onClick={() => setActiveIntegrationTab('correios')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                  activeIntegrationTab === 'correios'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📦 Correios
              </button>
              <button
                onClick={() => setActiveIntegrationTab('123log')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                  activeIntegrationTab === '123log'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                🚚 123Log
              </button>
            </div>

            {/* Aba Geral */}
            {activeIntegrationTab === 'general' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Integrações Gerais</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure integrações com serviços externos
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Business API
                    </label>
                    <input
                      type="tel"
                      value={settings.integration.whatsapp}
                      onChange={(e) => setSettings({
                        ...settings,
                        integration: { ...settings.integration, whatsapp: e.target.value }
                      })}
                      placeholder="+55 11 99999-9999"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      value={settings.integration.telegram}
                      onChange={(e) => setSettings({
                        ...settings,
                        integration: { ...settings.integration, telegram: e.target.value }
                      })}
                      placeholder="123456789:ABCdefGhIjKlmNoPQRsTUVwxyZ"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de Notificações
                    </label>
                    <input
                      type="email"
                      value={settings.integration.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        integration: { ...settings.integration, email: e.target.value }
                      })}
                      placeholder="contato@afterpay.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.integration.enableNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          integration: { ...settings.integration, enableNotifications: e.target.checked }
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Notificações Habilitadas</span>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold"
                    >
                      Salvar Configurações
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Notazz */}
            {activeIntegrationTab === 'notazz' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Integração Notazz</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure a integração com a plataforma Notazz para geração automática de notas fiscais e códigos de rastreio
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Webhook Notazz *
                    </label>
                    <input
                      type="text"
                      value={notazzWebhookId}
                      onChange={(e) => setNotazzWebhookId(e.target.value)}
                      placeholder="Cole aqui o ID do seu webhook Notazz"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O ID será usado no endpoint: <code className="bg-gray-100 px-1 rounded">https://app.notazz.com/webhook/{'{'}id{'}'}</code>
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      📌 Obtenha o ID no painel Notazz em Configurações → Webhooks
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Integração Ativa</label>
                        <p className="text-xs text-gray-500 mt-1">
                          Quando ativada, pedidos pagos e agendados serão enviados automaticamente ao Notazz
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotazzEnabled(!notazzEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          notazzEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notazzEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Como funciona?</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• Pedidos pagos são enviados automaticamente ao Notazz</li>
                          <li>• Notazz gera a nota fiscal e o código de rastreio</li>
                          <li>• O código de rastreio é adicionado automaticamente ao pedido</li>
                          <li>• Cliente recebe notificação com código de rastreio</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveNotazz}
                      disabled={!notazzWebhookId.trim()}
                      className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Salvar Configuração Notazz
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Correios */}
            {activeIntegrationTab === 'correios' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Integração Correios</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Configure os dados do seu contrato dos Correios para habilitar o rastreamento automático de encomendas.
                      </p>
                    </div>
                    <button
                      onClick={handleAddCorreiosContract}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar Contrato
                    </button>
                  </div>
                </div>

                {/* Lista de Contratos */}
                {correiosContracts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato cadastrado</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Clique em "Adicionar Contrato" para configurar sua primeira integração com os Correios.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {correiosContracts.map(contract => (
                      <div key={contract.id} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${contract.isActive ? 'border-emerald-500' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{contract.name}</h4>
                              {contract.isActive ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">✅ Ativo</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">⏸️ Inativo</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-gray-500">👤 Nome de usuário</label>
                            <p className="text-sm font-medium text-gray-900">{contract.username}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">🔢 Número do contrato</label>
                            <p className="text-sm font-medium text-gray-900">{contract.contractNumber}</p>
                          </div>
                        </div>

                        {contract.lastTestedAt && (
                          <div className="bg-gray-50 p-3 rounded mb-4">
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="text-gray-600">🕐 Último teste: </span>
                                <span className="text-gray-900">{new Date(contract.lastTestedAt).toLocaleString('pt-BR')}</span>
                              </div>
                              <div>
                                {contract.lastTestStatus === 'success' ? (
                                  <span className="text-green-600 font-medium">✅ {contract.lastTestMessage}</span>
                                ) : (
                                  <span className="text-red-600 font-medium">❌ Falhou</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCorreiosContract(contract)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleTestCorreiosContract(contract)}
                            className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                          >
                            🔄 Testar
                          </button>
                          <button
                            onClick={() => handleDeleteCorreiosContract(contract.id)}
                            className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                          >
                            🗑️ Deletar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba 123Log */}
            {activeIntegrationTab === '123log' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Integração 123Log</h3>
                      <p className="text-sm text-gray-600">
                        Receba atualizações automáticas de rastreamento da 123Log via webhook e notifique seus clientes automaticamente
                      </p>
                    </div>
                  </div>

                  {/* URL do Webhook */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📋 URL do Webhook (Configure na 123Log)
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Copie esta URL e cole no campo "URL" do Postback na plataforma 123Log
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={log123Config.webhookUrl || `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3001' : ''}/api/webhooks/123log`}
                        readOnly
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-700"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(log123Config.webhookUrl || `${window.location.protocol}//${window.location.hostname}:3001/api/webhooks/123log`)
                          showAlert('Sucesso', 'URL copiada para a área de transferência!', 'success')
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        📋 Copiar
                      </button>
                    </div>
                  </div>

                  {/* Chave Única */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔑 Chave Única (da 123Log)
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Cole aqui a "Chave Única" gerada pela 123Log ao criar o Postback
                    </p>
                    <input
                      type="text"
                      value={log123Config.webhookKey}
                      onChange={(e) => setLog123Config({ ...log123Config, webhookKey: e.target.value })}
                      placeholder="bdba0677848911..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ Esta chave é enviada pela 123Log em cada requisição e usada para validar a autenticidade
                    </p>
                  </div>

                  {/* Configurações de Notificação */}
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🔔 Eventos para Notificar Cliente (via BotConversa)
                    </label>
                    <p className="text-xs text-gray-600 mb-4">
                      Selecione quais eventos devem disparar notificação automática para o cliente
                    </p>

                    <div className="space-y-2">
                      {[
                        { value: 'codigo_adicionado', label: 'Código de rastreio adicionado' },
                        { value: 'objeto_postado', label: 'Objeto postado' },
                        { value: 'em_transito', label: 'Em trânsito' },
                        { value: 'saiu_para_entrega', label: 'Saiu para entrega' },
                        { value: 'entregue', label: 'Objeto entregue' },
                        { value: 'tentativa_entrega', label: 'Tentativa de entrega (opcional)' },
                        { value: 'aguardando_retirada', label: 'Aguardando retirada (opcional)' }
                      ].map((event) => (
                        <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={log123Config.notificationSettings?.eventsToNotify?.includes(event.value)}
                            onChange={(e) => {
                              const currentEvents = log123Config.notificationSettings?.eventsToNotify || []
                              const newEvents = e.target.checked
                                ? [...currentEvents, event.value]
                                : currentEvents.filter(ev => ev !== event.value)

                              setLog123Config({
                                ...log123Config,
                                notificationSettings: {
                                  ...log123Config.notificationSettings,
                                  eventsToNotify: newEvents
                                }
                              })
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{event.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`${config.apiUrl}/api/integrations/123log`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(log123Config)
                          })

                          if (response.ok) {
                            showAlert('Sucesso', 'Configuração salva com sucesso!', 'success')
                          } else {
                            showAlert('Erro', 'Erro ao salvar configuração', 'error')
                          }
                        } catch (error) {
                          console.error('Erro:', error)
                          showAlert('Erro de Conexão', 'Erro ao salvar configuração', 'error')
                        }
                      }}
                      disabled={!log123Config.webhookKey}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                    >
                      💾 Salvar Configuração
                    </button>
                    <button
                      onClick={() => setShowLog123TestModal(true)}
                      disabled={!log123Config.webhookKey}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                    >
                      🧪 Testar Webhook
                    </button>
                  </div>
                </div>

                {/* Histórico de Webhooks */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📊 Histórico de Webhooks Recebidos
                  </h3>

                  {log123Logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">Nenhum webhook recebido ainda</p>
                      <p className="text-sm mt-1">Configure a integração na 123Log para começar a receber atualizações</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {log123Logs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-4 rounded-lg border-2 ${
                            log.processed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-lg ${log.processed ? '✅' : '❌'}`}>
                                  {log.processed ? '✅' : '❌'}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {log.event || 'Evento desconhecido'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  #{log.orderId}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>
                                  📅 {new Date(log.receivedAt).toLocaleString('pt-BR')}
                                </p>
                                {log.error && (
                                  <p className="text-red-600 mt-1">
                                    ⚠️ Erro: {log.error}
                                  </p>
                                )}
                                {log.notificationSent && (
                                  <p className="text-green-600 mt-1">
                                    📲 Cliente notificado via BotConversa
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      {/* Modal de Teste 123Log */}
      {showLog123TestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">🧪 Testar Webhook 123Log</h3>

            <p className="text-sm text-gray-600 mb-6">
              Isso enviará um payload de teste para o webhook. Verifique se aparece no histórico abaixo.
            </p>

            {log123TestResult && (
              <div className={`mb-4 p-4 rounded-lg ${
                log123TestResult.success
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <p className={`font-semibold ${
                  log123TestResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {log123TestResult.success ? '✅ Teste realizado com sucesso!' : '❌ Erro no teste'}
                </p>
                {log123TestResult.message && (
                  <p className="text-sm mt-1 text-gray-700">{log123TestResult.message}</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${config.apiUrl}/api/integrations/123log/test`, {
                      method: 'POST'
                    })
                    const result = await response.json()
                    setLog123TestResult(result)

                    // Recarregar logs após 1 segundo
                    setTimeout(() => {
                      fetch(`${config.apiUrl}/api/webhooks/logs?source=123log&limit=20`)
                        .then(res => res.json())
                        .then(data => setLog123Logs(data))
                    }, 1000)
                  } catch (error) {
                    setLog123TestResult({
                      success: false,
                      message: error.message
                    })
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Enviar Teste
              </button>
              <button
                onClick={() => {
                  setShowLog123TestModal(false)
                  setLog123TestResult(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Modal Adicionar/Editar Contrato */}
      {(showCorreiosModal || showEditCorreiosModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {showEditCorreiosModal ? '✏️ Editar Contrato' : '➕ Adicione a baixo os dados do seu contrato'}
              </h2>
              <button
                onClick={() => {
                  setShowCorreiosModal(false)
                  setShowEditCorreiosModal(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">* Finalidade:</label>
                <input
                  type="text"
                  value={correiosForm.name}
                  onChange={(e) => setCorreiosForm({...correiosForm, name: e.target.value})}
                  placeholder="RASTREAMENTO DE VENDAS AFTER PAY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Nome para identificação interna - não é enviado aos Correios</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">* Nome de usuário:</label>
                <input
                  type="text"
                  value={correiosForm.username}
                  onChange={(e) => setCorreiosForm({...correiosForm, username: e.target.value})}
                  placeholder="Nome de usuário no sistema dos correios"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Fornecido pelos Correios junto com o contrato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">* Chave de acesso:</label>
                <input
                  type="password"
                  value={correiosForm.accessToken}
                  onChange={(e) => setCorreiosForm({...correiosForm, accessToken: e.target.value})}
                  placeholder="Token de validação. Exemplo: a1b2c3d4e5f6g7h8i9j1k1l..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {showEditCorreiosModal
                    ? '💡 Deixe em branco para manter a chave atual'
                    : 'Senha/Token fornecido pelos Correios para acessar a API'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">* Número do contrato:</label>
                <input
                  type="text"
                  value={correiosForm.contractNumber}
                  onChange={(e) => setCorreiosForm({...correiosForm, contractNumber: e.target.value})}
                  placeholder="Número de contrato. Ex: 9912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Número do contrato firmado com os Correios</p>
              </div>

              <div className="pt-4 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={correiosForm.isActive}
                    onChange={(e) => setCorreiosForm({...correiosForm, isActive: e.target.checked})}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Contrato ativo</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowCorreiosModal(false)
                    setShowEditCorreiosModal(false)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCorreiosContract}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  💾 {showEditCorreiosModal ? 'Salvar Alterações' : 'Salvar Contrato'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Testar Contrato */}
      {showTestCorreiosModal && currentContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">🔄 Testar Contrato dos Correios</h2>
              <button
                onClick={() => {
                  setShowTestCorreiosModal(false)
                  setTestResult(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm"><span className="font-medium">📦 Contrato:</span> {currentContract.name}</p>
                <p className="text-sm"><span className="font-medium">👤 Usuário:</span> {currentContract.username}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Digite um código de rastreio para testar:</label>
                <input
                  type="text"
                  value={testTrackingCode}
                  onChange={(e) => setTestTrackingCode(e.target.value.toUpperCase())}
                  placeholder="AD161110295BBR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">💡 Use um código de rastreio real enviado pelo seu contrato</p>
              </div>

              <button
                onClick={handleExecuteTest}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                🔄 Executar Teste
              </button>

              {testResult && (
                <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className={`font-bold mb-2 ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {testResult.success ? '✅ TESTE BEM-SUCEDIDO!' : '❌ TESTE FALHOU'}
                  </h4>

                  {testResult.success ? (
                    <div>
                      <p className="text-sm text-green-800 mb-3">📊 Eventos encontrados: {testResult.eventsCount}</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {testResult.eventos.map((evt, i) => (
                          <div key={i} className="bg-white p-3 rounded border-l-2 border-green-500">
                            <p className="text-sm font-medium text-gray-900">{evt.status}</p>
                            <p className="text-xs text-gray-600">{evt.data} • {evt.local}</p>
                            {evt.subStatus && evt.subStatus.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">{evt.subStatus[0]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-red-800 mb-2">{testResult.message}</p>
                      {testResult.error && (
                        <p className="text-sm text-red-700 mb-2">Erro: {testResult.error}</p>
                      )}
                      {testResult.suggestions && (
                        <div className="mt-3">
                          <p className="text-xs text-red-800 font-medium mb-1">Possíveis causas:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {testResult.suggestions.map((suggestion, i) => (
                              <li key={i}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setShowTestCorreiosModal(false)
                  setTestResult(null)
                }}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
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
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
    </AdminLayout>
  )
}
