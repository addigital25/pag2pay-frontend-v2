import { useState, useEffect } from 'react'

export default function ApprovalStatusBanner({ user }) {
  const [showBanner, setShowBanner] = useState(false)
  const [bannerType, setBannerType] = useState('') // 'all-pending', 'kyc-pending', 'docs-pending', 'bank-pending', 'approved'
  const [bannerMessage, setBannerMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setShowBanner(false)
      return
    }

    // Verificar status de cada seção
    const kycApproved = user.kyc?.status === 'approved'
    const docsApproved = user.documentos?.statusSelfie === 'approved' && user.documentos?.statusDocumento === 'approved'
    const bankApproved = user.dadosBancarios?.status === 'approved'

    // Se todas aprovadas, não mostrar banner
    if (kycApproved && docsApproved && bankApproved && user.status === 'approved') {
      setShowBanner(false)
      setBannerType('approved')
      return
    }

    // Se nada foi aprovado
    if (!kycApproved && !docsApproved && !bankApproved) {
      setShowBanner(true)
      setBannerType('all-pending')
      setBannerMessage('⚠️ Sua conta está em análise. Aguarde a aprovação do administrador para começar a vender.')
      return
    }

    // Se alguma seção específica não foi aprovada
    const pendingSections = []
    if (!kycApproved) pendingSections.push('Cadastro (KYC)')
    if (!docsApproved) pendingSections.push('Documentos')
    if (!bankApproved) pendingSections.push('Conta Bancária')

    if (pendingSections.length > 0) {
      setShowBanner(true)
      setBannerType('partial-pending')
      setBannerMessage(
        `⚠️ Aguardando aprovação: ${pendingSections.join(', ')}. Complete todas as etapas para começar a vender.`
      )
    }
  }, [user])

  if (!showBanner) return null

  return (
    <div className={`w-full ${
      bannerType === 'all-pending' || bannerType === 'partial-pending'
        ? 'bg-red-600'
        : 'bg-yellow-500'
    } text-white px-6 py-4 shadow-lg`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-lg">{bannerMessage}</p>
              <p className="text-sm mt-1 opacity-90">
                Entre em contato com o suporte se tiver dúvidas: suporte@pag2pay.com
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
