import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook para verificar o status do usuário e suas permissões
 *
 * Retorna:
 * - status: Status atual do usuário
 * - canCheckout: Se pode finalizar vendas (apenas se aprovado)
 * - canNavigate: Se pode navegar na plataforma
 * - isBlocked: Se está completamente bloqueado (rejeitado)
 * - loading: Se está carregando
 */
export function useUserStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.id) {
      loadStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadStatus = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/verification`)
      const data = await response.json()
      setStatus(data.status || 'not_submitted')
    } catch (error) {
      console.error('Erro ao carregar status:', error)
      setStatus('not_submitted')
    } finally {
      setLoading(false)
    }
  }

  const canCheckout = status === 'approved'
  const canNavigate = status !== 'rejected'
  const isBlocked = status === 'rejected'
  const isPending = status === 'pending' || status === 'not_submitted' || status === 'awaiting_adjustment'

  return {
    status,
    canCheckout,
    canNavigate,
    isBlocked,
    isPending,
    loading,
    reload: loadStatus
  }
}
