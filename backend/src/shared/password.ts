import bcrypt from 'bcryptjs';

/**
 * Custo 12 ~ 250ms por hash em hardware atual.
 * Lento de proposito: e isso que torna ataque de forca bruta caro.
 */
const COST = 12;

/** Hash de referencia usado so para gastar tempo quando o usuario nao existe. */
const DUMMY_HASH = bcrypt.hashSync('senha-que-nao-existe', COST);

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Compara contra um hash falso para que "e-mail inexistente" e
 * "senha errada" levem o mesmo tempo. Sem isso, o tempo de resposta
 * revela quais e-mails estao cadastrados (timing attack / user enumeration).
 */
export async function burnTime(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_HASH);
}
