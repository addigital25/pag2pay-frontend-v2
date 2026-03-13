/**
 * Função helper para fazer requisições autenticadas
 * Adiciona automaticamente o token de autenticação do localStorage
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Determinar se é platform ou user baseado na URL atual
  const isPlatform = window.location.pathname.startsWith('/platform')
  const prefix = isPlatform ? 'platform_' : 'user_'

  // Obter token do localStorage
  const token = localStorage.getItem(`${prefix}token`)

  // Fazer requisição com token no header
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  })
}

export default authenticatedFetch
