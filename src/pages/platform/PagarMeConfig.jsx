import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformLayout from '../../components/PlatformLayout'
import AlertModal from '../../components/AlertModal'

export default function PagarMeConfig() {
  const navigate = useNavigate()
  const [config, setConfig] = useState({
    publicKey: '',
    privateKey: '',
    webhookUrl: '',
    splitReceiverId: '',
    splitRate: '3.67',
    splitAnticipationRate: ''
  })
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [credentialsLocked, setCredentialsLocked] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [splitLocked, setSplitLocked] = useState(false)
  const [showSplitConfirmDialog, setShowSplitConfirmDialog] = useState(false)

  // Estado para AlertModal
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  })

  // Módulos habilitados (mock - virá do backend)
  const enabledModules = [
    { name: 'Conta Split', enabled: true, icon: '💰' },
    { name: 'Pix', enabled: true, icon: '📱' },
    { name: 'Boleto', enabled: true, icon: '🧾' },
    { name: 'Cartão (com recorrência)', enabled: true, icon: '💳' }
  ]

  useEffect(() => {
    // Buscar configuração existente (se houver)
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'default-user'
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/integrations/pagarme?userId=${userId}`)
      const data = await response.json()

      setConfig({
        publicKey: data.publicKey || '',
        privateKey: data.privateKey || '',
        webhookUrl: data.webhookUrl || `https://app.pag2pay.com/api/v1/gateway/webhook/pagar_me/${userId}`,
        splitReceiverId: data.splitReceiverId || '',
        splitRate: data.splitRate || '3.67',
        splitAnticipationRate: data.splitAnticipationRate || ''
      })

      setCredentialsLocked(data.credentialsLocked || false)
      setSplitLocked(data.splitLocked || false)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSavedMessage('')

    try {
      // A FAZER: Salvar no backend
      // await fetch('https://pag2pay-backend01-production.up.railway.app/api/integrations/pagarme', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // })

      setSavedMessage('Configuração salva com sucesso!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSavedMessage('Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const maskKey = (key) => {
    if (!key || key.length < 10) return key
    const visible = key.substring(0, 10)
    const masked = '*'.repeat(key.length - 10)
    return visible + masked
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setAlertModal({
      isOpen: true,
      title: 'Sucesso',
      message: 'Copiado para área de transferência!',
      type: 'success',
      onConfirm: null
    })
  }

  const handleSaveCredentials = () => {
    if (!config.publicKey || !config.privateKey) {
      setAlertModal({
        isOpen: true,
        title: 'Atenção',
        message: 'Por favor, preencha ambas as chaves antes de salvar.',
        type: 'warning',
        onConfirm: null
      })
      return
    }
    setShowConfirmDialog(true)
  }

  const confirmSaveCredentials = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'default-user'

      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/integrations/pagarme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          publicKey: config.publicKey,
          privateKey: config.privateKey,
          webhookUrl: config.webhookUrl,
          splitReceiverId: config.splitReceiverId,
          splitRate: config.splitRate,
          splitAnticipationRate: config.splitAnticipationRate,
          credentialsLocked: true,
          splitLocked: splitLocked,
          enabled: true
        })
      })

      const data = await response.json()

      if (data.success) {
        setCredentialsLocked(true)
        setShowConfirmDialog(false)
        setAlertModal({
          isOpen: true,
          title: 'Sucesso',
          message: 'Credenciais salvas com sucesso! As chaves agora estão protegidas.',
          type: 'success',
          onConfirm: null
        })
      } else {
        throw new Error('Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error)
      setAlertModal({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao salvar credenciais. Tente novamente.',
        type: 'error',
        onConfirm: null
      })
    }
  }

  const handleDeleteCredentials = () => {
    setAlertModal({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir as credenciais? Você precisará configurá-las novamente.',
      type: 'warning',
      onConfirm: () => {
        setConfig({ ...config, publicKey: '', privateKey: '' })
        setCredentialsLocked(false)
        setAlertModal({
          isOpen: true,
          title: 'Sucesso',
          message: 'Credenciais excluídas com sucesso!',
          type: 'success',
          onConfirm: null
        })
      }
    })
  }

  const handleSaveSplit = () => {
    if (!config.splitReceiverId) {
      setAlertModal({
        isOpen: true,
        title: 'Atenção',
        message: 'Por favor, preencha o ID do Recebedor antes de salvar.',
        type: 'warning',
        onConfirm: null
      })
      return
    }
    setShowSplitConfirmDialog(true)
  }

  const confirmSaveSplit = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'default-user'

      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/integrations/pagarme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          publicKey: config.publicKey,
          privateKey: config.privateKey,
          webhookUrl: config.webhookUrl,
          splitReceiverId: config.splitReceiverId,
          splitRate: config.splitRate,
          splitAnticipationRate: config.splitAnticipationRate,
          credentialsLocked: credentialsLocked,
          splitLocked: true,
          enabled: true
        })
      })

      const data = await response.json()

      if (data.success) {
        setSplitLocked(true)
        setShowSplitConfirmDialog(false)
        setAlertModal({
          isOpen: true,
          title: 'Sucesso',
          message: 'Configurações de Split salvas com sucesso!',
          type: 'success',
          onConfirm: null
        })
      } else {
        throw new Error('Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Erro ao salvar split:', error)
      setAlertModal({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao salvar configurações de Split. Tente novamente.',
        type: 'error',
        onConfirm: null
      })
    }
  }

  const handleDeleteSplit = () => {
    setAlertModal({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir as configurações de Split? Você precisará configurá-las novamente.',
      type: 'warning',
      onConfirm: () => {
        setConfig({ ...config, splitReceiverId: '', splitRate: '3.67', splitAnticipationRate: '' })
        setSplitLocked(false)
        setAlertModal({
          isOpen: true,
          title: 'Sucesso',
          message: 'Configurações de Split excluídas com sucesso!',
          type: 'success',
          onConfirm: null
        })
      }
    })
  }

  return (
    <PlatformLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/platform/financial/acquirers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Logo Pagar.me */}
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pagar.me</h2>
              <p className="text-sm text-slate-600">Integrado desde 30/06/2024</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/platform/financial/acquirers')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
          >
            Voltar
          </button>
        </div>

        {/* Módulos Habilitados */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Módulos habilitados</h3>
          <div className="flex flex-wrap gap-2">
            {enabledModules.map((module, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                  module.enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${module.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {module.name}
              </div>
            ))}
            <button className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-full border border-emerald-300 transition">
              Ver mais
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Está com dúvidas para conectar?</span>
            </p>
            <button className="mt-2 text-sm font-medium text-blue-600 hover:underline">
              Ver passo a passo
            </button>
          </div>
        </div>

        {/* Credenciais */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Credenciais</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave pública *
              </label>
              <input
                type="text"
                value={credentialsLocked && config.publicKey ? maskKey(config.publicKey) : config.publicKey}
                onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                placeholder="pk_test_abc123def456..."
                disabled={credentialsLocked}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  credentialsLocked ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                }`}
              />
              {!credentialsLocked && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Cole aqui a chave COMPLETA. Ela será mascarada apenas após salvar.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave Privada *
              </label>
              <input
                type="text"
                value={credentialsLocked && config.privateKey ? '******************' + config.privateKey.slice(-9) : config.privateKey}
                onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                placeholder="sk_test_abc123def456ghi789..."
                disabled={credentialsLocked}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  credentialsLocked ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                }`}
              />
              {!credentialsLocked && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Cole aqui a chave COMPLETA (sem asteriscos). Ela será mascarada apenas após salvar.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {!credentialsLocked ? (
                <button
                  onClick={handleSaveCredentials}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition shadow-sm"
                >
                  Salvar Credenciais
                </button>
              ) : (
                <button
                  onClick={handleDeleteCredentials}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm"
                >
                  Excluir Credenciais
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Webhook */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Webhook</h3>

          <p className="text-sm text-gray-700 mb-4">
            Copie o link abaixo e cole no painel de configurações da Pagar.me
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Url de webhook *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.webhookUrl || 'https://app.pag2pay.com/api/v1/gateway/webhook/pagar_me/********************'}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <button
                onClick={() => copyToClipboard(config.webhookUrl || 'https://app.pag2pay.com/api/v1/gateway/webhook/pagar_me/********************')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Conta Split */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Conta split</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Id do Recebedor *
              </label>
              <input
                type="text"
                value={splitLocked && config.splitReceiverId ? 're_*****************' + config.splitReceiverId.slice(-8) : config.splitReceiverId}
                onChange={(e) => setConfig({ ...config, splitReceiverId: e.target.value })}
                placeholder="re_cmke8l***********tw30gztxw"
                disabled={splitLocked}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  splitLocked ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                }`}
              />
              <p className="text-xs text-blue-600 mt-1">
                💡 O ID do recebedor é do recebedor master da Pagar.me
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de saque *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">R$</span>
                <input
                  type="text"
                  value={config.splitRate}
                  onChange={(e) => setConfig({ ...config, splitRate: e.target.value })}
                  disabled={splitLocked}
                  className={`w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    splitLocked ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Padrão: R$ 3,67
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de antecipação da PagarMe (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.splitAnticipationRate}
                  onChange={(e) => setConfig({ ...config, splitAnticipationRate: e.target.value })}
                  placeholder=""
                  disabled={splitLocked}
                  className={`w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    splitLocked ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                  }`}
                />
                <span className="text-gray-700 font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Taxa mensal da condição original com a PagarMe (ex.: 1,75). Use o mesmo valor da condição padrão para compensar a dedução automática no split.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              {!splitLocked ? (
                <button
                  onClick={handleSaveSplit}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition shadow-sm"
                >
                  Salvar Configurações
                </button>
              ) : (
                <button
                  onClick={handleDeleteSplit}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm"
                >
                  Excluir Configurações
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem de salvamento */}
        {savedMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            savedMessage.includes('sucesso')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {savedMessage}
          </div>
        )}

        {/* Modal de Confirmação - Credenciais */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Confirmar Salvamento das Credenciais
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  As credenciais da Pagar.me são extremamente restritas e serão bloqueadas após salvar. Você terá que excluí-las para alterá-las novamente.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <span className="font-semibold">Importante:</span> Certifique-se de que as chaves estão corretas antes de salvar.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSaveCredentials}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação - Split */}
        {showSplitConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Confirmar Salvamento das Configurações de Split
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  As configurações de Split serão bloqueadas após salvar. Você terá que excluí-las para alterá-las novamente.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <span className="font-semibold">Importante:</span> Certifique-se de que o ID do recebedor master e as taxas estão corretos antes de salvar.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSplitConfirmDialog(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSaveSplit}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AlertModal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => {
            if (alertModal.onConfirm) {
              alertModal.onConfirm()
            }
            setAlertModal({ ...alertModal, isOpen: false, onConfirm: null })
          }}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          buttonText={alertModal.onConfirm ? 'Confirmar' : 'OK'}
        />
      </div>
    </PlatformLayout>
  )
}
