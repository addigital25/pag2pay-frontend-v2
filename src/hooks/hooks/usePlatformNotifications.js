import { useState, useEffect } from 'react'

export const usePlatformNotifications = () => {
  const [notifications, setNotifications] = useState({
    pendingUsers: 0,
    pendingProducts: 0,
    pendingWithdrawals: 0
  })

  const fetchNotifications = async () => {
    try {
      let pendingUsers = 0
      let pendingProducts = 0
      let pendingWithdrawals = 0

      // Buscar usuários pendentes (silenciosamente)
      try {
        const usersResponse = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/users', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          if (Array.isArray(usersData)) {
            pendingUsers = usersData.filter(u =>
              u.status === 'aguardando_aprovacao' || u.status === 'aguardando_ajuste'
            ).length
          }
        }
      } catch (error) {
        // Silencioso
      }

      // Buscar produtos pendentes (silenciosamente)
      try {
        const productsResponse = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/products', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          // A API pode retornar um objeto com {products: [...]} ou um array diretamente
          if (Array.isArray(productsData.products)) {
            pendingProducts = productsData.products.filter(p => p.status === 'pending').length
          } else if (Array.isArray(productsData)) {
            pendingProducts = productsData.filter(p => p.status === 'pending').length
          }
        }
      } catch (error) {
        // Silencioso
      }

      // Buscar saques pendentes (silenciosamente)
      try {
        const withdrawalsResponse = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/withdrawals', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (withdrawalsResponse.ok) {
          const withdrawalsData = await withdrawalsResponse.json()
          if (Array.isArray(withdrawalsData)) {
            pendingWithdrawals = withdrawalsData.filter(w => w.status === 'pending').length
          }
        }
      } catch (error) {
        // Silencioso
      }

      setNotifications({
        pendingUsers,
        pendingProducts,
        pendingWithdrawals
      })
    } catch (error) {
      // Silencioso
    }
  }

  useEffect(() => {
    // Buscar notificações imediatamente
    fetchNotifications()

    // Atualizar a cada 30 segundos (reduzido para evitar poluição de logs)
    const interval = setInterval(fetchNotifications, 30000)

    // Atualizar quando a aba ganhar foco
    const handleFocus = () => {
      fetchNotifications()
    }

    // Atualizar quando a aba voltar a ficar visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { notifications, refreshNotifications: fetchNotifications }
}

export default usePlatformNotifications
