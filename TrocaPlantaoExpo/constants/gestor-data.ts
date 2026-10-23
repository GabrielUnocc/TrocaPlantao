// Dados mockados do painel do gestor (até existir backend)

export type StatusAprovacao = 'pendente' | 'aprovada' | 'recusada';

export type StatusAtendente = 'ativo' | 'ferias' | 'afastado';

export type TrocaAprovacao = {
  id: string;
  solicitante: string;
  matriculaSolicitante: string;
  substituto: string;
  matriculaSubstituto: string;
  nivel: string;
  equipe: string;
  dataTurno: string;
  turno: string;
  dataDesejada: string;
  turnoDesejado: string;
  solicitadaEm: string;
  status: StatusAprovacao;
  decididaEm?: string;
  motivoRecusa?: string;
};

export type Atendente = {
  matricula: string;
  nome: string;
  nivel: string;
  equipe: string;
  status: StatusAtendente;
  // Data prevista de volta quando está de férias ou afastado
  retornoEm?: string;
  // Trocas já aprovadas no mês fora da lista atual
  trocasAnteriores: number;
};

export const STATUS_CONFIG: Record<StatusAprovacao, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: '#F5A623', bg: '#2A2010' },
  aprovada: { label: 'Aprovada', color: '#4CAF50', bg: '#162A18' },
  recusada: { label: 'Recusada', color: '#F44336', bg: '#2A1616' },
};

export const STATUS_ATENDENTE_CONFIG: Record<StatusAtendente, { label: string; color: string; bg: string }> = {
  ativo: { label: 'Ativo', color: '#4CAF50', bg: '#162A18' },
  ferias: { label: 'Férias', color: '#2775F6', bg: '#1E2A38' },
  afastado: { label: 'Afastado', color: '#F44336', bg: '#2A1616' },
};

export const MOTIVOS_RECUSA = [
  'Cobertura insuficiente no turno',
  'Substituto sem o nível exigido',
  'Limite mensal de trocas atingido',
  'Período de alta demanda',
];

export const LIMITE_MENSAL_PADRAO = 3;

// Gera datas relativas a hoje para os mocks não ficarem no passado
export function daqui(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return formatarData(d);
}

