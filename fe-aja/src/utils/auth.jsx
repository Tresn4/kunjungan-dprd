export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  return token !== null
}

export const login = (token) => {
  localStorage.setItem('authToken', token)
}

export const logout = () => {
  localStorage.removeItem('authToken')
}

export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}