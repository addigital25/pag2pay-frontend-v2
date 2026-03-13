import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'

export default function PlatformSettings() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [activeTab, setActiveTab] = useState('empresa')
  const [favicon, setFavicon] = useState(null)
  const [logo, setLogo] = useState(null)
  const [achievementLogo, setAchievementLogo] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [achievementLogoPreview, setAchievementLogoPreview] = useState(null)
  const [demoModeUsers, setDemoModeUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [searchEmail, setSearchEmail] = useState('')

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('platformToken')}`
          }
        })

        if (response.ok) {
          const settings = await response.json()

          // Carregar imagens salvas
          if (settings.images?.favicon) {
            setFaviconPreview(`https://pag2pay-backend01-production.up.railway.app${settings.images.favicon}`)
          }

          if (settings.images?.logo) {
            setLogoPreview(`https://pag2pay-backend01-production.up.railway.app${settings.images.logo}`)
          }

          if (settings.images?.achievementLogo) {
            setAchievementLogoPreview(`https://pag2pay-backend01-production.up.railway.app${settings.images.achievementLogo}`)
          }

          // Carregar textos salvos
          if (settings.texts) {
            setSiteTexts(settings.texts)
          }

          // Carregar configurações extras
          if (settings.extras) {
            setExtrasConfig(settings.extras)
            // Carregar usuários em modo demo
            if (settings.extras.demoModeUsers) {
              setDemoModeUsers(settings.extras.demoModeUsers)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }

    const loadUsers = async () => {
      try {
        const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/users')
        if (response.ok) {
          const data = await response.json()
          setAllUsers(data.users || [])
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      }
    }

    loadSettings()
    loadUsers()
  }, [])

  // Estados para textos SEO
  const [siteTexts, setSiteTexts] = useState({
    siteTitle: 'Pag2Pay',
    siteSubtitle: 'O melhor gateway de pagamentos',
    siteDescription: 'O melhor gateway de pagamentos',
    loginWelcomeMessage: '',
    registerWelcomeMessage: ''
  })

  // Estados para configurações extras
  const [extrasConfig, setExtrasConfig] = useState({
    // Configurações Gerais
    demoMode: false,
    blockNewRegistrations: false,
    autoCreateSplitAccount: false,

    // Produtos e Vendas
    forceProductSalesPage: false,
    forceWhatsappSupport: false,
    allowPhysicalProducts: true,
    allowWeeklySignature: true,
    allowApiCheckout: false,
    allowProductExport: false,
    autoApproveProducts: false,
    internationalSalesStripe: false,
    allowProductClone: false,

    // Configurações do Checkout
    hideAccessProductLink: false,
    removeDocumentFieldCheckout: false,
    hideCompanyNameCheckout: false,
    hideProducerNameCheckout: false,
    hideFooterInfoCheckout: false,
    hideCompanyFooterCheckout: false,
    hideCompanyLogoCheckout: false,
    showProducerPersonalEmail: false,

    // Ocultar Informações
    hideRetentionPercentage: false,
    hideRetentionDays: false,
    hideRetentionFundsReport: false,
    hideInstallmentTax: false,
    hideRefundChargeback: false,
    hideProducerColorSettings: false,
    hideProducerEmail: false,

    // Configurações Avançadas
    maintenanceMode: false
  })

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: '🏢' },
    { id: 'imagens', label: 'Imagens', icon: '🖼️' },
    { id: 'textos', label: 'Textos', icon: '📝' },
    { id: 'extras', label: 'Extras', icon: '⚡' },
    { id: 'financeiro', label: 'Financeiro', icon: '💰' }
  ]

  const handleFaviconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFavicon(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAchievementLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAchievementLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAchievementLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFavicon = () => {
    setFavicon(null)
    setFaviconPreview(null)
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
  }

  const removeAchievementLogo = () => {
    setAchievementLogo(null)
    setAchievementLogoPreview(null)
  }

  const handleSaveImages = async () => {
    try {
      const formData = new FormData()

      if (favicon) {
        formData.append('favicon', favicon)
      }

      if (logo) {
        formData.append('logo', logo)
      }

      if (achievementLogo) {
        formData.append('achievementLogo', achievementLogo)
      }

      // Enviar para a API
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings/images', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('platformToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()

        // Atualizar o favicon no documento
        if (data.faviconUrl) {
          const faviconLink = document.querySelector("link[rel~='icon']") || document.createElement('link')
          faviconLink.type = 'image/x-icon'
          faviconLink.rel = 'icon'
          faviconLink.href = data.faviconUrl
          document.getElementsByTagName('head')[0].appendChild(faviconLink)
        }

        // Atualizar o título da página se houver
        if (data.siteTitle) {
          document.title = data.siteTitle
        }

        showAlert({
          title: 'Imagens Salvas!',
          message: 'As imagens foram salvas com sucesso e aplicadas em todo o sistema (ambos os painéis).',
          type: 'success'
        })

        // Recarregar a página para aplicar as mudanças em todos os componentes
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error('Erro ao salvar imagens')
      }
    } catch (error) {
      console.error('Erro ao salvar imagens:', error)
      showAlert({
        title: 'Erro ao Salvar Imagens',
        message: 'Não foi possível salvar as imagens. Por favor, tente novamente.',
        type: 'error'
      })
    }
  }

  const handleSaveTexts = async () => {
    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings/texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('platformToken')}`
        },
        body: JSON.stringify(siteTexts)
      })

      if (response.ok) {
        showAlert({
          title: 'Textos Salvos!',
          message: 'Os textos foram salvos com sucesso e serão aplicados em todo o sistema.',
          type: 'success'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error('Erro ao salvar textos')
      }
    } catch (error) {
      console.error('Erro ao salvar textos:', error)
      showAlert({
        title: 'Erro ao Salvar Textos',
        message: 'Não foi possível salvar os textos. Por favor, tente novamente.',
        type: 'error'
      })
    }
  }

  const handleSaveExtras = async () => {
    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings/extras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('platformToken')}`
        },
        body: JSON.stringify(extrasConfig)
      })

      if (response.ok) {
        showAlert({
          title: 'Configurações Salvas!',
          message: 'As configurações foram salvas com sucesso.',
          type: 'success'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      showAlert({
        title: 'Erro ao Salvar Configurações',
        message: 'Não foi possível salvar as configurações. Por favor, tente novamente.',
        type: 'error'
      })
    }
  }

  const toggleConfig = (key) => {
    setExtrasConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const addUserToDemo = (userEmail) => {
    if (!demoModeUsers.includes(userEmail)) {
      setDemoModeUsers([...demoModeUsers, userEmail])
    }
    setSearchEmail('')
  }

  const removeUserFromDemo = (userEmail) => {
    setDemoModeUsers(demoModeUsers.filter(email => email !== userEmail))
  }

  const handleSaveExtrasWithDemo = async () => {
    const configToSave = {
      ...extrasConfig,
      demoModeUsers: demoModeUsers
    }

    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings/extras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('platformToken')}`
        },
        body: JSON.stringify(configToSave)
      })

      if (response.ok) {
        showAlert({
          title: 'Configurações Salvas!',
          message: 'As configurações foram salvas com sucesso.',
          type: 'success'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      showAlert({
        title: 'Erro ao Salvar Configurações',
        message: 'Não foi possível salvar as configurações. Por favor, tente novamente.',
        type: 'error'
      })
    }
  }

  // Componente de Toggle Switch
  const ToggleSwitch = ({ checked, onChange, label, description, highlighted = false }) => (
    <div className={`p-4 rounded-lg transition ${highlighted ? 'border-2 border-emerald-500 bg-emerald-50' : 'bg-slate-50'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h4 className="font-medium text-slate-800 mb-1">{label}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <button
          onClick={onChange}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
            checked ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
          <p className="text-sm text-slate-600">Aqui você consegue configurar o seu gateway da forma que desejar!</p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {/* ABA EMPRESA */}
          {activeTab === 'empresa' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Alterar dados da empresa</h3>
                <p className="text-sm text-slate-500">Mantenha as informações da sua empresa sempre atualizadas</p>
              </div>

              {/* Endereço da empresa */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Endereço da empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      CEP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="04121002"
                      placeholder="00000-000"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Estado (UF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="SP"
                      placeholder="SP"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue="São Paulo"
                      placeholder="São Paulo"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bairro <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="Vila Mariana"
                    placeholder="Vila Mariana"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="Santa Cruz"
                    placeholder="Santa Cruz"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Número <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="2187"
                    placeholder="2187"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t pt-6"></div>

              {/* Contato e suporte */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email de suporte</label>
                  <input
                    type="email"
                    defaultValue="suporte@pag2pay.com"
                    placeholder="suporte@empresa.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Esse email aparecerá nas páginas de termos de uso e política de privacidade.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link para entrar em contato com o suporte</label>
                  <input
                    type="url"
                    placeholder="https://"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Este link aparecerá no menu lateral do produtor.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link para o comprador entrar em contato com o suporte</label>
                  <input
                    type="url"
                    placeholder="https://"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Este link aparecerá no email de realização de pedido do comprador.</p>
                </div>
              </div>

              <div className="border-t pt-6"></div>

              {/* Informações da empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="63.284.358/0001-03"
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Razão Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="PAG2 PAY LTDA"
                    placeholder="EMPRESA LTDA"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pixel do Facebook */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">ID do pixel do facebook</label>
                <input
                  type="text"
                  placeholder="0000000000000000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2">
                  O evento 'CompleteRegistration' será disparado sempre que um produtor se cadastrar.
                </p>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-center pt-4">
                <button className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg">
                  Salvar
                </button>
              </div>
            </div>
          )}

          {/* ABA IMAGENS */}
          {activeTab === 'imagens' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Personalização Visual</h3>
                <p className="text-sm text-slate-500">Personalize a identidade visual da sua plataforma</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Favicon Upload */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Ícone do Site (Favicon)</h4>
                  <p className="text-sm text-slate-500 mb-4">Aparece na aba do navegador. Recomendado: 32x32px ou 64x64px</p>

                  <div className="space-y-4">
                    {faviconPreview ? (
                      <div className="relative">
                        <div className="w-32 h-32 bg-white border-2 border-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={faviconPreview} alt="Favicon Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <button
                          onClick={removeFavicon}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="w-32 h-32 bg-white border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition">
                          <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-slate-500">Clique para enviar</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Logo da Plataforma</h4>
                  <p className="text-sm text-slate-500 mb-4">Aparece no painel administrativo e de usuários. Recomendado: PNG com fundo transparente</p>

                  <div className="space-y-4">
                    {logoPreview ? (
                      <div className="relative">
                        <div className="w-full h-32 bg-white border-2 border-slate-300 rounded-lg flex items-center justify-center overflow-hidden p-4">
                          <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <button
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="w-full h-32 bg-white border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition">
                          <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-slate-500">Clique para enviar</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Achievement Logo Upload */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Logo para Placas de Premiações 🏆</h4>
                  <p className="text-sm text-slate-500 mb-4">Aparece nas placas de conquistas. Recomendado: PNG com fundo transparente</p>

                  <div className="space-y-4">
                    {achievementLogoPreview ? (
                      <div className="relative">
                        <div className="w-full h-32 bg-white border-2 border-slate-300 rounded-lg flex items-center justify-center overflow-hidden p-4">
                          <img src={achievementLogoPreview} alt="Achievement Logo Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <button
                          onClick={removeAchievementLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="w-full h-32 bg-white border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition">
                          <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-slate-500">Clique para enviar</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAchievementLogoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Onde as imagens aparecerão
                </h4>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Favicon:</span> Aparece na aba do navegador (tanto no painel administrativo azul quanto no painel de usuário verde)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Logo:</span> Aparece no menu lateral esquerdo de ambos os painéis (administrativo e usuário)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Logo para Placas de Premiações:</span> Aparece nos modais de conquistas desbloqueadas pelos usuários</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Painel Administrativo (Azul):</span> Login de administrador da plataforma</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Painel de Usuário (Verde):</span> Login de produtores e afiliados</p>
                  </div>
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSaveImages}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                >
                  Salvar Imagens
                </button>
              </div>
            </div>
          )}

          {/* ABA TEXTOS */}
          {activeTab === 'textos' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Textos e Mensagens</h3>
                <p className="text-sm text-slate-500">Configure os textos que aparecem na plataforma e nas páginas públicas</p>
              </div>

              {/* SEO e Branding */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  SEO e Identidade
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Título do Site <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={siteTexts.siteTitle}
                      onChange={(e) => setSiteTexts({...siteTexts, siteTitle: e.target.value})}
                      placeholder="Ex: Pag2Pay"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Aparece na aba do navegador e nos resultados de busca</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subtítulo do Site
                    </label>
                    <input
                      type="text"
                      value={siteTexts.siteSubtitle}
                      onChange={(e) => setSiteTexts({...siteTexts, siteSubtitle: e.target.value})}
                      placeholder="Ex: O melhor gateway de pagamentos"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Aparece logo após o título na página inicial</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descrição do Site
                    </label>
                    <textarea
                      value={siteTexts.siteDescription}
                      onChange={(e) => setSiteTexts({...siteTexts, siteDescription: e.target.value})}
                      placeholder="Ex: Plataforma completa de pagamentos para produtores digitais..."
                      rows="3"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Usada para SEO e quando o link for compartilhado em redes sociais</p>
                  </div>
                </div>
              </div>

              {/* Mensagens de Boas-vindas */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Mensagens de Boas-vindas
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mensagem de Boas-vindas - Login
                    </label>
                    <textarea
                      value={siteTexts.loginWelcomeMessage}
                      onChange={(e) => setSiteTexts({...siteTexts, loginWelcomeMessage: e.target.value})}
                      placeholder="Ex: Bem-vindo de volta! Faça login para acessar seu painel..."
                      rows="3"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Mensagem exibida na página de login</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mensagem de Boas-vindas - Cadastro
                    </label>
                    <textarea
                      value={siteTexts.registerWelcomeMessage}
                      onChange={(e) => setSiteTexts({...siteTexts, registerWelcomeMessage: e.target.value})}
                      placeholder="Ex: Crie sua conta gratuita e comece a vender hoje mesmo..."
                      rows="3"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Mensagem exibida na página de cadastro</p>
                  </div>
                </div>
              </div>

              {/* Info sobre onde os textos aparecem */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Onde os textos são exibidos
                </h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Título:</span> Aba do navegador, resultados de busca do Google</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Subtítulo:</span> Logo abaixo do título na homepage</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Descrição:</span> Meta description para SEO, preview em redes sociais</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><span className="font-semibold">Mensagens de boas-vindas:</span> Páginas de login e cadastro</p>
                  </div>
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSaveTexts}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                >
                  Salvar Textos
                </button>
              </div>
            </div>
          )}

          {/* ABA EXTRAS */}
          {activeTab === 'extras' && (
            <div className="space-y-8">
              {/* Configurações Gerais */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Configurações Gerais</h3>

                {/* Modo Demonstração - Seção Especial */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 mb-1 text-lg flex items-center gap-2">
                        🎭 Modo de Demonstração (Individual)
                      </h4>
                      <p className="text-sm text-slate-600">
                        Selecione usuários que verão dados fictícios em seus painéis. Útil para marketing, testes e treinamento.
                      </p>
                    </div>
                  </div>

                  {/* Seletor de Usuários */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          placeholder="Digite o email do usuário..."
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          list="user-emails"
                        />
                        <datalist id="user-emails">
                          {allUsers.filter(u => !demoModeUsers.includes(u.email)).map(user => (
                            <option key={user.id} value={user.email}>{user.name}</option>
                          ))}
                        </datalist>
                      </div>
                      <button
                        onClick={() => searchEmail && addUserToDemo(searchEmail)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Adicionar
                      </button>
                    </div>

                    {/* Lista de Usuários em Modo Demo */}
                    {demoModeUsers.length > 0 && (
                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <h5 className="font-semibold text-slate-700 mb-3">
                          Usuários em Modo Demo ({demoModeUsers.length})
                        </h5>
                        <div className="space-y-2">
                          {demoModeUsers.map((email, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg"
                            >
                              <span className="text-sm font-medium text-slate-700">{email}</span>
                              <button
                                onClick={() => removeUserFromDemo(email)}
                                className="text-red-600 hover:text-red-800 transition"
                              >
                                ✕ Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {demoModeUsers.length === 0 && (
                      <div className="text-center py-6 text-slate-400">
                        <p className="text-sm">Nenhum usuário em modo demo. Adicione usuários acima.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Outras Configurações Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleSwitch
                    checked={extrasConfig.blockNewRegistrations}
                    onChange={() => toggleConfig('blockNewRegistrations')}
                    label="Bloquear novos cadastros"
                    description="Impede que novos produtores se registrem na plataforma"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.autoCreateSplitAccount}
                    onChange={() => toggleConfig('autoCreateSplitAccount')}
                    label="Criação automática de conta split"
                    description="Habilita a criação automática de contas split para produtores assim que suas contas forem aprovadas"
                  />
                </div>
              </div>

              <div className="border-t"></div>

              {/* Produtos e Vendas */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Produtos e Vendas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleSwitch
                    checked={extrasConfig.forceProductSalesPage}
                    onChange={() => toggleConfig('forceProductSalesPage')}
                    label="Forçar página de vendas do produto"
                    description="Obriga os produtores a configurarem uma página de vendas para seus produtos"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.forceWhatsappSupport}
                    onChange={() => toggleConfig('forceWhatsappSupport')}
                    label="Forçar whatsapp de suporte no cadastro de produtos"
                    description="Obriga os produtores a informarem um contato de suporte ao cadastrar produtos"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.allowPhysicalProducts}
                    onChange={() => toggleConfig('allowPhysicalProducts')}
                    label="Permitir venda de produtos físicos"
                    description="Habilita a funcionalidade de venda de produtos físicos na plataforma"
                    highlighted={true}
                  />
                  <ToggleSwitch
                    checked={extrasConfig.allowWeeklySignature}
                    onChange={() => toggleConfig('allowWeeklySignature')}
                    label="Permitir assinatura semanal"
                    description="Ao desativar, todas as ofertas semanais serão atualizadas para mensais com frequência de 1 mês"
                    highlighted={true}
                  />
                  <ToggleSwitch
                    checked={extrasConfig.allowApiCheckout}
                    onChange={() => toggleConfig('allowApiCheckout')}
                    label="Permitir criação de checkout via API"
                    description="Habilita a criação de checkouts através da API da plataforma"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.allowProductExport}
                    onChange={() => toggleConfig('allowProductExport')}
                    label="Permitir que o produtor exporte suas vendas"
                    description="Habilita a funcionalidade para que produtores possam exportar seus próprios dados de vendas"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.autoApproveProducts}
                    onChange={() => toggleConfig('autoApproveProducts')}
                    label="Aprovar novos produtos automaticamente"
                    description="Produtos cadastrados pelos produtores são aprovados automaticamente sem revisão manual"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.internationalSalesStripe}
                    onChange={() => toggleConfig('internationalSalesStripe')}
                    label="Vendas internacionais apenas via Stripe"
                    description="Ao marcar essa opção, se o produtor não estiver com a Stripe habilitada, as ofertas com moedas internacionais serão desabilitadas"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.allowProductClone}
                    onChange={() => toggleConfig('allowProductClone')}
                    label="Permitir que o produtor clone produtos"
                    description="Habilita a funcionalidade para que produtores possam clonar seus próprios produtos"
                  />
                </div>
              </div>

              <div className="border-t"></div>

              {/* Configurações do Checkout */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Configurações do Checkout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleSwitch
                    checked={extrasConfig.hideAccessProductLink}
                    onChange={() => toggleConfig('hideAccessProductLink')}
                    label="Ocultar link de 'acessar produto' na página de pagamento pendente"
                    description="Remove o link que permite ao cliente acessar o produto antes da confirmação do pagamento"
                  />
                  <ToggleSwitch
                    checked={extrasConfig.removeDocumentFieldCheckout}
                    onChange={() => toggleConfig('removeDocumentFieldCheckout')}
                    label="Remover campo de 'documento' no checkout interno (Quando a adquirente permitir)"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideCompanyNameCheckout}
                    onChange={() => toggleConfig('hideCompanyNameCheckout')}
                    label="Ocultar nome da empresa dos metadados do checkout"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideProducerNameCheckout}
                    onChange={() => toggleConfig('hideProducerNameCheckout')}
                    label="Ocultar nome do produtor na página do checkout"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideFooterInfoCheckout}
                    onChange={() => toggleConfig('hideFooterInfoCheckout')}
                    label="Ocultar informações do rodapé do checkout"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideCompanyFooterCheckout}
                    onChange={() => toggleConfig('hideCompanyFooterCheckout')}
                    label="Ocultar rodapé da empresa na página pós checkout (order)"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideCompanyLogoCheckout}
                    onChange={() => toggleConfig('hideCompanyLogoCheckout')}
                    label="Ocultar logo da empresa do checkout"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.showProducerPersonalEmail}
                    onChange={() => toggleConfig('showProducerPersonalEmail')}
                    label="Mostrar endereço de e-mail pessoal do produtor caso o produto não tenha e-mail de suporte"
                    description="Exibe o email pessoal do produtor como fallback quando não há email de suporte configurado no produto"
                  />
                </div>
              </div>

              <div className="border-t"></div>

              {/* Ocultar Informações */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Ocultar Informações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleSwitch
                    checked={extrasConfig.hideRetentionPercentage}
                    onChange={() => toggleConfig('hideRetentionPercentage')}
                    label="Ocultar porcentagem de retenção do painel do produtor"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideRetentionDays}
                    onChange={() => toggleConfig('hideRetentionDays')}
                    label="Ocultar dias de retenção do painel do produtor"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideRetentionFundsReport}
                    onChange={() => toggleConfig('hideRetentionFundsReport')}
                    label="Ocultar retenção de fundos do relatório de vendas do produtor"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideInstallmentTax}
                    onChange={() => toggleConfig('hideInstallmentTax')}
                    label="Ocultar taxa do parcelamento paga pelo cliente no painel do produtor"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideRefundChargeback}
                    onChange={() => toggleConfig('hideRefundChargeback')}
                    label="Ocultar reembolso e chargeback do painel do produtor"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideProducerColorSettings}
                    onChange={() => toggleConfig('hideProducerColorSettings')}
                    label="Não permitir que o produtor altere as cores da área de membros interna"
                    description=""
                  />
                  <ToggleSwitch
                    checked={extrasConfig.hideProducerEmail}
                    onChange={() => toggleConfig('hideProducerEmail')}
                    label="Ocultar email do produtor nas páginas que o comprador podia ver"
                    description="Remove o email do produtor das páginas visíveis aos compradores. Se o produtor tiver definido um email de suporte no produto, ele ainda será exibido."
                  />
                </div>
              </div>

              <div className="border-t"></div>

              {/* Configurações Avançadas */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Configurações avançadas</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <ToggleSwitch
                      checked={extrasConfig.maintenanceMode}
                      onChange={() => toggleConfig('maintenanceMode')}
                      label="Manutenção"
                      description="Ao marcar essa opção, nenhum produtor vai conseguir acessar o painel dele, nenhum checkout será processado e nenhuma venda via API será permitida."
                    />
                  </div>
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSaveExtrasWithDemo}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {/* ABA FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Configurações Financeiras</h3>
                <p className="text-sm text-slate-500">Taxas, comissões e configurações de pagamento</p>
              </div>

              <div className="text-center py-12 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Configurações financeiras em desenvolvimento</p>
                <p className="text-sm mt-2">Em breve você poderá configurar taxas e comissões</p>
              </div>
            </div>
          )}
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
      </div>
    </PlatformLayout>
  )
}
