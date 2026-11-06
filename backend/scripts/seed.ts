import { migrate } from '../src/db/index.js';
import { hashPassword } from '../src/shared/password.js';
import { userRepository } from '../src/modules/users/user.repository.js';
import type { CreateUserInput } from '../src/modules/users/user.repository.js';

/**
 * Usuarios de desenvolvimento.
 * As credenciais do gestor sao as mesmas que estavam chumbadas em
 * TrocaPlantaoExpo/constants/auth.ts, para o app continuar funcionando.
 */
const USUARIOS: Array<Omit<CreateUserInput, 'senhaHash'> & { senha: string }> = [
  {
    nome: 'Gestor TrocaPlantao',
    matricula: 'MAT-00001',
    email: 'gestor@trocaplantao.com',
    senha: 'gestor123',
    role: 'gestor',
    nivel: 'Lider',
    equipe: 'Suporte TI',
  },
  {
    nome: 'Atendente Teste',
    matricula: 'MAT-99999',
    email: 'atendente@trocaplantao.com',
    senha: 'atendente123',
    role: 'atendente',
    nivel: 'N2',
    equipe: 'Suporte TI',
  },
];

migrate();

for (const { senha, ...dados } of USUARIOS) {
  if (userRepository.findByEmail(dados.email)) {
    console.log(`- ja existe: ${dados.email}`);
    continue;
  }
  userRepository.create({ ...dados, senhaHash: await hashPassword(senha) });
  console.log(`+ criado: ${dados.email} (senha: ${senha}) [${dados.role}]`);
}

console.log('\nSeed concluido.');
