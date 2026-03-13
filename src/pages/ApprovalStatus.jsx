import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

// Dados mock do usuário logado (em produção viria da API/contexto)
const mockCurrentUser = {
  id: 2,
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 98765-4321',
  accountType: 'pf',
  cpf: '123.456.789-00',
  status: 'pending',

  kyc: {
    emailCorporativo: 'joao@empresa.com',
    telefoneComercial: '(11) 98765-4321',
    descricaoProdutos: 'Cursos online de programação',
    status: 'pending'
  },

  documentos: {
    selfie: true,
    documentoFrente: true,
    documentoVerso: true,
    statusSelfie: 'pending',
    statusDocumento: 'pending'
  },

  dadosBancarios: {
    banco: '001 - Banco do Brasil',
    tipoConta: 'Corrente',
    agencia: '5678',
    conta: '98765-4',
    status: 'pending'
  },

  notifications: []
}

export default function ApprovalStatus() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento dos dados do usuário
    setTimeout(() => {
      setUser(mockCurrentUser)
      setLoading(false)
    }, 500)
  }, [])

  const getSectionStatus = (status) => {
    const statusMap = {
      approved: {
        icon: '✅',
        text: 'Aprovado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      pending: {
        icon: '⏳',
        text: 'Em Análise',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      rejected: {
        icon: '❌',
        text: 'Rejeitado',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      pending_changes: {
        icon: '📝',
        text: 'Alterações Necessárias',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando status...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const kycStatus = getSectionStatus(user?.kyc?.status)
  const docsStatus = getSectionStatus(
    user?.documentos?.statusSelfie === 'approved' && user?.documentos?.statusDocumento === 'approved'
      ? 'approved'
      : user?.documentos?.statusSelfie || 'pending'
  )
  const bankStatus = getSectionStatus(user?.dadosBancarios?.status)

  const allApproved =
    user?.kyc?.status === 'approved' &&
    user?.documentos?.statusSelfie === 'approved' &&
    user?.documentos?.statusDocumento === 'approved' &&
    user?.dadosBancarios?.status === 'approved'

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Banner de Status Geral */}
          {!allApproved && (
            <div className="bg-red-600 text-white rounded-lg px-6 py-4 mb-6 shadow-lg">
              <div className="flex items-center gap-4">
                <svg className="w-10 h-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-lg">⚠️ Sua conta ainda não foi completamente aprovada</p>
                  <p className="text-sm mt-1 opacity-90">
                    Complete todas as etapas abaixo e aguarde a análise do nosso time. Você poderá começar a vender assim que tudo for aprovado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {allApproved && (
            <div className="bg-green-600 text-white rounded-lg px-6 py-4 mb-6 shadow-lg">
              <div className="flex items-center gap-4">
                <svg className="w-10 h-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold text-lg">✅ Parabéns! Sua conta foi aprovada</p>
                  <p className="text-sm mt-1 opacity-90">
                    Você já pode começar a vender na plataforma. Crie seus produtos e comece a ganhar dinheiro!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Status de Aprovação</h1>
            <p className="text-slate-600">
              Acompanhe o andamento da análise da sua conta
            </p>
          </div>

          {/* Progresso Geral */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Progresso Geral</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-slate-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${((user?.kyc?.status === 'approved' ? 33.33 : 0) +
                             (user?.documentos?.statusSelfie === 'approved' && user?.documentos?.statusDocumento === 'approved' ? 33.33 : 0) +
                             (user?.dadosBancarios?.status === 'approved' ? 33.34 : 0))}%`
                  }}
                ></div>
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {Math.round(((user?.kyc?.status === 'approved' ? 1 : 0) +
                            (user?.documentos?.statusSelfie === 'approved' && user?.documentos?.statusDocumento === 'approved' ? 1 : 0) +
                            (user?.dadosBancarios?.status === 'approved' ? 1 : 0)) / 3 * 100)}%
              </span>
            </div>

            <p className="text-sm text-slate-600">
              {allApproved
                ? '🎉 Todas as etapas foram aprovadas!'
                : `${(user?.kyc?.status === 'approved' ? 1 : 0) + (user?.documentos?.statusSelfie === 'approved' && user?.documentos?.statusDocumento === 'approved' ? 1 : 0) + (user?.dadosBancarios?.status === 'approved' ? 1 : 0)} de 3 etapas concluídas`}
            </p>
          </div>

          {/* Seções de Aprovação */}
          <div className="space-y-4">
            {/* KYC */}
            <div className={`bg-white rounded-lg shadow-md border-l-4 ${kycStatus.borderColor}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${kycStatus.bgColor} rounded-full flex items-center justify-center text-3xl`}>
                      {kycStatus.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Cadastro (KYC)</h3>
                      <p className={`text-sm font-medium ${kycStatus.color}`}>{kycStatus.text}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${kycStatus.bgColor} ${kycStatus.color}`}>
                    {kycStatus.text}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Informações verificadas:</strong> Email corporativo, telefone comercial, descrição dos produtos
                  </p>
                  {user?.kyc?.status === 'pending' && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded mt-2">
                      ⏳ Aguardando análise do administrador
                    </p>
                  )}
                  {user?.kyc?.status === 'approved' && (
                    <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded mt-2">
                      ✅ Seu cadastro foi aprovado!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className={`bg-white rounded-lg shadow-md border-l-4 ${docsStatus.borderColor}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${docsStatus.bgColor} rounded-full flex items-center justify-center text-3xl`}>
                      {docsStatus.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
                      <p className={`text-sm font-medium ${docsStatus.color}`}>{docsStatus.text}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${docsStatus.bgColor} ${docsStatus.color}`}>
                    {docsStatus.text}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Documentos enviados:</strong> Selfie com documento, documento de identificação (frente e verso)
                  </p>
                  {user?.documentos?.statusSelfie === 'pending' && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded mt-2">
                      ⏳ Aguardando análise dos documentos enviados
                    </p>
                  )}
                  {user?.documentos?.statusSelfie === 'approved' && user?.documentos?.statusDocumento === 'approved' && (
                    <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded mt-2">
                      ✅ Seus documentos foram aprovados!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Conta Bancária */}
            <div className={`bg-white rounded-lg shadow-md border-l-4 ${bankStatus.borderColor}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${bankStatus.bgColor} rounded-full flex items-center justify-center text-3xl`}>
                      {bankStatus.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Conta Bancária</h3>
                      <p className={`text-sm font-medium ${bankStatus.color}`}>{bankStatus.text}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${bankStatus.bgColor} ${bankStatus.color}`}>
                    {bankStatus.text}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Dados bancários:</strong> {user?.dadosBancarios?.banco} - Ag: {user?.dadosBancarios?.agencia} - Conta: {user?.dadosBancarios?.conta}
                  </p>
                  {user?.dadosBancarios?.status === 'pending' && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded mt-2">
                      ⏳ Aguardando validação dos dados bancários
                    </p>
                  )}
                  {user?.dadosBancarios?.status === 'approved' && (
                    <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded mt-2">
                      ✅ Sua conta bancária foi validada!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notificações */}
          {user?.notifications && user.notifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">📬 Mensagens do Administrador</h2>
              <div className="space-y-3">
                {user.notifications.map((notification) => (
                  <div key={notification.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="font-medium text-blue-900 mb-1">
                      {notification.section}
                    </p>
                    <p className="text-sm text-blue-700">{notification.message}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {new Date(notification.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações de Suporte */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">💬 Precisa de ajuda?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Se você tiver dúvidas sobre o processo de aprovação ou precisar atualizar alguma informação, entre em contato conosco:
            </p>
            <div className="flex gap-4">
              <a href="mailto:suporte@pag2pay.com" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                📧 suporte@pag2pay.com
              </a>
              <span className="text-blue-400">|</span>
              <a href="tel:+551140028922" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                📞 (11) 4002-8922
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
