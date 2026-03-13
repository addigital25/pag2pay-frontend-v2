// API Base URL - pode ser configurado via variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pag2pay-backend01-production.up.railway.app/api'

// Helper para fazer requisições autenticadas
const fetchWithAuth = async (url, options = {}) => {
  // Detectar se é Platform Admin ou User comum
  const isPlatform = window.location.pathname.startsWith('/platform')
  const tokenKey = isPlatform ? 'platform_token' : 'token'
  const token = localStorage.getItem(tokenKey)

  console.log('[API DEBUG] URL:', url)
  console.log('[API DEBUG] isPlatform:', isPlatform)
  console.log('[API DEBUG] tokenKey:', tokenKey)
  console.log('[API DEBUG] token:', token ? `${token.substring(0, 20)}...` : 'null')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fullUrl = `${API_BASE_URL}${url}`
  console.log('[API DEBUG] Full URL:', fullUrl)
  console.log('[API DEBUG] Headers:', headers)

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  console.log('[API DEBUG] Response status:', response.status)
  console.log('[API DEBUG] Response ok:', response.ok)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }))
    console.error('[API DEBUG] Error response:', error)
    console.error('[API DEBUG] Status:', response.status)
    console.error('[API DEBUG] URL:', fullUrl)
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// ===== USUÁRIOS =====

export const getUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString()
  return fetchWithAuth(`/platform/users?${queryParams}`)
}

export const getUserById = async (userId) => {
  return fetchWithAuth(`/platform/users/${userId}`)
}

export const approveUser = async (userId, data = {}) => {
  return fetchWithAuth(`/platform/users/${userId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const rejectUser = async (userId, reason) => {
  return fetchWithAuth(`/platform/users/${userId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export const updateUserStatus = async (userId, status) => {
  return fetchWithAuth(`/platform/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export const lockUserWithdrawal = async (userId, locked) => {
  return fetchWithAuth(`/platform/users/${userId}/lock-withdrawal`, {
    method: 'POST',
    body: JSON.stringify({ locked }),
  })
}

// ===== PRODUTOS =====

export const getProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString()
  return fetchWithAuth(`/platform/products?${queryParams}`)
}

export const getProductById = async (productId) => {
  return fetchWithAuth(`/platform/products/${productId}`)
}

export const approveProduct = async (productId, data = {}) => {
  return fetchWithAuth(`/platform/products/${productId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const rejectProduct = async (productId, reason) => {
  return fetchWithAuth(`/platform/products/${productId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export const updateProductStatus = async (productId, status) => {
  return fetchWithAuth(`/platform/products/${productId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export const suspendProduct = async (productId, reason) => {
  return fetchWithAuth(`/platform/products/${productId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

// ===== DOCUMENTOS =====

export const approveDocument = async (userId, documentType) => {
  return fetchWithAuth(`/platform/users/${userId}/documents/${documentType}/approve`, {
    method: 'POST',
  })
}

export const rejectDocument = async (userId, documentType, reason) => {
  return fetchWithAuth(`/platform/users/${userId}/documents/${documentType}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

// ===== DADOS BANCÁRIOS =====

export const approveBankAccount = async (userId) => {
  return fetchWithAuth(`/platform/users/${userId}/bank-account/approve`, {
    method: 'POST',
  })
}

export const rejectBankAccount = async (userId, reason) => {
  return fetchWithAuth(`/platform/users/${userId}/bank-account/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

// ===== APROVAÇÕES POR SEÇÃO =====

export const approveSectionUser = async (userId, section) => {
  return fetchWithAuth(`/platform/users/${userId}/section/approve`, {
    method: 'POST',
    body: JSON.stringify({ section }),
  })
}

export const rejectSectionUser = async (userId, section, reason) => {
  return fetchWithAuth(`/platform/users/${userId}/section/reject`, {
    method: 'POST',
    body: JSON.stringify({ section, reason }),
  })
}

export const requestUserChanges = async (userId, section, message) => {
  return fetchWithAuth(`/platform/users/${userId}/request-changes`, {
    method: 'POST',
    body: JSON.stringify({ section, message }),
  })
}

// ===== ESTATÍSTICAS =====

export const getPlatformStats = async () => {
  return fetchWithAuth('/platform/stats')
}

export default {
  getUsers,
  getUserById,
  approveUser,
  rejectUser,
  updateUserStatus,
  lockUserWithdrawal,
  getProducts,
  getProductById,
  approveProduct,
  rejectProduct,
  updateProductStatus,
  suspendProduct,
  approveDocument,
  rejectDocument,
  approveBankAccount,
  rejectBankAccount,
  approveSectionUser,
  rejectSectionUser,
  requestUserChanges,
  getPlatformStats,
}
