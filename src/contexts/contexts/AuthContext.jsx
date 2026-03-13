import { createContext, useContext, useState, useEffect } from 'react'
import config from '../config'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Função para determinar o prefix baseado na URL
  const getStoragePrefix = () => {
    const isPlatformAdmin = window.location.pathname.startsWith('/platform')
    return isPlatformAdmin ? 'platform_' : 'user_'
  }

  useEffect(() => {
    const loadUser = () => {
      const storagePrefix = getStoragePrefix()
      const storedUser = localStorage.getItem(`${storagePrefix}user`)
      const storedToken = localStorage.getItem(`${storagePrefix}token`)

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    // Carregar usuário na montagem
    loadUser()

    // Adicionar listener para mudanças de URL (popstate)
    window.addEventListener('popstate', loadUser)

    return () => {
      window.removeEventListener('popstate', loadUser)
    }
  }, [])

  const login = async (email, password, type = 'user') => {
    try {
      // Platform Admin não usa API - login local apenas
      if (type === 'platform-admin') {
        // Este método não é usado para platform-admin
        // O login de platform-admin é feito diretamente no componente PlatformLogin
        return { success: false, error: 'Use o login específico de Platform Admin' }
      }

      // Apenas endpoint de usuário (admin login foi removido)
      const endpoint = '/api/auth/login/user'

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        const storagePrefix = getStoragePrefix()
        const userData = { ...data.user, userType: 'user' }
        setUser(userData)
        localStorage.setItem(`${storagePrefix}user`, JSON.stringify(userData))
        localStorage.setItem(`${storagePrefix}token`, data.token)
        localStorage.setItem(`${storagePrefix}userType`, 'user')
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  // Função específica para login direto (sem API) - usada por PlatformLogin
  const directLogin = (userData, token) => {
    const storagePrefix = getStoragePrefix()
    setUser(userData)
    localStorage.setItem(`${storagePrefix}user`, JSON.stringify(userData))
    localStorage.setItem(`${storagePrefix}token`, token) // Token JWT real do backend
    localStorage.setItem(`${storagePrefix}userType`, userData.userType)
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (data.success) {
        const storagePrefix = getStoragePrefix()
        setUser(data.user)
        localStorage.setItem(`${storagePrefix}user`, JSON.stringify(data.user))
        localStorage.setItem(`${storagePrefix}token`, data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta' }
    }
  }

  // Função para login com token (auto-login)
  const loginWithToken = (userData) => {
    const storagePrefix = 'user_' // Auto-login sempre como usuário normal
    const userWithType = { ...userData, userType: 'user' }
    setUser(userWithType)
    localStorage.setItem(`${storagePrefix}user`, JSON.stringify(userWithType))
    localStorage.setItem(`${storagePrefix}token`, 'auto-login-token')
    localStorage.setItem(`${storagePrefix}userType`, 'user')
  }

  const logout = () => {
    const storagePrefix = getStoragePrefix()
    setUser(null)
    localStorage.removeItem(`${storagePrefix}user`)
    localStorage.removeItem(`${storagePrefix}token`)
    localStorage.removeItem(`${storagePrefix}userType`)
  }

  const updateUser = (userData) => {
    const storagePrefix = getStoragePrefix()
    setUser(userData)
    localStorage.setItem(`${storagePrefix}user`, JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ user, login, directLogin, loginWithToken, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
