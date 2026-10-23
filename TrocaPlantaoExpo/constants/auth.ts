// Credencial fixa de acesso do gestor (mock até existir backend)
export const GESTOR_CREDENCIAIS = {
  email: 'gestor@trocaplantao.com',
  senha: 'gestor123',
};

export function isGestor(email: string, senha: string) {
  return (
    email.trim().toLowerCase() === GESTOR_CREDENCIAIS.email &&
    senha === GESTOR_CREDENCIAIS.senha
  );
}
