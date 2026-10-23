import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { STATUS_ATENDENTE_CONFIG, STATUS_CONFIG, diasAte, parseData } from '@/constants/gestor-data';
import { conflitosDaTroca, isUrgente, useGestor } from '@/hooks/use-gestor';

function StatCard({ label, valor, cor }: { label: string; valor: string; cor: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValor, { color: cor }]}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function PainelScreen() {
  const router = useRouter();
  const { trocas, atendentes, limiteMensal } = useGestor();

  const pendentes = trocas.filter((t) => t.status === 'pendente');
  const aprovadas = trocas.filter((t) => t.status === 'aprovada');
  const recusadas = trocas.filter((t) => t.status === 'recusada');
  const decididas = aprovadas.length + recusadas.length;
  const taxa = decididas > 0 ? Math.round((aprovadas.length / decididas) * 100) : 0;
  const urgentes = pendentes.filter(isUrgente);

  const atencao = pendentes
    .map((t) => ({ troca: t, conflitos: conflitosDaTroca(t, trocas, atendentes, limiteMensal) }))
    .filter(({ troca, conflitos }) => isUrgente(troca) || conflitos.length > 0)
    .sort((a, b) => diasAte(a.troca.dataTurno) - diasAte(b.troca.dataTurno));

  const equipes = [...new Set(atendentes.map((a) => a.equipe))].map((equipe) => {
    const daEquipe = trocas.filter((t) => t.equipe === equipe);
    return {
      equipe,
      pendentes: daEquipe.filter((t) => t.status === 'pendente').length,
      aprovadas: daEquipe.filter((t) => t.status === 'aprovada').length,
      recusadas: daEquipe.filter((t) => t.status === 'recusada').length,
      total: daEquipe.length,
    };
  });
  const maiorTotal = Math.max(1, ...equipes.map((e) => e.total));

  const recentes = trocas
    .filter((t) => t.decididaEm)
    .sort((a, b) => parseData(b.decididaEm!).getTime() - parseData(a.decididaEm!).getTime())
    .slice(0, 4);

  const indisponiveis = atendentes.filter((a) => a.status !== 'ativo');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Olá, Gestor 👋</Text>
            <Text style={styles.headerTitle}>Visão Geral</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Sair', 'Deseja sair da conta?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: () => router.replace('/login') },
              ])
            }>
            <Text style={styles.sairText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Pendentes" valor={String(pendentes.length)} cor="#F5A623" />
          <StatCard label="Urgentes (≤ 3 dias)" valor={String(urgentes.length)} cor="#F44336" />
          <StatCard label="Aprovadas" valor={String(aprovadas.length)} cor="#4CAF50" />
          <StatCard label="Taxa de aprovação" valor={`${taxa}%`} cor="#2775F6" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Precisam de atenção</Text>
          <TouchableOpacity onPress={() => router.push('/gestor/aprovacoes')}>
            <Text style={styles.verTodas}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {atencao.length === 0 ? (
          <View style={styles.box}>
            <Text style={styles.vazioText}>✓ Nada urgente por agora.</Text>
          </View>
        ) : (
          atencao.map(({ troca, conflitos }) => {
            const dias = diasAte(troca.dataTurno);
            return (
              <TouchableOpacity
                key={troca.id}
                style={styles.atencaoItem}
                onPress={() => router.push('/gestor/aprovacoes')}>
                <View style={styles.atencaoDias}>
                  <Text style={styles.atencaoDiasNum}>{dias}</Text>
                  <Text style={styles.atencaoDiasLabel}>{dias === 1 ? 'dia' : 'dias'}</Text>
                </View>
                <View style={styles.atencaoInfo}>
                  <Text style={styles.atencaoNome} numberOfLines={1}>
                    {troca.solicitante} ⇄ {troca.substituto}
                  </Text>
                  <Text style={styles.atencaoSub}>
                    {troca.equipe} · {troca.dataTurno}
                  </Text>
                  {conflitos.length > 0 && (
                    <Text style={styles.atencaoAlerta} numberOfLines={1}>
                      ⚠ {conflitos[0]}
                      {conflitos.length > 1 ? ` (+${conflitos.length - 1})` : ''}
                    </Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })
        )}

        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Trocas por equipe</Text>
        <View style={styles.box}>
          {equipes.map((e) => (
            <View key={e.equipe} style={styles.equipeRow}>
              <View style={styles.equipeLabelRow}>
                <Text style={styles.equipeNome}>{e.equipe}</Text>
                <Text style={styles.equipeTotal}>{e.total}</Text>
              </View>
              <View style={[styles.barra, { width: `${(e.total / maiorTotal) * 100}%` }]}>
                {e.aprovadas > 0 && (
                  <View style={{ flex: e.aprovadas, backgroundColor: STATUS_CONFIG.aprovada.color }} />
                )}
                {e.pendentes > 0 && (
                  <View style={{ flex: e.pendentes, backgroundColor: STATUS_CONFIG.pendente.color }} />
                )}
                {e.recusadas > 0 && (
                  <View style={{ flex: e.recusadas, backgroundColor: STATUS_CONFIG.recusada.color }} />
                )}
              </View>
            </View>
          ))}
          <View style={styles.legenda}>
            {(['aprovada', 'pendente', 'recusada'] as const).map((s) => (
              <View key={s} style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: STATUS_CONFIG[s].color }]} />
                <Text style={styles.legendaText}>{STATUS_CONFIG[s].label}</Text>
              </View>
            ))}
          </View>
        </View>

        {indisponiveis.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Fora da escala</Text>
            <View style={styles.box}>
              {indisponiveis.map((a) => (
                <View key={a.matricula} style={styles.recenteRow}>
                  <View style={styles.atencaoInfo}>
                    <Text style={styles.recenteNome}>
                      {a.nome} · {a.nivel}
                    </Text>
                    {a.retornoEm && <Text style={styles.atencaoSub}>Retorno em {a.retornoEm}</Text>}
                  </View>
                  <Text style={[styles.recenteStatus, { color: STATUS_ATENDENTE_CONFIG[a.status].color }]}>
                    {STATUS_ATENDENTE_CONFIG[a.status].label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Decisões recentes</Text>
        <View style={styles.box}>
          {recentes.length === 0 ? (
            <Text style={styles.vazioText}>Nenhuma decisão ainda.</Text>
          ) : (
            recentes.map((t) => (
              <View key={t.id} style={styles.recenteRow}>
                <View style={styles.atencaoInfo}>
                  <Text style={styles.recenteNome} numberOfLines={1}>
                    {t.solicitante} ⇄ {t.substituto}
                  </Text>
                  <Text style={styles.atencaoSub}>{t.decididaEm}</Text>
                </View>
                <Text style={[styles.recenteStatus, { color: STATUS_CONFIG[t.status].color }]}>
                  {STATUS_CONFIG[t.status].label}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#596579',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sairText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#162030',
    borderRadius: 14,
    padding: 14,
  },
  statValor: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#8A96A8',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSpacing: {
    marginTop: 24,
    marginBottom: 10,
  },
  verTodas: {
    color: '#2775F6',
    fontSize: 13,
    fontWeight: '600',
  },
  box: {
    backgroundColor: '#162030',
    borderRadius: 14,
    padding: 14,
  },
  vazioText: {
    color: '#596579',
    fontSize: 14,
  },
  atencaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162030',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  atencaoDias: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2A1616',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  atencaoDiasNum: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
  atencaoDiasLabel: {
    color: '#F44336',
    fontSize: 10,
  },
  atencaoInfo: {
    flex: 1,
  },
  atencaoNome: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  atencaoSub: {
    color: '#596579',
    fontSize: 12,
    marginTop: 2,
  },
  atencaoAlerta: {
    color: '#F5A623',
    fontSize: 12,
    marginTop: 4,
  },
  chevron: {
    color: '#596579',
    fontSize: 24,
    marginLeft: 8,
  },
  equipeRow: {
    marginBottom: 12,
  },
  equipeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  equipeNome: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  equipeTotal: {
    color: '#8A96A8',
    fontSize: 13,
    fontWeight: '600',
  },
  barra: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  legenda: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaCor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendaText: {
    color: '#8A96A8',
    fontSize: 12,
  },
  recenteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recenteNome: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  recenteStatus: {
    color: '#8A96A8',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
});
