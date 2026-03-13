import { useState, useEffect } from 'react'

export default function AfterPayConfig({ product, setProduct }) {
  const [isAfterPayEnabled, setIsAfterPayEnabled] = useState(false)
  const [isReceiveAndPayEnabled, setIsReceiveAndPayEnabled] = useState(false)

  // Sincronizar com o produto ao carregar
  useEffect(() => {
    if (product) {
      setIsAfterPayEnabled(product.afterPayEnabled || false)
      // Verificar se Receba e Pague está habilitado no checkout
      const checkoutHasReceiveAndPay = product.checkoutConfig?.paymentMethods?.receiveAndPay || false
      setIsReceiveAndPayEnabled(checkoutHasReceiveAndPay)
    }
  }, [product])

  const handleAfterPayToggle = (enabled) => {
    setIsAfterPayEnabled(enabled)

    // Atualizar produto
    const updatedProduct = {
      ...product,
      afterPayEnabled: enabled
    }

    // Garantir que checkoutConfig existe
    if (!updatedProduct.checkoutConfig) {
      updatedProduct.checkoutConfig = {
        paymentMethods: {}
      }
    }
    if (!updatedProduct.checkoutConfig.paymentMethods) {
      updatedProduct.checkoutConfig.paymentMethods = {}
    }

    // Se HABILITAR AfterPay, marcar automaticamente "Receba e pague" no checkout
    if (enabled) {
      updatedProduct.checkoutConfig = {
        ...updatedProduct.checkoutConfig,
        paymentMethods: {
          ...updatedProduct.checkoutConfig.paymentMethods,
          receiveAndPay: true
        }
      }
      setIsReceiveAndPayEnabled(true)
    } else {
      // Se DESABILITAR AfterPay, desmarcar e esconder "Receba e pague" no checkout
      updatedProduct.checkoutConfig = {
        ...updatedProduct.checkoutConfig,
        paymentMethods: {
          ...updatedProduct.checkoutConfig.paymentMethods,
          receiveAndPay: false
        }
      }
      setIsReceiveAndPayEnabled(false)
    }

    setProduct(updatedProduct)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração AfterPay</h2>
        <p className="text-sm text-gray-600">Configure o pagamento após recebimento do produto</p>
      </div>

      {/* Toggle Habilitar AfterPay */}
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">Habilitar AfterPay (Receba e Pague)</p>
          <p className="text-xs text-gray-500">Permite que o cliente pague apenas após receber o produto</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isAfterPayEnabled}
            onChange={(e) => handleAfterPayToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
        </label>
      </div>

      {/* Informação sobre AfterPay */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">O que é AfterPay?</h4>
            <p className="text-sm text-blue-800">
              AfterPay (Receba e Pague) permite que o cliente receba o produto antes de efetuar o pagamento.
              O pagamento é liberado apenas após a confirmação de entrega do produto.
            </p>
          </div>
        </div>
      </div>

      {/* Aviso - AfterPay habilitado mas não marcado no checkout */}
      {isAfterPayEnabled && !isReceiveAndPayEnabled && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold text-orange-900 mb-1">⚠️ Ação Necessária</h4>
              <p className="text-sm text-orange-800 mb-2">
                AfterPay está habilitado, mas a opção <strong>"Receba e pague"</strong> não está marcada na aba <strong>Checkouts</strong>.
              </p>
              <p className="text-xs text-orange-700">
                Para que os clientes vejam a opção de AfterPay no checkout, você precisa:
              </p>
              <ol className="text-xs text-orange-700 ml-4 mt-1 list-decimal">
                <li>Ir para a aba <strong>Checkouts</strong></li>
                <li>Marcar a opção <strong>"Receba e pague"</strong> em "Formas de pagamento"</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Sucesso - Tudo configurado */}
      {isAfterPayEnabled && isReceiveAndPayEnabled && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold text-green-900 mb-1">✓ AfterPay Configurado Corretamente</h4>
              <p className="text-sm text-green-800">
                A opção "Receba e pague" está habilitada e configurada no checkout. Os clientes poderão usar esta forma de pagamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AfterPay Desabilitado */}
      {!isAfterPayEnabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div>
              <p className="text-sm text-gray-700">
                AfterPay está desabilitado. A opção "Receba e pague" não aparecerá no checkout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Como Funciona o AfterPay</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="bg-indigo-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Cliente Compra</p>
              <p className="text-xs text-gray-600">Cliente escolhe "Receba e pague" no checkout e finaliza o pedido</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-indigo-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Produto Enviado</p>
              <p className="text-xs text-gray-600">Você envia o produto e adiciona o código de rastreio</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-indigo-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Cliente Recebe</p>
              <p className="text-xs text-gray-600">Cliente confirma o recebimento do produto</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              4
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Pagamento Liberado</p>
              <p className="text-xs text-gray-600">O pagamento é processado e você recebe o valor da venda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
