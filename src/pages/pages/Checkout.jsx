import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import PixIcon from '../components/PixIcon'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import config from '../config'
// import { useUserStatus } from '../hooks/useUserStatus' // DESABILITADO PARA TESTES

function Checkout() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { alertState, showAlert, hideAlert } = useAlert()
  // const { canCheckout, status, loading: statusLoading } = useUserStatus() // DESABILITADO PARA TESTES
  const [product, setProduct] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('checkoutFormData')
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })
  const [cpfValidation, setCpfValidation] = useState({ blocked: false, status: null })
  const [isValidatingCPF, setIsValidatingCPF] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [validationError, setValidationError] = useState(null)
  const [noEmail, setNoEmail] = useState(false)
  const [creditCardData, setCreditCardData] = useState(() => {
    const saved = localStorage.getItem('checkoutCreditCardData')
    return saved ? JSON.parse(saved) : {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      installments: 12
    }
  })
  const [cardFieldErrors, setCardFieldErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [counterTime, setCounterTime] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Refs para scroll automático
  const formFieldsRef = useRef({
    name: null,
    email: null,
    phone: null,
    cpf: null,
    zipCode: null,
    address: null,
    number: null,
    neighborhood: null,
    city: null,
    state: null,
    cardNumber: null,
    cardName: null,
    expiryDate: null,
    cvv: null
  })

  // Session ID para rastreamento de abandonos
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('checkoutSessionId')
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('checkoutSessionId', sid)
    }
    return sid
  })

  useEffect(() => {
    fetch(`${config.apiUrl}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)

        // Verificar se há um plano específico na URL
        const planCode = searchParams.get('plan')
        if (planCode && data.plans) {
          const plan = data.plans.find(p => p.code === planCode)
          if (plan) {
            setSelectedPlan(plan)
          }
        }

        // Preencher dados do formulário se vieram da URL
        const urlParams = {
          name: searchParams.get('name'),
          email: searchParams.get('email'),
          phone: searchParams.get('phone'),
          cpf: searchParams.get('cpf'),
          zipCode: searchParams.get('zipCode'),
          address: searchParams.get('address'),
          number: searchParams.get('number'),
          complement: searchParams.get('complement'),
          neighborhood: searchParams.get('neighborhood'),
          city: searchParams.get('city'),
          state: searchParams.get('state')
        }

        // Se houver dados na URL, preencher o formulário
        const hasUrlData = Object.values(urlParams).some(val => val !== null && val !== '')
        if (hasUrlData) {
          setFormData(prev => ({
            ...prev,
            name: urlParams.name || prev.name,
            email: urlParams.email || prev.email,
            phone: urlParams.phone || prev.phone,
            cpf: urlParams.cpf || prev.cpf,
            zipCode: urlParams.zipCode || prev.zipCode,
            address: urlParams.address || prev.address,
            number: urlParams.number || prev.number,
            complement: urlParams.complement || prev.complement,
            neighborhood: urlParams.neighborhood || prev.neighborhood,
            city: urlParams.city || prev.city,
            state: urlParams.state || prev.state
          }))
        }

        // Set default payment method
        if (data.checkoutConfig?.paymentMethods?.pix) setSelectedPayment('pix')
        else if (data.checkoutConfig?.paymentMethods?.boleto) setSelectedPayment('boleto')
        else if (data.checkoutConfig?.paymentMethods?.creditCard) setSelectedPayment('creditCard')
        else if (data.checkoutConfig?.paymentMethods?.receiveAndPay) setSelectedPayment('afterPay')
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar produto:', err)
        setLoading(false)
      })
  }, [productId, searchParams])

  // Salvar dados do formulário no localStorage
  useEffect(() => {
    localStorage.setItem('checkoutFormData', JSON.stringify(formData))
  }, [formData])

  // Salvar dados do cartão no localStorage
  useEffect(() => {
    localStorage.setItem('checkoutCreditCardData', JSON.stringify(creditCardData))
  }, [creditCardData])

  // Função para rastrear abandono de carrinho
  const trackCheckout = async (step) => {
    if (!product) return

    const value = selectedPlan ? selectedPlan.price : product.price

    try {
      await fetch(`${config.apiUrl}/api/checkout/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          step,
          value
        })
      })
    } catch (error) {
      console.error('Erro ao rastrear checkout:', error)
    }
  }

  // Rastrear quando o usuário inicia o checkout
  useEffect(() => {
    if (product) {
      trackCheckout('checkout')
    }
  }, [product])

  // Rastrear quando o usuário preenche dados e escolhe forma de pagamento
  useEffect(() => {
    if (selectedPayment && formData.email && formData.name) {
      trackCheckout('payment')
    }
  }, [selectedPayment, formData.email, formData.name])

  // Atualizar contador a cada segundo
  useEffect(() => {
    if (selectedPlan?.useCounter) {
      const counterKey = `counter_${productId}_${selectedPlan.code}`

      // Verificar se já existe um contador salvo
      let endTime = localStorage.getItem(counterKey)

      if (!endTime) {
        // Iniciar novo contador com o tempo configurado (padrão 15 minutos)
        const counterMinutes = selectedPlan.counterMinutes || 15
        const now = new Date()
        endTime = now.getTime() + (counterMinutes * 60 * 1000)
        localStorage.setItem(counterKey, endTime)
      } else {
        endTime = parseInt(endTime)
      }

      const updateCounter = () => {
        const now = new Date().getTime()
        const diff = endTime - now

        if (diff <= 0) {
          // Contador zerado
          setCounterTime({ hours: 0, minutes: 0, seconds: 0 })
          return
        }

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setCounterTime({ hours, minutes, seconds })
      }

      updateCounter()
      const interval = setInterval(updateCounter, 1000)

      return () => clearInterval(interval)
    }
  }, [selectedPlan?.useCounter, selectedPlan?.counterMinutes, productId, selectedPlan?.code])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Limpar erro do campo ao digitar
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: false })
    }
    // Limpar mensagem de erro global se existir
    if (validationError) {
      setValidationError(null)
    }

    // Validar CPF automaticamente quando digitar 11 dígitos
    if (name === 'cpf' && value.replace(/\D/g, '').length === 11) {
      validateCPF(value)
    } else if (name === 'cpf') {
      setCpfValidation({ blocked: false, status: null })
      setCanProceed(selectedPayment !== 'afterPay')
    }

    // Buscar CEP automaticamente quando digitar 8 dígitos
    if (name === 'zipCode' && value.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(value.replace(/\D/g, ''))
    }
  }

  // Formatar telefone quando sair do campo (onBlur)
  const formatPhoneOnBlur = () => {
    const phone = formData.phone.replace(/\D/g, '') // Remove tudo que não é número

    if (phone.length === 11) {
      // Formato: (54) 999684305 -> (54) 99968-4305
      const formatted = `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`
      setFormData({
        ...formData,
        phone: formatted
      })
    } else if (phone.length === 10) {
      // Formato: (54) 99684305 -> (54) 9968-4305
      const formatted = `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`
      setFormData({
        ...formData,
        phone: formatted
      })
    }
  }

  const fetchAddressByCep = async (cep) => {
    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || '',
          city: data.localidade || '',
          state: data.uf || '',
          neighborhood: data.bairro || ''
        }))
      } else {
        showAlert({
          title: 'CEP Não Encontrado',
          message: 'O CEP informado não foi encontrado. Por favor, verifique e tente novamente.',
          type: 'warning'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      showAlert({
        title: 'Erro ao Buscar CEP',
        message: 'Não foi possível buscar o CEP. Por favor, preencha o endereço manualmente.',
        type: 'error'
      })
    } finally {
      setLoadingCep(false)
    }
  }

  const validateCPF = async (cpfValue) => {
    // Se não for AfterPay, não valida
    if (selectedPayment !== 'afterPay') {
      setCpfValidation({ blocked: false })
      setCanProceed(true)
      return
    }

    setIsValidatingCPF(true)

    try {
      const response = await fetch(`${config.apiUrl}/api/checkout/validate-cpf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpfValue.replace(/\D/g, ''),
          paymentMethod: selectedPayment
        })
      })

      const data = await response.json()

      if (data.blocked) {
        setCpfValidation({ blocked: true, status: data.status })
        setCanProceed(false)
      } else {
        setCpfValidation({ blocked: false })
        setCanProceed(true)
      }
    } catch (error) {
      console.error('Erro ao validar CPF:', error)
      setCanProceed(false)
    }

    setIsValidatingCPF(false)
  }

  // Revalidar CPF quando mudar forma de pagamento
  useEffect(() => {
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length === 11) {
      validateCPF(formData.cpf)
    } else if (selectedPayment !== 'afterPay') {
      setCpfValidation({ blocked: false })
      setCanProceed(true)
    }
  }, [selectedPayment])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um cupom')
      return
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, productId })
      })

      if (response.ok) {
        const coupon = await response.json()

        // Validar limite de 90% do valor do produto
        const currentPrice = selectedPlan ? selectedPlan.price : product.price
        const maxDiscountAllowed = currentPrice * 0.9

        let calculatedDiscount = 0
        if (coupon.type === 'percentage') {
          calculatedDiscount = currentPrice * (coupon.value / 100)
        } else {
          calculatedDiscount = coupon.value
        }

        if (calculatedDiscount > maxDiscountAllowed) {
          setCouponError(`⚠️ Este cupom excede o desconto máximo permitido de 90% (R$ ${maxDiscountAllowed.toFixed(2).replace('.', ',')})`)
          setAppliedCoupon(null)
          return
        }

        setAppliedCoupon(coupon)
        setCouponError('')
      } else {
        setCouponError('Cupom inválido ou expirado')
        setAppliedCoupon(null)
      }
    } catch (error) {
      setCouponError('Erro ao validar cupom')
      setAppliedCoupon(null)
    }
  }

  // Função auxiliar para classe de input com validação
  const getInputClassName = (fieldName) => {
    return `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition ${
      fieldErrors[fieldName]
        ? 'border-red-500 focus:ring-red-500 bg-red-50'
        : 'border-gray-300 focus:ring-indigo-500'
    }`
  }

  // Função auxiliar para classe de input do cartão com validação
  const getCardInputClassName = (fieldName) => {
    return `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
      cardFieldErrors[fieldName]
        ? 'border-red-500 focus:ring-red-500 bg-red-50'
        : 'border-gray-300 focus:ring-indigo-600 focus:border-transparent'
    }`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Limpar mensagens e erros anteriores
    setValidationError(null)
    const errors = {}

    // Validar campos obrigatórios do cliente
    if (!formData.name || formData.name.trim() === '') errors.name = true
    // Validar email apenas se não marcou "Não possuo e-mail"
    if (!noEmail && (!formData.email || formData.email.trim() === '')) errors.email = true
    if (!formData.phone || formData.phone.trim() === '') errors.phone = true
    if (!formData.cpf || formData.cpf.trim() === '') errors.cpf = true

    // Validar campos de endereço
    if (!formData.zipCode || formData.zipCode.trim() === '') errors.zipCode = true
    if (!formData.address || formData.address.trim() === '') errors.address = true
    if (!formData.number || formData.number.trim() === '') errors.number = true
    if (!formData.neighborhood || formData.neighborhood.trim() === '') errors.neighborhood = true
    if (!formData.city || formData.city.trim() === '') errors.city = true
    if (!formData.state || formData.state.trim() === '') errors.state = true

    // Se houver erros, marcar os campos e mostrar mensagem
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setValidationError('⚠️ Por favor, preencha todos os campos obrigatórios marcados em vermelho.')

      // Mostrar modal customizado
      setModalMessage('Por favor, preencha todos os campos obrigatórios.')
      setShowModal(true)

      // Scroll até o primeiro campo com erro
      const firstErrorField = Object.keys(errors)[0]
      const fieldRef = formFieldsRef.current[firstErrorField]
      if (fieldRef) {
        fieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => fieldRef.focus(), 500)
      }
      return
    }

    if (!selectedPayment) {
      setValidationError('⚠️ Selecione uma forma de pagamento')
      setModalMessage('Por favor, selecione uma forma de pagamento.')
      setShowModal(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (selectedPayment === 'afterPay' && !canProceed) {
      setValidationError('⚠️ CPF bloqueado ou inválido. Verifique os dados.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Validar dados do cartão de crédito se for o método selecionado
    if (selectedPayment === 'creditCard') {
      const cardErrors = {}

      const cardNumberClean = creditCardData.cardNumber.replace(/\s/g, '')
      if (!cardNumberClean || cardNumberClean.length !== 16) {
        cardErrors.cardNumber = true
      }
      if (!creditCardData.cardName || creditCardData.cardName.length < 3) {
        cardErrors.cardName = true
      }
      if (!creditCardData.expiryDate || creditCardData.expiryDate.length !== 5) {
        cardErrors.expiryDate = true
      }
      if (!creditCardData.cvv || (creditCardData.cvv.length !== 3 && creditCardData.cvv.length !== 4)) {
        cardErrors.cvv = true
      }

      if (Object.keys(cardErrors).length > 0) {
        setCardFieldErrors(cardErrors)
        setValidationError('⚠️ Por favor, preencha todos os campos do cartão corretamente.')
        setModalMessage('Por favor, preencha todos os dados do cartão de crédito.')
        setShowModal(true)

        // Scroll até o primeiro campo do cartão com erro
        const firstCardErrorField = Object.keys(cardErrors)[0]
        const fieldRef = formFieldsRef.current[firstCardErrorField]
        if (fieldRef) {
          fieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => fieldRef.focus(), 500)
        }
        return
      }
    }

    setSubmitting(true)

    // Se for AfterPay, adicionar CPF aos blockedCpfs
    if (selectedPayment === 'afterPay') {
      try {
        await fetch(`${config.apiUrl}/api/checkout/block-cpf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: formData.cpf.replace(/\D/g, '') })
        })
      } catch (error) {
        console.error('Erro ao bloquear CPF:', error)
      }
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          customer: formData,
          paymentMethod: selectedPayment,
          pixExpirationMinutes: product.checkoutConfig?.pixExpirationMinutes || 2880,
          boletoDueDays: product.checkoutConfig?.boletoDueDays || 5,
          selectedPlanName: selectedPlan ? selectedPlan.name : null,
          plan: selectedPlan ? {
            code: selectedPlan.code,
            name: selectedPlan.name,
            price: selectedPlan.price
          } : null,
          coupon: appliedCoupon ? {
            code: appliedCoupon.code,
            discount: discount
          } : null,
          affiliateId: new URLSearchParams(window.location.search).get('ref') || null
        })
      })

      const order = await response.json()

      // Marcar checkout como convertido (pedido criado com sucesso)
      try {
        await fetch(`${config.apiUrl}/api/checkout/track/${sessionId}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        // Limpar session ID para próximas compras
        localStorage.removeItem('checkoutSessionId')
      } catch (error) {
        console.error('Erro ao marcar conversão:', error)
      }

      // Se for cartão de crédito, processar pagamento diretamente
      if (selectedPayment === 'creditCard') {
        try {
          const paymentResponse = await fetch(`${config.apiUrl}/api/payments/credit-card/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              cardNumber: creditCardData.cardNumber.replace(/\s/g, ''),
              cardName: creditCardData.cardName,
              expiryDate: creditCardData.expiryDate,
              cvv: creditCardData.cvv,
              installments: creditCardData.installments
            })
          })

          const paymentResult = await paymentResponse.json()

          if (paymentResult.status === 'approved' || paymentResult.success) {
            navigate(`/payment-success/${order.id}`)
          } else {
            // Marcar pedido como cancelado
            try {
              await fetch(`${config.apiUrl}/api/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
            } catch (cancelErr) {
              console.error('Erro ao cancelar pedido:', cancelErr)
            }

            // Exibir motivo específico da recusa
            const refusalMessage = paymentResult.refusalReason || paymentResult.message || 'Pagamento recusado. Verifique os dados do cartão e tente novamente.'
            showAlert({
              title: 'Pagamento Recusado',
              message: refusalMessage,
              type: 'error'
            })
            setSubmitting(false)
          }
        } catch (paymentErr) {
          console.error('Erro ao processar pagamento:', paymentErr)

          // Marcar pedido como cancelado em caso de erro
          try {
            await fetch(`${config.apiUrl}/api/orders/${order.id}/cancel`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
          } catch (cancelErr) {
            console.error('Erro ao cancelar pedido:', cancelErr)
          }

          showAlert({
            title: 'Erro no Pagamento',
            message: 'Não foi possível processar o pagamento. Por favor, tente novamente.',
            type: 'error'
          })
          setSubmitting(false)
        }
      } else {
        // Para outros métodos, redirecionar para confirmação
        navigate(`/order-confirmation/${order.id}`)
      }
    } catch (err) {
      console.error('Erro ao criar pedido:', err)
      showAlert({
        title: 'Erro ao Processar Pedido',
        message: 'Não foi possível processar seu pedido. Por favor, tente novamente.',
        type: 'error'
      })
    } finally {
      if (selectedPayment !== 'creditCard') {
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Produto não encontrado</p>
        </div>
      </div>
    )
  }

  // Verificar se o produto está com status PENDENTE
  if (product.approvalStatus === 'PENDENTE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-6">Produto Indisponível</h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <p className="text-lg text-gray-700">
                  Este produto está temporariamente indisponível para compra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Verificar se o plano selecionado está disponível para venda
  if (selectedPlan && selectedPlan.isAvailableForSale === false) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Plano Indisponível</h1>
              <p className="text-lg text-gray-600 mb-6">
                O plano <span className="font-semibold text-gray-900">"{selectedPlan.name}"</span> está temporariamente indisponível para venda.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Este produto não está disponível no momento. Entre em contato com o vendedor para mais informações.
                </p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Usar preço do plano se selecionado, senão usar preço do produto
  const currentPrice = selectedPlan ? selectedPlan.price : product.price
  const subtotal = currentPrice

  // Calcular desconto do cupom com limite de 90%
  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = subtotal * (appliedCoupon.value / 100)
    } else {
      discount = appliedCoupon.value
    }

    // Garantir que o desconto não ultrapasse 90% do valor
    const maxDiscountAllowed = subtotal * 0.9
    if (discount > maxDiscountAllowed) {
      discount = maxDiscountAllowed
    }
  }

  // Calcular frete
  const shippingCost = selectedPlan?.freeShipping === false ? (selectedPlan?.shippingPrice || 0) : 0

  const totalValue = subtotal - discount + shippingCost

  // ============================================
  // BLOQUEIO DE CHECKOUT DESABILITADO PARA TESTES
  // ============================================
  // Verificar se o usuário pode acessar o checkout
  // if (statusLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Verificando permissões...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // // Se não pode fazer checkout (não está aprovado)
  // if (!canCheckout) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 py-8">
  //       <div className="container mx-auto px-4">
  //         <div className="max-w-3xl mx-auto">
  //           {/* Banner de Bloqueio */}
  //           <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
  //             <div className="mb-6">
  //               <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //                 <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  //                 </svg>
  //               </div>
  //             </div>

  //             <h1 className="text-3xl font-bold text-gray-800 mb-4">
  //               ⚠️ Checkout Indisponível
  //             </h1>

  //             <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
  //               <p className="text-lg text-yellow-800 font-semibold mb-3">
  //                 {status === 'pending' && 'Sua conta está em análise'}
  //                 {status === 'not_submitted' && 'Você precisa enviar seus documentos'}
  //                 {status === 'awaiting_adjustment' && 'Documentos aguardando correção'}
  //               </p>
  //               <p className="text-yellow-700">
  //                 {status === 'pending' && 'Aguarde a aprovação do administrador para poder finalizar vendas. Você receberá uma notificação quando sua conta for aprovada.'}
  //                 {status === 'not_submitted' && 'Complete seu cadastro e envie seus documentos para poder realizar vendas na plataforma.'}
  //                 {status === 'awaiting_adjustment' && 'O administrador solicitou ajustes nos seus documentos. Corrija e reenvie para liberar o acesso ao checkout.'}
  //               </p>
  //             </div>

  //             <div className="flex flex-col sm:flex-row gap-4 justify-center">
  //               <button
  //                 onClick={() => navigate('/')}
  //                 className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
  //               >
  //                 ← Voltar ao Início
  //               </button>
  //               {(status === 'not_submitted' || status === 'awaiting_adjustment') && (
  //                 <button
  //                   onClick={() => navigate('/documents')}
  //                   className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
  //                 >
  //                   📄 Enviar Documentos
  //                 </button>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Imagem de Cabeçalho (se houver) */}
      {selectedPlan?.headerImage && (
        <div className="w-full">
          <img
            src={selectedPlan.headerImage}
            alt="Header"
            className="w-full h-auto object-cover"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      <div className="relative">
        {/* Imagem Lateral Direita (se houver) */}
        {selectedPlan?.sideImage && (
          <div className="hidden xl:block fixed right-0 top-0 h-screen" style={{ width: '305px' }}>
            <img
              src={selectedPlan.sideImage}
              alt="Side"
              className="w-full h-full object-cover"
              style={{ width: '305px', height: '990px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className={`container mx-auto px-4 py-8 ${selectedPlan?.sideImage ? 'xl:mr-[305px]' : ''}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Finalizar Pedido</h1>
              {selectedPlan?.useCounter && (
                <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1">Oferta Termina Em</p>
                    <p className="text-2xl font-bold">
                      {String(counterTime.hours).padStart(2, '0')}:{String(counterTime.minutes).padStart(2, '0')}:{String(counterTime.seconds).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-5 gap-8">
            {/* Left: Order Summary */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                {selectedPlan && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-emerald-800 font-semibold">
                      📋 {selectedPlan.name}
                    </p>
                    <p className="text-sm text-emerald-600">
                      R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}

                {/* Cupom de Desconto */}
                <div className="mb-4 pb-4 border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎟️ Cupom de Desconto
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite o cupom"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-red-600 mt-1">❌ {couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-1">✅ Cupom "{appliedCoupon.code}" aplicado!</p>
                  )}
                </div>

                {/* Frete */}
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2 text-green-600">✓</span>
                    <span>
                      {selectedPlan?.freeShipping !== false ? 'Frete Grátis' : `Frete: R$ ${(selectedPlan?.shippingPrice || 0).toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({appliedCoupon.code}):</span>
                      <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  {selectedPlan?.freeShipping === false && selectedPlan?.shippingPrice > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Frete:</span>
                      <span>R$ {selectedPlan.shippingPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold border-t pt-3">
                    <span>Total:</span>
                    <span className="text-emerald-600">R$ {totalValue.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="md:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow-md p-6 order-3">
                  <h2 className="text-xl font-bold mb-4">Forma de Pagamento</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {product.checkoutConfig?.paymentMethods?.pix && (
                      <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedPayment === 'pix' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="pix"
                          checked={selectedPayment === 'pix'}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-5 h-5 text-emerald-600"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-gray-900">PIX</p>
                        </div>
                      </label>
                    )}

                    {product.checkoutConfig?.paymentMethods?.boleto && (
                      <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedPayment === 'boleto' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="boleto"
                          checked={selectedPayment === 'boleto'}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-5 h-5 text-emerald-600"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-gray-900">Boleto Bancário</p>
                        </div>
                      </label>
                    )}

                    {product.checkoutConfig?.paymentMethods?.creditCard && (
                      <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedPayment === 'creditCard' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="creditCard"
                          checked={selectedPayment === 'creditCard'}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-5 h-5 text-emerald-600"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                        </div>
                      </label>
                    )}

                    {product.checkoutConfig?.paymentMethods?.receiveAndPay && (
                      <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedPayment === 'afterPay' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="afterPay"
                          checked={selectedPayment === 'afterPay'}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-5 h-5 text-emerald-600"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-gray-900">Receba e Pague</p>
                        </div>
                      </label>
                    )}
                  </div>

                </div>

                {/* Credit Card Form - Aparece quando cartão é selecionado */}
                {selectedPayment === 'creditCard' && (
                  <div className="bg-white rounded-lg shadow-md p-6 order-4">
                    <h2 className="text-xl font-bold mb-4">Dados do Cartão de Crédito</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número do Cartão *
                        </label>
                        <input
                          type="text"
                          value={creditCardData.cardNumber}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
                            value = value.substring(0, 19)
                            setCreditCardData({ ...creditCardData, cardNumber: value })
                            // Limpar erro ao digitar
                            if (cardFieldErrors.cardNumber) {
                              setCardFieldErrors({ ...cardFieldErrors, cardNumber: false })
                            }
                          }}
                          placeholder="0000 0000 0000 0000"
                          maxLength="19"
                          className={getCardInputClassName('cardNumber')}
                          ref={(el) => (formFieldsRef.current.cardNumber = el)}
                        />
                        {cardFieldErrors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Número do cartão inválido (16 dígitos)</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome no Cartão *
                        </label>
                        <input
                          type="text"
                          value={creditCardData.cardName}
                          onChange={(e) => {
                            setCreditCardData({ ...creditCardData, cardName: e.target.value.toUpperCase() })
                            // Limpar erro ao digitar
                            if (cardFieldErrors.cardName) {
                              setCardFieldErrors({ ...cardFieldErrors, cardName: false })
                            }
                          }}
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          className={getCardInputClassName('cardName')}
                        />
                        {cardFieldErrors.cardName && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Nome do titular é obrigatório</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Validade *
                          </label>
                          <input
                            type="text"
                            value={creditCardData.expiryDate}
                            onChange={(e) => {
                              // Permitir edição livre
                              setCreditCardData({ ...creditCardData, expiryDate: e.target.value })
                              // Limpar erro ao digitar
                              if (cardFieldErrors.expiryDate) {
                                setCardFieldErrors({ ...cardFieldErrors, expiryDate: false })
                              }
                            }}
                            onBlur={(e) => {
                              // Formatar ao sair do campo (onBlur)
                              let value = e.target.value.replace(/\D/g, '')
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + '/' + value.substring(2, 4)
                              }
                              value = value.substring(0, 5)
                              setCreditCardData({ ...creditCardData, expiryDate: value })
                            }}
                            placeholder="MM/AA"
                            maxLength="5"
                            className={getCardInputClassName('expiryDate')}
                          />
                          {cardFieldErrors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">⚠️ Data de validade inválida (MM/AA)</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={creditCardData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').substring(0, 4)
                              setCreditCardData({ ...creditCardData, cvv: value })
                              // Limpar erro ao digitar
                              if (cardFieldErrors.cvv) {
                                setCardFieldErrors({ ...cardFieldErrors, cvv: false })
                              }
                            }}
                            placeholder="123"
                            maxLength="4"
                            className={getCardInputClassName('cvv')}
                          />
                          {cardFieldErrors.cvv && (
                            <p className="mt-1 text-sm text-red-600">⚠️ CVV inválido (3 ou 4 dígitos)</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parcelas
                        </label>
                        <select
                          value={creditCardData.installments}
                          onChange={(e) => setCreditCardData({ ...creditCardData, installments: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        >
                          {(() => {
                            const maxInstallments = selectedPlan?.maxInstallments || product.installments || 12
                            const maxNoInterest = selectedPlan?.maxInstallmentsNoInterest || 1
                            const options = []

                            for (let i = 1; i <= maxInstallments; i++) {
                              const installmentValue = totalValue / i
                              const isNoInterest = i <= maxNoInterest
                              const label = isNoInterest
                                ? `${i}x de R$ ${installmentValue.toFixed(2).replace('.', ',')} sem juros`
                                : `${i}x de R$ ${installmentValue.toFixed(2).replace('.', ',')}`

                              options.push(
                                <option key={i} value={i}>{label}</option>
                              )
                            }

                            return options
                          })()}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Data */}
                <div className="bg-white rounded-lg shadow-md p-6 order-1">
                  <h2 className="text-xl font-bold mb-4">Dados do Cliente</h2>

                  {/* Global Error Message */}
                  {validationError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">{validationError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={getInputClassName('name')}
                        ref={(el) => (formFieldsRef.current.name = el)}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email {!noEmail && '*'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={noEmail}
                        className={getInputClassName('email')}
                        ref={(el) => (formFieldsRef.current.email = el)}
                      />
                      {fieldErrors.email && !noEmail && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                      )}

                      {/* Checkbox "Não possuo e-mail" */}
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noEmail}
                          onChange={(e) => {
                            setNoEmail(e.target.checked)
                            if (e.target.checked) {
                              setFormData({ ...formData, email: '' })
                              // Limpar erro de email se existir
                              if (fieldErrors.email) {
                                setFieldErrors({ ...fieldErrors, email: false })
                              }
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">Não possuo e-mail</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CPF *
                        </label>
                        <input
                          type="text"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleChange}
                          placeholder="000.000.000-00"
                          maxLength="14"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:outline-none transition ${
                            fieldErrors.cpf || cpfValidation.blocked
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500'
                          }`}
                          ref={(el) => (formFieldsRef.current.cpf = el)}
                        />
                        {fieldErrors.cpf && !cpfValidation.blocked && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                        )}
                        {isValidatingCPF && (
                          <p className="text-sm text-gray-600 mt-1">🔄 Verificando CPF...</p>
                        )}
                        {cpfValidation.blocked && selectedPayment === 'afterPay' && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-semibold">⚠️ CPF bloqueado</p>
                            {cpfValidation.status === 'scheduled' && (
                              <p className="text-xs text-red-700 mt-1">
                                Aguardando entrega de pedido anterior. PIX, Boleto e Cartão continuam disponíveis.
                              </p>
                            )}
                            {cpfValidation.status === 'pending_payment' && (
                              <p className="text-xs text-red-700 mt-1">
                                Aguardando pagamento de pedido anterior. PIX, Boleto e Cartão continuam disponíveis.
                              </p>
                            )}
                            {cpfValidation.status === 'overdue' && (
                              <p className="text-xs text-red-700 mt-1">
                                Pagamento atrasado. PIX, Boleto e Cartão continuam disponíveis.
                              </p>
                            )}
                            {cpfValidation.status === 'frustrated' && (
                              <p className="text-xs text-red-700 mt-1">
                                Pedido frustrado. PIX, Boleto e Cartão continuam disponíveis.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={formatPhoneOnBlur}
                          placeholder="Ex: 51987654321"
                          className={getInputClassName('phone')}
                          ref={(el) => (formFieldsRef.current.phone = el)}
                        />
                        {fieldErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                        )}
                        {!fieldErrors.phone && (
                          <p className="text-xs text-gray-500 mt-1">
                            Digite apenas números. Ao sair do campo, será formatado automaticamente.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-md p-6 order-2">
                  <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="00000-000"
                          maxLength="9"
                          className={getInputClassName('zipCode')}
                        />
                        {loadingCep && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                          </div>
                        )}
                      </div>
                      {fieldErrors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                      )}
                      {!fieldErrors.zipCode && (
                        <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher automaticamente</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço (Rua/Avenida) *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Rua, Av, etc"
                        className={getInputClassName('address')}
                      />
                      {fieldErrors.address && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          name="number"
                          value={formData.number}
                          onChange={handleChange}
                          placeholder="123"
                          className={getInputClassName('number')}
                        />
                        {fieldErrors.number && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          name="complement"
                          value={formData.complement}
                          onChange={handleChange}
                          placeholder="Apto, bloco, etc (opcional)"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        placeholder="Bairro"
                        className={getInputClassName('neighborhood')}
                      />
                      {fieldErrors.neighborhood && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={getInputClassName('city')}
                        />
                        {fieldErrors.city && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={getInputClassName('state')}
                        >
                          <option value="">Selecione</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                        {fieldErrors.state && (
                          <p className="mt-1 text-sm text-red-600">⚠️ Campo obrigatório</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg shadow-lg order-5"
                >
                  {submitting ? 'Processando...' : 'Finalizar Pedido'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Fecha container principal */}
      </div>
      {/* Fecha div relative */}

      {/* Modal de Validação Customizado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Ícone de Alerta */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Mensagem */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Atenção</h3>
              <p className="text-gray-600 text-center mb-6">{modalMessage}</p>

              {/* Botão OK */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-bold text-lg"
              >
                OK
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
    </div>
  )
}

export default Checkout