export function formatarData(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function parseData(data: string) {
  const [dd, mm, yyyy] = data.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export function diasAte(data: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((parseData(data).getTime() - hoje.getTime()) / 86400000);
}

export const ATENDENTES: Atendente[] = [
  { matricula: 'MAT-99999', nome: 'Atendente Teste', nivel: 'N2', equipe: 'Suporte TI', status: 'ativo', trocasAnteriores: 1 },
  { matricula: 'MAT-44444', nome: 'Mariana Alves', nivel: 'N2', equipe: 'Suporte TI', status: 'ativo', trocasAnteriores: 2 },
  { matricula: 'MAT-12345', nome: 'Rafael Lima', nivel: 'N2', equipe: 'Suporte TI', status: 'ativo', trocasAnteriores: 0 },
  { matricula: 'MAT-22222', nome: 'Juliana Torres', nivel: 'N2', equipe: 'Suporte TI', status: 'ativo', trocasAnteriores: 3 },
  { matricula: 'MAT-67890', nome: 'Ana Costa', nivel: 'N1', equipe: 'Atendimento ao Cliente', status: 'ativo', trocasAnteriores: 1 },
  { matricula: 'MAT-33333', nome: 'Fernando Souza', nivel: 'N1', equipe: 'Atendimento ao Cliente', status: 'ferias', retornoEm: daqui(12), trocasAnteriores: 0 },
  { matricula: 'MAT-77777', nome: 'Beatriz Ramos', nivel: 'N1', equipe: 'Atendimento ao Cliente', status: 'ativo', trocasAnteriores: 1 },
  { matricula: 'MAT-55555', nome: 'Paulo Saraiva', nivel: 'N3', equipe: 'Infraestrutura', status: 'ativo', trocasAnteriores: 0 },
  { matricula: 'MAT-88888', nome: 'Carla Menezes', nivel: 'N3', equipe: 'Infraestrutura', status: 'afastado', retornoEm: daqui(20), trocasAnteriores: 0 },
  { matricula: 'MAT-66666', nome: 'Diego Martins', nivel: 'N3', equipe: 'Infraestrutura', status: 'ativo', trocasAnteriores: 1 },
];

export const TROCAS_APROVACAO: TrocaAprovacao[] = [
  {
    id: '1',
    solicitante: 'Atendente Teste',
    matriculaSolicitante: 'MAT-99999',
    substituto: 'Mariana Alves',
    matriculaSubstituto: 'MAT-44444',
    nivel: 'N2',
    equipe: 'Suporte TI',
    dataTurno: daqui(1),
    turno: '07:00 – 19:00',
    dataDesejada: daqui(4),
    turnoDesejado: '07:00 – 19:00',
    solicitadaEm: daqui(-2),
    status: 'pendente',
  },
  {
    id: '2',
    solicitante: 'Rafael Lima',
    matriculaSolicitante: 'MAT-12345',
    substituto: 'Juliana Torres',
    matriculaSubstituto: 'MAT-22222',
    nivel: 'N2',
    equipe: 'Suporte TI',
    dataTurno: daqui(6),
    turno: '07:00 – 19:00',
    dataDesejada: daqui(9),
    turnoDesejado: '19:00 – 07:00',
    solicitadaEm: daqui(-1),
    status: 'pendente',
  },
  {
    id: '3',
    solicitante: 'Ana Costa',
    matriculaSolicitante: 'MAT-67890',
    substituto: 'Fernando Souza',
    matriculaSubstituto: 'MAT-33333',
    nivel: 'N1',
    equipe: 'Atendimento ao Cliente',
    dataTurno: daqui(2),
    turno: '19:00 – 07:00',
    dataDesejada: daqui(5),
    turnoDesejado: '19:00 – 07:00',
    solicitadaEm: daqui(-3),
    status: 'pendente',
  },
  {
    id: '4',
    solicitante: 'Beatriz Ramos',
    matriculaSolicitante: 'MAT-77777',
    substituto: 'Ana Costa',
    matriculaSubstituto: 'MAT-67890',
    nivel: 'N1',
    equipe: 'Atendimento ao Cliente',
    dataTurno: daqui(10),
    turno: '07:00 – 19:00',
    dataDesejada: daqui(12),
    turnoDesejado: '07:00 – 19:00',
    solicitadaEm: daqui(0),
    status: 'pendente',
  },
  {
    id: '5',
    solicitante: 'Diego Martins',
    matriculaSolicitante: 'MAT-66666',
    substituto: 'Paulo Saraiva',
    matriculaSubstituto: 'MAT-55555',
    nivel: 'N3',
    equipe: 'Infraestrutura',
    dataTurno: daqui(3),
    turno: '19:00 – 07:00',
    dataDesejada: daqui(8),
    turnoDesejado: '07:00 – 19:00',
    solicitadaEm: daqui(-1),
    status: 'pendente',
  },
  {
    id: '6',
    solicitante: 'Atendente Teste',
    matriculaSolicitante: 'MAT-99999',
    substituto: 'Paulo Saraiva',
    matriculaSubstituto: 'MAT-55555',
    nivel: 'N3',
    equipe: 'Infraestrutura',
    dataTurno: daqui(-12),
    turno: '07:00 – 19:00',
    dataDesejada: daqui(-9),
    turnoDesejado: '07:00 – 19:00',
    solicitadaEm: daqui(-16),
    status: 'aprovada',
    decididaEm: daqui(-14),
  },
  {
    id: '7',
    solicitante: 'Mariana Alves',
    matriculaSolicitante: 'MAT-44444',
    substituto: 'Rafael Lima',
    matriculaSubstituto: 'MAT-12345',
    nivel: 'N2',
    equipe: 'Suporte TI',
    dataTurno: daqui(-5),
    turno: '19:00 – 07:00',
    dataDesejada: daqui(-3),
    turnoDesejado: '19:00 – 07:00',
    solicitadaEm: daqui(-8),
    status: 'aprovada',
    decididaEm: daqui(-7),
  },
  {
    id: '8',
    solicitante: 'Beatriz Ramos',
    matriculaSolicitante: 'MAT-77777',
    substituto: 'Fernando Souza',
    matriculaSubstituto: 'MAT-33333',
    nivel: 'N1',
    equipe: 'Atendimento ao Cliente',
    dataTurno: daqui(-4),
    turno: '07:00 – 19:00',
    dataDesejada: daqui(-1),
    turnoDesejado: '07:00 – 19:00',
    solicitadaEm: daqui(-9),
    status: 'recusada',
    decididaEm: daqui(-8),
    motivoRecusa: 'Cobertura insuficiente no turno',
  },
];
