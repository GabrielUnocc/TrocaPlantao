import { createContext, ReactNode, useContext, useState } from 'react';
import {
  ATENDENTES,
  Atendente,
  StatusAtendente,
  LIMITE_MENSAL_PADRAO,
  TROCAS_APROVACAO,
  TrocaAprovacao,
  diasAte,
  formatarData,
} from '@/constants/gestor-data';

type GestorContextValue = {
  trocas: TrocaAprovacao[];
  atendentes: Atendente[];
  limiteMensal: number;
  setLimiteMensal: (limite: number) => void;
  aprovar: (ids: string[]) => void;
  recusar: (id: string, motivo: string) => void;
  desfazer: (id: string) => void;
  alterarSituacao: (matricula: string, status: StatusAtendente, retornoEm?: string) => void;
};

const GestorContext = createContext<GestorContextValue | null>(null);

export function GestorProvider({ children }: { children: ReactNode }) {
  const [trocas, setTrocas] = useState(TROCAS_APROVACAO);
  const [atendentes, setAtendentes] = useState(ATENDENTES);
  const [limiteMensal, setLimiteMensal] = useState(LIMITE_MENSAL_PADRAO);
  const hoje = formatarData(new Date());

  function aprovar(ids: string[]) {
    setTrocas((atual) =>
      atual.map((t) =>
        ids.includes(t.id) ? { ...t, status: 'aprovada', decididaEm: hoje, motivoRecusa: undefined } : t
      )
    );
  }

  function recusar(id: string, motivo: string) {
    setTrocas((atual) =>
      atual.map((t) =>
        t.id === id ? { ...t, status: 'recusada', decididaEm: hoje, motivoRecusa: motivo } : t
      )
    );
  }

  function desfazer(id: string) {
    setTrocas((atual) =>
      atual.map((t) =>
        t.id === id ? { ...t, status: 'pendente', decididaEm: undefined, motivoRecusa: undefined } : t
      )
    );
  }

  function alterarSituacao(matricula: string, status: StatusAtendente, retornoEm?: string) {
    setAtendentes((atual) =>
      atual.map((a) =>
        a.matricula === matricula
          ? { ...a, status, retornoEm: status === 'ativo' ? undefined : retornoEm }
          : a
      )
    );
  }

  return (
    <GestorContext.Provider
      value={{
        trocas,
        atendentes,
        limiteMensal,
        setLimiteMensal,
        aprovar,
        recusar,
        desfazer,
        alterarSituacao,
      }}>
      {children}
    </GestorContext.Provider>
  );
}

export function useGestor() {
  const ctx = useContext(GestorContext);
  if (!ctx) throw new Error('useGestor precisa estar dentro de GestorProvider');
  return ctx;
}

export function trocasDoMes(matricula: string, trocas: TrocaAprovacao[], atendentes: Atendente[]) {
  const base = atendentes.find((a) => a.matricula === matricula)?.trocasAnteriores ?? 0;
  const aprovadas = trocas.filter(
    (t) =>
      t.status === 'aprovada' &&
      (t.matriculaSolicitante === matricula || t.matriculaSubstituto === matricula)
  ).length;
  return base + aprovadas;
}

export function isUrgente(troca: TrocaAprovacao) {
  const dias = diasAte(troca.dataTurno);
  return troca.status === 'pendente' && dias >= 0 && dias <= 3;
}

// Problemas que o gestor deveria ver antes de aprovar
export function conflitosDaTroca(
  troca: TrocaAprovacao,
  trocas: TrocaAprovacao[],
  atendentes: Atendente[],
  limiteMensal: number
) {
  const conflitos: string[] = [];
  const substituto = atendentes.find((a) => a.matricula === troca.matriculaSubstituto);

  if (substituto && substituto.status !== 'ativo') {
    conflitos.push(
      `${troca.substituto} está ${substituto.status === 'ferias' ? 'de férias' : 'afastado(a)'}` +
        (substituto.retornoEm ? ` até ${substituto.retornoEm}` : '')
    );
  }
  if (substituto && substituto.nivel !== troca.nivel) {
    conflitos.push(`${troca.substituto} é ${substituto.nivel}, turno exige ${troca.nivel}`);
  }
  for (const [matricula, nome] of [
    [troca.matriculaSolicitante, troca.solicitante],
    [troca.matriculaSubstituto, troca.substituto],
  ]) {
    if (trocasDoMes(matricula, trocas, atendentes) >= limiteMensal) {
      conflitos.push(`${nome} já atingiu o limite de ${limiteMensal} trocas no mês`);
    }
  }
  const mesmaData = trocas.some(
    (t) =>
      t.id !== troca.id &&
      t.status === 'aprovada' &&
      t.dataTurno === troca.dataTurno &&
      t.matriculaSubstituto === troca.matriculaSubstituto
  );
  if (mesmaData) {
    conflitos.push(`${troca.substituto} já cobre outro turno em ${troca.dataTurno}`);
  }
  return conflitos;
}
