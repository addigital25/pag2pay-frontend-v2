import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformLayout from '../../components/PlatformLayout'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'

export default function PlatformAcquirers() {
  const navigate = useNavigate()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [adquirenteTab, setAdquirenteTab] = useState('roteamento')
  const [tipoTransacao, setTipoTransacao] = useState('deposito')

  // Lista de todas as adquirentes disponíveis
  const allAcquirers = {
    pix: ['Pagar.me', 'Mercado Pago', 'PagSeguro', 'Stripe', 'Asaas'],
    cartao: ['Pagar.me', 'Cielo', 'Stripe', 'Mercado Pago'],
    boleto: ['Pagar.me', 'Banco do Brasil', 'Bradesco', 'Itaú'],
    saque: ['Pagar.me', 'Mercado Pago', 'Asaas']
  }

  // Estados para adquirentes selecionadas (ordem)
  const [pixOrder, setPixOrder] = useState([])
  const [cartaoOrder, setCartaoOrder] = useState([])
  const [boletoOrder, setBoletoOrder] = useState([])
  const [saqueOrder, setSaqueOrder] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para controlar dropdown aberto
  const [pixDropdownOpen, setPixDropdownOpen] = useState(false)
  const [cartaoDropdownOpen, setCartaoDropdownOpen] = useState(false)
  const [boletoDropdownOpen, setBoletoDropdownOpen] = useState(false)
  const [saqueDropdownOpen, setSaqueDropdownOpen] = useState(false)

  // Refs para detectar clique fora
  const pixDropdownRef = useRef(null)
  const cartaoDropdownRef = useRef(null)
  const boletoDropdownRef = useRef(null)
  const saqueDropdownRef = useRef(null)

  // Carregar configurações de roteamento do backend
  const loadRoutingConfig = async () => {
    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings/acquirer-routing', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Configurações de roteamento carregadas:', data.routing)

        if (data.routing) {
          setPixOrder(data.routing.pix || [])
          setCartaoOrder(data.routing.cartao || [])
          setBoletoOrder(data.routing.boleto || [])
          setSaqueOrder(data.routing.saque || [])
        }
      } else {
        console.warn('⚠️ Erro ao carregar configurações de roteamento:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações de roteamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar configurações de roteamento no backend
  const saveRoutingConfig = async () => {
    try {
      const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings/acquirer-routing', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pix: pixOrder,
          cartao: cartaoOrder,
          boleto: boletoOrder,
          saque: saqueOrder
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Configurações de roteamento salvas:', data.routing)
      } else {
        console.warn('⚠️ Erro ao salvar configurações de roteamento:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar configurações de roteamento:', error)
    }
  }

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadRoutingConfig()
  }, [])

  // Salvar configurações automaticamente quando houver mudanças
  useEffect(() => {
    if (!isLoading) {
      saveRoutingConfig()
    }
  }, [pixOrder, cartaoOrder, boletoOrder, saqueOrder])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pixDropdownRef.current && !pixDropdownRef.current.contains(event.target)) {
        setPixDropdownOpen(false)
      }
      if (cartaoDropdownRef.current && !cartaoDropdownRef.current.contains(event.target)) {
        setCartaoDropdownOpen(false)
      }
      if (boletoDropdownRef.current && !boletoDropdownRef.current.contains(event.target)) {
        setBoletoDropdownOpen(false)
      }
      if (saqueDropdownRef.current && !saqueDropdownRef.current.contains(event.target)) {
        setSaqueDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Funções para mover itens
  const moveUp = (index, orderArray, setOrderFunction) => {
    if (index === 0) return
    const newOrder = [...orderArray]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    setOrderFunction(newOrder)
  }

  const moveDown = (index, orderArray, setOrderFunction) => {
    if (index === orderArray.length - 1) return
    const newOrder = [...orderArray]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    setOrderFunction(newOrder)
  }

  // Funções para adicionar/remover adquirentes
  const toggleAcquirer = (acquirer, orderArray, setOrderFunction) => {
    if (orderArray.includes(acquirer)) {
      // Remove se já estiver selecionada
      setOrderFunction(orderArray.filter(item => item !== acquirer))
    } else {
      // Adiciona se não estiver selecionada
      setOrderFunction([...orderArray, acquirer])
    }
  }

  // Função para obter adquirentes ativas (usadas no roteamento)
  const getActiveAcquirers = () => {
    const active = new Set()
    pixOrder.forEach(acq => active.add(acq))
    cartaoOrder.forEach(acq => active.add(acq))
    boletoOrder.forEach(acq => active.add(acq))
    saqueOrder.forEach(acq => active.add(acq))
    return Array.from(active)
  }

  // Função para obter todas as adquirentes configuradas (mock - em produção viria do backend)
  const getConfiguredAcquirers = () => {
    // Por enquanto, retorna vazio pois nenhuma está configurada ainda
    return []
  }

  // Função para obter todas as adquirentes disponíveis
  const getAllOtherAcquirers = () => {
    const allUnique = new Set()
    Object.values(allAcquirers).forEach(list => {
      list.forEach(acq => allUnique.add(acq))
    })

    const active = getActiveAcquirers()
    const configured = getConfiguredAcquirers()

    // Retorna adquirentes que não estão nem ativas nem configuradas
    return Array.from(allUnique).filter(acq =>
      !active.includes(acq) && !configured.includes(acq)
    )
  }

  // Função para obter informações visuais da adquirente
  const getAcquirerInfo = (name) => {
    const configs = {
      'Pagar.me': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
        ),
        route: '/platform/financial/acquirers/pagarme',
        color: 'emerald'
      },
      'Mercado Pago': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
        ),
        color: 'blue'
      },
      'PagSeguro': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
        ),
        color: 'orange'
      },
      'Cielo': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
        ),
        color: 'purple'
      },
      'Stripe': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
            </svg>
          </div>
        ),
        color: 'indigo'
      },
      'Asaas': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        ),
        color: 'teal'
      },
      'Banco do Brasil': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
            </svg>
          </div>
        ),
        color: 'yellow'
      },
      'Bradesco': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
            </svg>
          </div>
        ),
        color: 'red'
      },
      'Itaú': {
        logo: (
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
            </svg>
          </div>
        ),
        color: 'orange'
      }
    }

    return configs[name] || {
      logo: (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      ),
      color: 'gray'
    }
  }

  // Função para lidar com clique na adquirente
  const handleAcquirerClick = (acquirerName) => {
    const info = getAcquirerInfo(acquirerName)
    if (info.route) {
      navigate(info.route)
    } else {
      showAlert({
        title: 'Em breve',
        message: `Configuração de ${acquirerName} em breve!`,
        type: 'info'
      })
    }
  }

  return (
    <PlatformLayout>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Adquirentes</h2>
          <p className="text-slate-600 mt-1">Configure o roteamento inteligente de pagamentos e adicione novas conexões de adquirentes</p>
        </div>

        {/* Sub-menu: Roteamento Inteligente / Conexões */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
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
              Adquirentes
            </button>
          </nav>
        </div>

        {/* Conteúdo: Roteamento Inteligente */}
        {adquirenteTab === 'roteamento' && (
          <div>
            {/* Sub-abas: Depósito / Saque */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setTipoTransacao('deposito')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    tipoTransacao === 'deposito'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Depósito
                </button>
                <button
                  onClick={() => setTipoTransacao('saque')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
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

                    {/* Dropdown customizado */}
                    <div ref={pixDropdownRef} className="relative mb-4">
                      <button
                        onClick={() => setPixDropdownOpen(!pixDropdownOpen)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      >
                        <span className="text-sm text-gray-700">
                          {pixOrder.length > 0 ? pixOrder[0] : 'Selecione...'}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${pixDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {pixDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {allAcquirers.pix.map((acquirer) => (
                            <div
                              key={acquirer}
                              onClick={() => toggleAcquirer(acquirer, pixOrder, setPixOrder)}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                                pixOrder.includes(acquirer) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={pixOrder.includes(acquirer)}
                                onChange={() => {}}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <span className={`text-sm ${pixOrder.includes(acquirer) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {acquirer}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para PIX</label>
                    <div className="space-y-2">
                      {pixOrder.map((item, index) => (
                        <div key={item} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={`#${index + 1} ${item}`}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveUp(index, pixOrder, setPixOrder)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveDown(index, pixOrder, setPixOrder)}
                              disabled={index === pixOrder.length - 1}
                              className={`p-1 rounded ${
                                index === pixOrder.length - 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coluna 2: Cartão */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de Cartão</h3>
                    <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>

                    {/* Dropdown customizado */}
                    <div ref={cartaoDropdownRef} className="relative mb-4">
                      <button
                        onClick={() => setCartaoDropdownOpen(!cartaoDropdownOpen)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      >
                        <span className="text-sm text-gray-700">
                          {cartaoOrder.length > 0 ? cartaoOrder[0] : 'Selecione...'}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${cartaoDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {cartaoDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {allAcquirers.cartao.map((acquirer) => (
                            <div
                              key={acquirer}
                              onClick={() => toggleAcquirer(acquirer, cartaoOrder, setCartaoOrder)}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                                cartaoOrder.includes(acquirer) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={cartaoOrder.includes(acquirer)}
                                onChange={() => {}}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <span className={`text-sm ${cartaoOrder.includes(acquirer) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {acquirer}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para cartão</label>
                    <div className="space-y-2">
                      {cartaoOrder.map((item, index) => (
                        <div key={item} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={`#${index + 1} ${item}`}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveUp(index, cartaoOrder, setCartaoOrder)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveDown(index, cartaoOrder, setCartaoOrder)}
                              disabled={index === cartaoOrder.length - 1}
                              className={`p-1 rounded ${
                                index === cartaoOrder.length - 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coluna 3: Boleto */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de Boleto</h3>
                    <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>

                    {/* Dropdown customizado */}
                    <div ref={boletoDropdownRef} className="relative mb-4">
                      <button
                        onClick={() => setBoletoDropdownOpen(!boletoDropdownOpen)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      >
                        <span className="text-sm text-gray-700">
                          {boletoOrder.length > 0 ? boletoOrder[0] : 'Selecione...'}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${boletoDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {boletoDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {allAcquirers.boleto.map((acquirer) => (
                            <div
                              key={acquirer}
                              onClick={() => toggleAcquirer(acquirer, boletoOrder, setBoletoOrder)}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                                boletoOrder.includes(acquirer) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={boletoOrder.includes(acquirer)}
                                onChange={() => {}}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <span className={`text-sm ${boletoOrder.includes(acquirer) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {acquirer}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para boleto</label>
                    <div className="space-y-2">
                      {boletoOrder.map((item, index) => (
                        <div key={item} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={`#${index + 1} ${item}`}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveUp(index, boletoOrder, setBoletoOrder)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveDown(index, boletoOrder, setBoletoOrder)}
                              disabled={index === boletoOrder.length - 1}
                              className={`p-1 rounded ${
                                index === boletoOrder.length - 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Conteúdo: Saque (1 coluna) */}
            {tipoTransacao === 'saque' && (
              <>
                <div className="max-w-xl mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Adquirentes de Saque</h3>
                  <label className="block text-sm text-gray-600 mb-2">Selecione as desejadas</label>

                  {/* Dropdown customizado */}
                  <div ref={saqueDropdownRef} className="relative mb-4">
                    <button
                      onClick={() => setSaqueDropdownOpen(!saqueDropdownOpen)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    >
                      <span className="text-sm text-gray-700">
                        {saqueOrder.length > 0 ? saqueOrder[0] : 'Selecione...'}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${saqueDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {saqueDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {allAcquirers.saque.map((acquirer) => (
                          <div
                            key={acquirer}
                            onClick={() => toggleAcquirer(acquirer, saqueOrder, setSaqueOrder)}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                              saqueOrder.includes(acquirer) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={saqueOrder.includes(acquirer)}
                              onChange={() => {}}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className={`text-sm ${saqueOrder.includes(acquirer) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {acquirer}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="block text-sm font-semibold text-gray-900 mb-2">Ordem para Saque</label>
                  <div className="space-y-2">
                    {saqueOrder.map((item, index) => (
                      <div key={item} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`#${index + 1} ${item}`}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(index, saqueOrder, setSaqueOrder)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveDown(index, saqueOrder, setSaqueOrder)}
                            disabled={index === saqueOrder.length - 1}
                            className={`p-1 rounded ${
                              index === saqueOrder.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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

            {/* Ativas - Dinâmico baseado no roteamento */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Ativas ({getActiveAcquirers().length})</h3>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {getActiveAcquirers().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getActiveAcquirers().map(acquirer => (
                    <div
                      key={acquirer}
                      onClick={() => handleAcquirerClick(acquirer)}
                      className="bg-white border-2 border-emerald-500 rounded-lg p-4 hover:shadow-lg transition cursor-pointer hover:border-emerald-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getAcquirerInfo(acquirer).logo}
                          <div>
                            <h4 className="font-bold text-gray-900">{acquirer}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {pixOrder.includes(acquirer) && 'Pix'}
                              {cartaoOrder.includes(acquirer) && (pixOrder.includes(acquirer) ? ', Cartão' : 'Cartão')}
                              {boletoOrder.includes(acquirer) && ((pixOrder.includes(acquirer) || cartaoOrder.includes(acquirer)) ? ', Boleto' : 'Boleto')}
                              {saqueOrder.includes(acquirer) && ((pixOrder.includes(acquirer) || cartaoOrder.includes(acquirer) || boletoOrder.includes(acquirer)) ? ', Saque' : 'Saque')}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Ativo</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">Nenhuma adquirente ativa no roteamento</p>
                </div>
              )}
            </div>

            {/* Configuradas - Dinâmico */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Configuradas ({getConfiguredAcquirers().length})</h3>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {getConfiguredAcquirers().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getConfiguredAcquirers().map(acquirer => (
                    <div
                      key={acquirer}
                      onClick={() => handleAcquirerClick(acquirer)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getAcquirerInfo(acquirer).logo}
                          <div>
                            <h4 className="font-bold text-gray-900">{acquirer}</h4>
                            <p className="text-xs text-gray-500 mt-1">Credenciais configuradas</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Configurado</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">Nenhuma adquirente configurada</p>
                </div>
              )}
            </div>

            {/* Todas as outras - Dinâmico */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Todas as outras ({getAllOtherAcquirers().length})</h3>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {getAllOtherAcquirers().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAllOtherAcquirers().map(acquirer => (
                    <div
                      key={acquirer}
                      onClick={() => handleAcquirerClick(acquirer)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer hover:border-gray-400"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getAcquirerInfo(acquirer).logo}
                          <div>
                            <h4 className="font-bold text-gray-900">{acquirer}</h4>
                            <p className="text-xs text-gray-500 mt-1">Disponível para configuração</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Disponível</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Outras adquirentes estarão disponíveis em breve.
                    <br />
                    <span className="text-xs text-gray-400">Cada adquirente possui uma integração específica e será adicionada conforme necessário.</span>
                  </p>
                </div>
              )}
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
    </PlatformLayout>
  )
}
