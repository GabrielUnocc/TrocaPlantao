import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '@/components/atoms/InputField';
import {
  MOTIVOS_RECUSA,
  STATUS_CONFIG,
  StatusAprovacao,
  TrocaAprovacao,
  diasAte,
} from '@/constants/gestor-data';
import { conflitosDaTroca, isUrgente, useGestor } from '@/hooks/use-gestor';

const FILTROS: StatusAprovacao[] = ['pendente', 'aprovada', 'recusada'];

function textoPrazo(troca: TrocaAprovacao) {
  const dias = diasAte(troca.dataTurno);
  if (dias < 0) return `Turno há ${-dias} dia(s)`;
  if (dias === 0) return 'Turno hoje';
  if (dias === 1) return 'Turno amanhã';
  return `Turno em ${dias} dias`;
}

function TrocaAprovacaoCard({
  troca,
  conflitos,
  onAprovar,
  onRecusar,
  onDesfazer,
}: {
  troca: TrocaAprovacao;
  conflitos: string[];
  onAprovar: () => void;
  onRecusar: () => void;
  onDesfazer: () => void;
}) {
  const config = STATUS_CONFIG[troca.status];
  const urgente = isUrgente(troca);

  function handleAprovar() {
    const aviso = conflitos.length > 0 ? `\n\nAtenção:\n• ${conflitos.join('\n• ')}` : '';
    Alert.alert(
      'Aprovar Troca',
      `Aprovar a troca entre ${troca.solicitante} e ${troca.substituto}?${aviso}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprovar', onPress: onAprovar },
      ]
    );
  }

  function handleDesfazer() {
    Alert.alert('Desfazer decisão', 'A troca voltará para a lista de pendentes.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desfazer', onPress: onDesfazer },
    ]);
  }

  return (
    <View style={[styles.card, urgente && styles.cardUrgente]}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.equipeText}>{troca.equipe}</Text>
          <Text style={styles.nivelText}>
            {troca.nivel} · solicitada em {troca.solicitadaEm}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      {troca.status === 'pendente' && (
        <View style={styles.tagsRow}>
          <View style={[styles.tag, urgente && styles.tagUrgente]}>
            <Text style={[styles.tagText, urgente && { color: '#F44336' }]}>
              {urgente ? '⚡ ' : ''}
              {textoPrazo(troca)}
            </Text>
          </View>
          {conflitos.length > 0 && (
            <View style={[styles.tag, styles.tagConflito]}>
              <Text style={[styles.tagText, { color: '#F5A623' }]}>
                ⚠ {conflitos.length} alerta(s)
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.pessoasRow}>
        <View style={styles.pessoaBlock}>
          <Text style={styles.pessoaLabel}>Solicitante</Text>
          <Text style={styles.pessoaNome}>{troca.solicitante}</Text>
          <Text style={styles.pessoaMatricula}>{troca.matriculaSolicitante}</Text>
        </View>
        <Text style={styles.arrow}>⇄</Text>
        <View style={styles.pessoaBlock}>
          <Text style={styles.pessoaLabel}>Substituto</Text>
          <Text style={styles.pessoaNome}>{troca.substituto}</Text>
          <Text style={styles.pessoaMatricula}>{troca.matriculaSubstituto}</Text>
        </View>
      </View>

      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Turno</Text>
          <Text style={styles.dateValue}>{troca.dataTurno}</Text>
          <Text style={styles.turnoText}>{troca.turno}</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Troca por</Text>
          <Text style={styles.dateValue}>{troca.dataDesejada}</Text>
          <Text style={styles.turnoText}>{troca.turnoDesejado}</Text>
        </View>
      </View>

      {troca.status === 'pendente' && conflitos.length > 0 && (
        <View style={styles.conflitoBox}>
          {conflitos.map((c) => (
            <Text key={c} style={styles.conflitoText}>
              ⚠ {c}
            </Text>
          ))}
        </View>
      )}

      {troca.status === 'recusada' && troca.motivoRecusa && (
        <View style={styles.motivoBox}>
          <Text style={styles.dateLabel}>Motivo da recusa</Text>
          <Text style={styles.motivoText}>{troca.motivoRecusa}</Text>
        </View>
      )}

      {troca.status === 'pendente' ? (
        <View style={styles.acoesRow}>
          <TouchableOpacity style={[styles.acaoButton, styles.acaoRecusar]} onPress={onRecusar}>
            <Text style={[styles.acaoText, { color: '#F44336' }]}>Recusar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.acaoButton, styles.acaoAprovar]} onPress={handleAprovar}>
            <Text style={styles.acaoText}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.decisaoRow}>
          <Text style={styles.decisaoText}>Decidida em {troca.decididaEm}</Text>
          <TouchableOpacity onPress={handleDesfazer}>
            <Text style={styles.desfazerText}>Desfazer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function RecusaModal({
  troca,
  onCancelar,
  onConfirmar,
}: {
  troca: TrocaAprovacao | null;
  onCancelar: () => void;
  onConfirmar: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState('');

  function fechar() {
    setMotivo('');
    onCancelar();
  }

  function confirmar() {
    onConfirmar(motivo.trim());
    setMotivo('');
  }

  return (
    <Modal visible={troca !== null} transparent animationType="slide" onRequestClose={fechar}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recusar troca</Text>
          {troca && (
            <Text style={styles.modalSubtitle}>
              {troca.solicitante} ⇄ {troca.substituto} · {troca.dataTurno}
            </Text>
          )}

          <Text style={styles.modalLabel}>Motivo (o atendente será avisado)</Text>
          <View style={styles.motivosWrap}>
            {MOTIVOS_RECUSA.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.motivoChip, motivo === m && styles.filtroChipSelected]}
                onPress={() => setMotivo(m)}>
                <Text style={[styles.filtroText, motivo === m && styles.filtroTextSelected]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <InputField
            placeholder="Ou escreva outro motivo..."
            value={motivo}
            onChangeText={setMotivo}
            multiline
          />

          <View style={styles.acoesRow}>
            <TouchableOpacity style={[styles.acaoButton, styles.acaoCancelar]} onPress={fechar}>
              <Text style={styles.acaoText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acaoButton, styles.acaoRecusarCheio, !motivo.trim() && styles.desabilitado]}
              disabled={!motivo.trim()}
              onPress={confirmar}>
              <Text style={styles.acaoText}>Recusar troca</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AprovacoesScreen() {
  const { trocas, atendentes, limiteMensal, aprovar, recusar, desfazer } = useGestor();
  const [filtro, setFiltro] = useState<StatusAprovacao>('pendente');
  const [busca, setBusca] = useState('');
  const [recusando, setRecusando] = useState<TrocaAprovacao | null>(null);

  const termo = busca.trim().toLowerCase();
  const filtradas = trocas
    .filter((t) => t.status === filtro)
    .filter(
      (t) =>
        !termo ||
        [t.solicitante, t.substituto, t.matriculaSolicitante, t.matriculaSubstituto, t.equipe]
          .join(' ')
          .toLowerCase()
          .includes(termo)
    )
    // Pendentes: turno mais próximo primeiro. Decididas: mais recentes primeiro.
    .sort((a, b) =>
      filtro === 'pendente'
        ? diasAte(a.dataTurno) - diasAte(b.dataTurno)
        : diasAte(b.dataTurno) - diasAte(a.dataTurno)
    );

  const conflitosPorId = Object.fromEntries(
    trocas.map((t) => [t.id, conflitosDaTroca(t, trocas, atendentes, limiteMensal)])
  );
  const semConflito = filtradas.filter(
    (t) => t.status === 'pendente' && conflitosPorId[t.id].length === 0
  );

  function handleAprovarLote() {
    Alert.alert(
      'Aprovar em lote',
      `Aprovar ${semConflito.length} troca(s) sem alertas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprovar todas', onPress: () => aprovar(semConflito.map((t) => t.id)) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerGreeting}>Painel do Gestor</Text>
        <Text style={styles.headerTitle}>Aprovação de Trocas</Text>
      </View>

      <View style={styles.buscaContainer}>
        <InputField
          placeholder="Buscar por nome, matrícula ou equipe"
          value={busca}
          onChangeText={setBusca}
          style={styles.busca}
        />
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosRow}>
          {FILTROS.map((f) => {
            const total = trocas.filter((t) => t.status === f).length;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filtroChip, filtro === f && styles.filtroChipSelected]}
                onPress={() => setFiltro(f)}>
                <Text style={[styles.filtroText, filtro === f && styles.filtroTextSelected]}>
                  {STATUS_CONFIG[f].label} ({total})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filtro === 'pendente' && semConflito.length > 1 && (
        <TouchableOpacity style={styles.loteButton} onPress={handleAprovarLote}>
          <Text style={styles.loteText}>✓ Aprovar {semConflito.length} sem alertas</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrocaAprovacaoCard
            troca={item}
            conflitos={conflitosPorId[item.id]}
            onAprovar={() => aprovar([item.id])}
            onRecusar={() => setRecusando(item)}
            onDesfazer={() => desfazer(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {termo ? 'Nenhuma troca encontrada.' : 'Nenhuma troca nesta lista.'}
            </Text>
          </View>
        }
      />

      <RecusaModal
        troca={recusando}
        onCancelar={() => setRecusando(null)}
        onConfirmar={(motivo) => {
          if (recusando) recusar(recusando.id, motivo);
          setRecusando(null);
        }}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  buscaContainer: {
    paddingHorizontal: 16,
  },
  busca: {
    paddingVertical: 10,
    backgroundColor: '#162030',
    borderColor: '#1E2A38',
  },
  filtrosRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filtroChip: {
    borderWidth: 1,
    borderColor: '#596579',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filtroChipSelected: {
    backgroundColor: '#2775F6',
    borderColor: '#2775F6',
  },
  filtroText: {
    color: '#596579',
    fontSize: 13,
  },
  filtroTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loteButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 10,
    alignItems: 'center',
  },
  loteText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardUrgente: {
    borderColor: '#5A2424',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  equipeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  nivelText: {
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#1E2A38',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagUrgente: {
    backgroundColor: '#2A1616',
  },
  tagConflito: {
    backgroundColor: '#2A2010',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A96A8',
  },
  pessoasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pessoaBlock: {
    flex: 1,
    alignItems: 'center',
  },
  pessoaLabel: {
    fontSize: 11,
    color: '#596579',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pessoaNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pessoaMatricula: {
    fontSize: 11,
    color: '#596579',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#2775F6',
    paddingHorizontal: 8,
  },
  datesRow: {
    flexDirection: 'row',
    backgroundColor: '#1E2A38',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
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
  conflitoBox: {
    backgroundColor: '#2A2010',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  conflitoText: {
    color: '#F5A623',
    fontSize: 12,
  },
  motivoBox: {
    backgroundColor: '#2A1616',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  motivoText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  acoesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acaoButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  acaoAprovar: {
    backgroundColor: '#4CAF50',
  },
  acaoRecusar: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  acaoRecusarCheio: {
    backgroundColor: '#F44336',
  },
  acaoCancelar: {
    backgroundColor: '#1E2A38',
  },
  desabilitado: {
    opacity: 0.4,
  },
  acaoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  decisaoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisaoText: {
    color: '#596579',
    fontSize: 12,
  },
  desfazerText: {
    color: '#2775F6',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#596579',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#162030',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#596579',
    marginTop: 4,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: '#8A96A8',
    marginBottom: 8,
  },
  motivosWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  motivoChip: {
    borderWidth: 1,
    borderColor: '#596579',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
