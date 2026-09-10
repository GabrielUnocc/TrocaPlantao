import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

type StatusTroca = 'aberta' | 'negociacao' | 'confirmada' | 'cancelada';

type MinhaTroca = {
  id: string;
  equipe: string;
  nivel: string;
  dataTurno: string;
  turno: string;
  dataDesejada: string;
  status: StatusTroca;
  interessado?: string;
};

const MINHAS_TROCAS: MinhaTroca[] = [
  {
    id: '1',
    equipe: 'Suporte TI',
    nivel: 'N2',
    dataTurno: '10/09/2026',
    turno: '07:00 – 19:00',
    dataDesejada: '14/09/2026',
    status: 'negociacao',
    interessado: 'Mariana Alves',
  },
  {
    id: '2',
    equipe: 'Atendimento ao Cliente',
    nivel: 'N1',
    dataTurno: '22/09/2026',
    turno: '19:00 – 07:00',
    dataDesejada: '25/09/2026',
    status: 'aberta',
  },
  {
    id: '3',
    equipe: 'Infraestrutura',
    nivel: 'N3',
    dataTurno: '05/08/2026',
    turno: '07:00 – 19:00',
    dataDesejada: '08/08/2026',
    status: 'confirmada',
    interessado: 'Paulo Saraiva',
  },
];

const STATUS_CONFIG: Record<StatusTroca, { label: string; color: string; bg: string }> = {
  aberta: { label: 'Aberta', color: '#2775F6', bg: '#1E2A38' },
  negociacao: { label: 'Em Negociação', color: '#F5A623', bg: '#2A2010' },
  confirmada: { label: 'Confirmada', color: '#4CAF50', bg: '#162A18' },
  cancelada: { label: 'Cancelada', color: '#F44336', bg: '#2A1616' },
};

function MinhaTrocaCard({ troca }: { troca: MinhaTroca }) {
  const config = STATUS_CONFIG[troca.status];

  function handleAcao() {
    if (troca.status === 'negociacao') {
      Alert.alert(
        'Negociação com ' + troca.interessado,
        'Deseja confirmar a troca com este atendente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar Troca', onPress: () => Alert.alert('Troca confirmada!') },
        ]
      );
    } else if (troca.status === 'aberta') {
      Alert.alert('Cancelar Solicitação', 'Deseja cancelar esta solicitação de troca?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: () => {} },
      ]);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.hospitalText}>{troca.equipe}</Text>
          <Text style={styles.especialidadeText}>{troca.nivel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Meu Turno</Text>
          <Text style={styles.dateValue}>{troca.dataTurno}</Text>
          <Text style={styles.turnoText}>{troca.turno}</Text>
        </View>
        <Text style={styles.arrow}>⇄</Text>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Data Desejada</Text>
          <Text style={styles.dateValue}>{troca.dataDesejada}</Text>
          <Text style={styles.turnoText}>Qualquer turno</Text>
        </View>
      </View>

      {troca.interessado && (
        <View style={styles.interessadoRow}>
          <Text style={styles.interessadoIcon}>👤</Text>
          <Text style={styles.interessadoText}>{troca.interessado}</Text>
        </View>
      )}

      {(troca.status === 'negociacao' || troca.status === 'aberta') && (
        <TouchableOpacity
          style={[
            styles.acaoButton,
            troca.status === 'negociacao' ? styles.acaoConfirmar : styles.acaoCancelar,
          ]}
          onPress={handleAcao}>
          <Text style={styles.acaoText}>
            {troca.status === 'negociacao' ? 'Ver Proposta' : 'Cancelar Solicitação'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MinhasTrocasScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Atendente Teste</Text>
            <Text style={styles.profileCrm}>MAT-99999 · N1</Text>
          </View>
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

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Confirmadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <Text style={styles.listTitle}>Minhas Solicitações</Text>

      <FlatList
        data={MINHAS_TROCAS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MinhaTrocaCard troca={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma solicitação ainda.</Text>
            <Text style={styles.emptySubtext}>Crie uma na aba "Criar".</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2775F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  profileName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  profileCrm: {
    color: '#596579',
    fontSize: 12,
    marginTop: 2,
  },
  sairText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#162030',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2775F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#596579',
    marginTop: 2,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#162030',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  hospitalText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  especialidadeText: {
    color: '#596579',
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1E2A38',
    borderRadius: 10,
    padding: 12,
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: '#596579',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  turnoText: {
    fontSize: 11,
    color: '#596579',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#2775F6',
    paddingHorizontal: 8,
  },
  interessadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  interessadoIcon: {
    fontSize: 14,
  },
  interessadoText: {
    color: '#AABBC9',
    fontSize: 13,
  },
  acaoButton: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  acaoConfirmar: {
    backgroundColor: '#2775F6',
  },
  acaoCancelar: {
    backgroundColor: '#1E2A38',
  },
  acaoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#596579',
    fontSize: 14,
  },
});
