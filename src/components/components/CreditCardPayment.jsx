import { useState } from 'react'

export default function CreditCardPayment({ orderId, totalValue, onPaymentComplete }) {
  const [processing, setProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    installments: '1'
  })
  const [errors, setErrors] = useState({})
  const [paymentError, setPaymentError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Formatação do número do cartão (XXXX XXXX XXXX XXXX)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      formattedValue = formattedValue.substring(0, 19) // Máximo 16 dígitos + 3 espaços
    }

    // Formatação da data de validade (MM/AA)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4)
      }
      formattedValue = formattedValue.substring(0, 5)
    }

    // Apenas números no CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    }

    // Nome em maiúsculas
    if (name === 'cardName') {
      formattedValue = value.toUpperCase()
    }

    setCardData({ ...cardData, [name]: formattedValue })

    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar número do cartão
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '')
    if (!cardNumberClean || cardNumberClean.length !== 16) {
      newErrors.cardNumber = 'Número do cartão inválido'
    }

    // Validar nome
    if (!cardData.cardName || cardData.cardName.length < 3) {
      newErrors.cardName = 'Nome do titular é obrigatório'
    }

    // Validar data de validade
    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Data de validade inválida'
    } else {
      const [month, year] = cardData.expiryDate.split('/')
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Mês inválido'
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Cartão expirado'
      }
    }

    // Validar CVV
    if (!cardData.cvv || (cardData.cvv.length !== 3 && cardData.cvv.length !== 4)) {
      newErrors.cvv = 'CVV inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setProcessing(true)
    setPaymentError(null)

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/payments/credit-card/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: totalValue,
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          cardName: cardData.cardName,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          installments: parseInt(cardData.installments)
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Pagamento aprovado
        onPaymentComplete(result)
      } else {
        // Pagamento recusado - mostrar erro visual
        setPaymentError(result.message || 'Pagamento recusado. Verifique os dados do cartão e tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      setPaymentError('Erro ao processar pagamento. Verifique sua conexão e tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  // Detectar bandeira do cartão
  const getCardBrand = () => {
    const number = cardData.cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'visa'
    if (number.startsWith('5')) return 'mastercard'
    if (number.startsWith('34') || number.startsWith('37')) return 'amex'
    if (number.startsWith('6011')) return 'discover'
    if (number.startsWith('3')) return 'diners'
    if (number.startsWith('60')) return 'hipercard'
    return null
  }

  const cardBrand = getCardBrand()

  // Calcular opções de parcelamento
  const maxInstallments = 12
  const installmentOptions = []
  for (let i = 1; i <= maxInstallments; i++) {
    const installmentValue = totalValue / i
    installmentOptions.push({
      value: i,
      label: i === 1
        ? `À vista - R$ ${totalValue.toFixed(2).replace('.', ',')}`
        : `${i}x de R$ ${installmentValue.toFixed(2).replace('.', ',')} sem juros`
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cartão de Crédito</h2>
        <p className="text-gray-600">Preencha os dados do seu cartão</p>
      </div>

      {/* Prévia do Cartão */}
      <div className="mb-6">
        <div className={`relative w-full h-52 rounded-xl shadow-xl transition-all duration-300 ${
          cardBrand === 'visa' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
          cardBrand === 'mastercard' ? 'bg-gradient-to-br from-red-600 to-orange-600' :
          cardBrand === 'amex' ? 'bg-gradient-to-br from-blue-500 to-green-500' :
          'bg-gradient-to-br from-gray-700 to-gray-900'
        } p-6 text-white`}>
          {/* Chip */}
          <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded mb-4"></div>

          {/* Número do cartão */}
          <div className="font-mono text-xl tracking-widest mb-4">
            {cardData.cardNumber || '•••• •••• •••• ••••'}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75 mb-1">Nome do Titular</div>
              <div className="font-semibold">
                {cardData.cardName || 'SEU NOME AQUI'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75 mb-1">Validade</div>
              <div className="font-semibold">
                {cardData.expiryDate || 'MM/AA'}
              </div>
            </div>
          </div>

          {/* Logo da bandeira */}
          {cardBrand && (
            <div className="absolute top-6 right-6 text-white font-bold text-2xl">
              {cardBrand.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Mensagem de Erro de Pagamento */}
      {paymentError && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-1">Pagamento Recusado</h3>
              <p className="text-sm text-red-700">{paymentError}</p>
            </div>
            <button
              onClick={() => setPaymentError(null)}
              className="flex-shrink-0 text-red-500 hover:text-red-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Número do Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Cartão *
          </label>
          <input
            type="text"
            name="cardNumber"
            value={cardData.cardNumber}
            onChange={handleChange}
            placeholder="0000 0000 0000 0000"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent font-mono ${
              errors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
            }`}
          />
          {errors.cardNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Nome do Titular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Titular *
          </label>
          <input
            type="text"
            name="cardName"
            value={cardData.cardName}
            onChange={handleChange}
            placeholder="COMO ESTÁ NO CARTÃO"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.cardName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
            }`}
          />
          {errors.cardName && (
            <p className="text-sm text-red-600 mt-1">{errors.cardName}</p>
          )}
        </div>

        {/* Data de Validade e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade *
            </label>
            <input
              type="text"
              name="expiryDate"
              value={cardData.expiryDate}
              onChange={handleChange}
              placeholder="MM/AA"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent font-mono ${
                errors.expiryDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {errors.expiryDate && (
              <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV *
            </label>
            <input
              type="text"
              name="cvv"
              value={cardData.cvv}
              onChange={handleChange}
              placeholder="123"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent font-mono ${
                errors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {errors.cvv && (
              <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Parcelamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parcelamento *
          </label>
          <select
            name="installments"
            value={cardData.installments}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {installmentOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Informação de Segurança */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="font-semibold text-green-800 mb-1">Pagamento Seguro</p>
              <p className="text-sm text-green-700">
                Seus dados são criptografados e protegidos. Não armazenamos informações do seu cartão.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Pagamento */}
        <button
          type="submit"
          disabled={processing}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processando Pagamento...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagar R$ {totalValue.toFixed(2).replace('.', ',')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
