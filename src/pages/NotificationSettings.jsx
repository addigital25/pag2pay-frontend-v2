import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'

function NotificationSettings() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [notificationPrefs, setNotificationPrefs] = useState({
    // Vendas Pagas - Marcadas por padrão
    pixSale: true,
    boletoSale: true,
    cardSale: true,

    // Outras - Desmarcadas por padrão
    shipping: false,
    refund: false
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    // TODO: Salvar na API
    console.log('Salvando preferências:', notificationPrefs)

    // Salvar no localStorage temporariamente
    localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs))

    showAlert({
      title: 'Sucesso!',
      message: 'Preferências salvas com sucesso!',
      type: 'success'
    })
    setHasChanges(false)
  }

  const handleCancel = () => {
    window.location.reload()
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Configurações de Notificações
          </h1>
          <p className="text-gray-600">
            Escolha quais notificações você deseja receber no sistema
          </p>
        </div>

        {/* Seção: Notificações de Vendas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200 bg-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Notificações de Vendas</h2>
                <p className="text-sm text-gray-600">Receba alertas sobre vendas pagas</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Pix */}
            <NotificationOption
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              title="Nova venda Pix"
              description="Receba notificação quando uma venda for aprovada via Pix"
              checked={notificationPrefs.pixSale}
              onChange={() => handleToggle('pixSale')}
            />

            {/* Boleto */}
            <NotificationOption
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              title="Nova venda Boleto"
              description="Receba notificação quando um boleto for pago"
              checked={notificationPrefs.boletoSale}
              onChange={() => handleToggle('boletoSale')}
            />

            {/* Cartão */}
            <NotificationOption
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              title="Venda de Cartão Aprovada"
              description="Receba notificação quando uma venda de cartão for aprovada"
              checked={notificationPrefs.cardSale}
              onChange={() => handleToggle('cardSale')}
            />
          </div>
        </div>

        {/* Seção: Outras Notificações */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Outras Notificações</h2>
                <p className="text-sm text-gray-600">Alertas adicionais do sistema</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Transporte */}
            <NotificationOption
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              }
              iconBg="bg-green-100"
              iconColor="text-green-600"
              title="Atualizações de Transporte"
              description="Receba notificação sobre status de rastreamento de pedidos"
              checked={notificationPrefs.shipping}
              onChange={() => handleToggle('shipping')}
            />

            {/* Reembolso */}
            <NotificationOption
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
              }
              iconBg="bg-red-100"
              iconColor="text-red-600"
              title="Solicitações de Reembolso"
              description="Receba notificação quando houver pedidos de reembolso"
              checked={notificationPrefs.refund}
              onChange={() => handleToggle('refund')}
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            Salvar Preferências
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </AdminLayout>
  )
}

// Componente de Opção de Notificação
function NotificationOption({ icon, iconBg, iconColor, title, description, checked, onChange }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
      {/* Ícone */}
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>

      {/* Texto */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          checked ? 'bg-emerald-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default NotificationSettings
