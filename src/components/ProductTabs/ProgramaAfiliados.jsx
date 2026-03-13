import { useState, useEffect, useRef } from 'react'
import AlertModal from '../AlertModal'

export default function ProgramaAfiliados({ product, setProduct }) {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false })
  }

  // Inicializar affiliateConfig do produto ou com valores padrão
  const getInitialConfig = () => {
    if (product?.affiliateConfig) {
      return {
        ...product.affiliateConfig,
        affiliatesAccessAbandonment: product.affiliateConfig.affiliatesAccessAbandonment !== false
      }
    }
    return {
      participateInProgram: false,
      visibleInStore: false,
      autoApproval: false,
      affiliatesAccessAbandonment: true
    }
  }

  const [affiliateConfig, setAffiliateConfig] = useState(getInitialConfig)

  // Guardar o último ID sincronizado
  const lastSyncedId = useRef(null)
  const isInitialized = useRef(false)

  // Sincronizar APENAS quando o ID do produto mudar (trocar de produto)
  useEffect(() => {
    const currentProductId = product?.id

    // Se não tem produto, não faz nada
    if (!currentProductId) return

    // Se já inicializou e é o mesmo produto, não sincroniza
    if (isInitialized.current && lastSyncedId.current === currentProductId) {
      console.log('⏭️ Mesmo produto (', currentProductId, ') - MANTENDO estado local');
      return
    }

    // Produto diferente ou primeira vez - sincroniza
    console.log('🔄 ProgramaAfiliados - Sincronizando com produto:', currentProductId);
    console.log('   Último ID sincronizado:', lastSyncedId.current);
    console.log('📦 affiliateConfig do produto:', product.affiliateConfig);

    const newConfig = getInitialConfig()
    setAffiliateConfig(newConfig)

    // Se produto não tinha affiliateConfig, criar
    if (!product.affiliateConfig && setProduct) {
      console.log('⚠️ Criando affiliateConfig no produto...');
      setProduct({ ...product, affiliateConfig: newConfig })
    }

    lastSyncedId.current = currentProductId
    isInitialized.current = true
    console.log('✅ Sincronização completa para produto:', currentProductId);
  }, [product?.id])

  const handleToggle = (field) => {
    console.log(`🔄 Toggle "${field}":`, {
      valorAnterior: affiliateConfig[field],
      valorNovo: !affiliateConfig[field]
    });

    const updated = {
      ...affiliateConfig,
      [field]: !affiliateConfig[field]
    }

    console.log('📦 affiliateConfig atualizado:', updated);

    setAffiliateConfig(updated)
    if (setProduct) {
      setProduct({ ...product, affiliateConfig: updated })
      console.log('✅ Produto atualizado no estado global');
    } else {
      console.warn('⚠️ setProduct não está disponível!');
    }
  }

  const handleChange = (field, value) => {
    const updated = {
      ...affiliateConfig,
      [field]: value
    }
    setAffiliateConfig(updated)
    if (setProduct) {
      setProduct({ ...product, affiliateConfig: updated })
    }
  }

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Programa de Afiliados</h2>
        <p className="text-sm text-gray-600">Configure as opções do programa de afiliados para este produto</p>
      </div>

      {/* Configurações Gerais */}
      <div className="space-y-4">
        {/* Participar do programa de afiliados */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Participar do programa de afiliados?</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={affiliateConfig.participateInProgram}
              onChange={() => handleToggle('participateInProgram')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Visível na vitrine */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Visível na vitrine?</p>
            <p className="text-xs text-gray-500 mt-1">Quando marcado, o produto aparece na vitrine de afiliados. Quando desmarcado, o produto continua funcionando normalmente mas não aparece na vitrine.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={affiliateConfig.visibleInStore}
              onChange={() => handleToggle('visibleInStore')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Aprovação automática dos afiliados */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Aprovação automática dos afiliados</p>
            <p className="text-xs text-gray-500 mt-1">Quando marcado, as solicitações de afiliação são aceitas automaticamente. Quando desmarcado, você precisa aprovar manualmente cada afiliado.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={affiliateConfig.autoApproval}
              onChange={() => handleToggle('autoApproval')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Afiliados tem acesso aos abandonos */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Afiliados tem acesso aos abandonos</p>
            <p className="text-xs text-gray-500 mt-1">Quando marcado, os afiliados podem visualizar carrinhos abandonados. Quando desmarcado, apenas você tem acesso aos abandonos. (Marcado por padrão)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={affiliateConfig.affiliatesAccessAbandonment}
              onChange={() => handleToggle('affiliatesAccessAbandonment')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
