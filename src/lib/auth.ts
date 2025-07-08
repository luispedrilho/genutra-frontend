// Utilitários para autenticação
export const auth = {
  // Verificar se o usuário está logado
  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Fazer logout
  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  // Fazer login
  login: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('auth:login'));
  },

  // Obter token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
}; 