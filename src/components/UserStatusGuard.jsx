import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Componente que controla o acesso do usuário baseado no status de aprovação
 *
 * Status possíveis:
 * - 'not_submitted': Ainda não enviou documentos (permite navegação com aviso)
 * - 'pending': Documentos em análise (permite navegação mas não pode finalizar vendas)
 * - 'approved': Aprovado (acesso total)
 * - 'rejected': Rejeitado (tela bloqueada completamente)
 * - 'awaiting_adjustment': Aguardando ajustes (permite navegação para reenviar documentos)
 */
export default function UserStatusGuard({ children }) {
  const { user } = useAuth()
  const [userStatus, setUserStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.id) {
      loadUserStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadUserStatus = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/verification`)
      const data = await response.json()
      setUserStatus(data.status || 'not_submitted')
    } catch (error) {
      console.error('Erro ao carregar status do usuário:', error)
      setUserStatus('not_submitted')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  // REJEITADO - Tela de bloqueio total (não pode sair)
  if (userStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Ícone de bloqueio */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              🚫 Usuário Bloqueado
            </h1>

            {/* Mensagem */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
              <p className="text-lg text-red-800 font-semibold mb-3">
                Sua conta foi rejeitada e está bloqueada no momento.
              </p>
              <p className="text-red-700">
                Você não pode acessar a plataforma. Entre em contato com o suporte para mais informações sobre o motivo do bloqueio e possíveis soluções.
              </p>
            </div>

            {/* Informações de contato */}
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-slate-800 mb-3">📞 Entre em contato:</h3>
              <div className="space-y-2 text-slate-700">
                <p>
                  <strong>Email:</strong> suporte@afterpay.com.br
                </p>
                <p>
                  <strong>WhatsApp:</strong> (11) 99999-9999
                </p>
                <p>
                  <strong>Horário:</strong> Segunda a Sexta, 9h às 18h
                </p>
              </div>
            </div>

            {/* Animação de alerta */}
            <div className="flex items-center justify-center gap-2 text-red-600 animate-pulse">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold">Acesso Negado</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // APROVADO ou outros status - Renderiza normalmente
  return <>{children}</>
}
