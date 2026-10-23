import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '@/components/atoms/InputField';
import {
  Atendente,
  STATUS_ATENDENTE_CONFIG,
  STATUS_CONFIG,
  StatusAtendente,
  daqui,
  parseData,
} from '@/constants/gestor-data';
import { trocasDoMes, useGestor } from '@/hooks/use-gestor';

function iniciais(nome: string) {
  const partes = nome.split(' ');
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
}

function corUso(usadas: number, limite: number) {
  if (usadas >= limite) return '#F44336';
  if (usadas >= limite - 1) return '#F5A623';
  return '#4CAF50';
}

const SITUACOES: StatusAtendente[] = ['ativo', 'ferias', 'afastado'];

const ATALHOS_RETORNO = [7, 15, 30];

function dataValida(data: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
  const d = parseData(data);
  const [dd, mm] = data.split('/').map(Number);
  return d.getDate() === dd && d.getMonth() + 1 === mm;
}

// Formata enquanto digita: 25122026 -> 25/12/2026
function mascaraData(texto: string) {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function SituacaoEditor({ atendente }: { atendente: Atendente }) {
  const { alterarSituacao } = useGestor();
  const [status, setStatus] = useState(atendente.status);
  const [retorno, setRetorno] = useState(atendente.retornoEm ?? '');

  const precisaRetorno = status !== 'ativo';
  const retornoOk = !precisaRetorno || retorno === '' || dataValida(retorno);
  const mudou = status !== atendente.status || retorno !== (atendente.retornoEm ?? '');

  function salvar() {
    alterarSituacao(atendente.matricula, status, precisaRetorno && retorno ? retorno : undefined);
    Alert.alert(
      'Situação atualizada',
      status === 'ativo'
        ? `${atendente.nome} está de volta à escala.`
        : `${atendente.nome} marcado(a) como ${STATUS_ATENDENTE_CONFIG[status].label.toLowerCase()}` +
            (retorno ? ` até ${retorno}.` : '.')
    );
  }

  return (
    <View style={styles.situacaoBox}>
      <Text style={styles.modalLabel}>Situação</Text>
      <View style={styles.situacaoRow}>
        {SITUACOES.map((s) => {
          const cfg = STATUS_ATENDENTE_CONFIG[s];
          const ativo = status === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.situacaoChip, ativo && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
              onPress={() => setStatus(s)}>
              <Text style={[styles.filtroText, ativo && { color: cfg.color, fontWeight: '700' }]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {precisaRetorno && (
        <>
          <Text style={styles.retornoLabel}>Retorno previsto (opcional)</Text>
          <InputField
            placeholder="dd/mm/aaaa"
            value={retorno}
            onChangeText={(t) => setRetorno(mascaraData(t))}
            keyboardType="number-pad"
            style={[styles.retornoInput, !retornoOk && styles.inputErro]}
          />
          <View style={styles.situacaoRow}>
            {ATALHOS_RETORNO.map((dias) => (
              <TouchableOpacity
                key={dias}
                style={styles.atalhoChip}
                onPress={() => setRetorno(daqui(dias))}>
                <Text style={styles.atalhoText}>+{dias} dias</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!retornoOk && <Text style={styles.erroText}>Data inválida.</Text>}
        </>
      )}

      {mudou && (
        <TouchableOpacity
          style={[styles.salvarButton, !retornoOk && styles.desabilitado]}
          disabled={!retornoOk}
          onPress={salvar}>
          <Text style={styles.fecharText}>Salvar situação</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AtendenteCard({ atendente, onPress }: { atendente: Atendente; onPress: () => void }) {
  const { trocas, atendentes, limiteMensal } = useGestor();
  const usadas = trocasDoMes(atendente.matricula, trocas, atendentes);
  const status = STATUS_ATENDENTE_CONFIG[atendente.status];
  const cor = corUso(usadas, limiteMensal);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciais(atendente.nome)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nome}>{atendente.nome}</Text>
          <Text style={styles.sub}>
            {atendente.matricula} · {atendente.nivel} · {atendente.equipe}
          </Text>
          {atendente.retornoEm && (
            <Text style={[styles.sub, { color: status.color }]}>Retorno em {atendente.retornoEm}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.usoRow}>
        <Text style={styles.usoLabel}>Trocas no mês</Text>
        <Text style={[styles.usoValor, { color: cor }]}>
          {usadas}/{limiteMensal}
        </Text>
      </View>
      <View style={styles.usoTrilho}>
        <View
          style={[
            styles.usoBarra,
            { width: `${Math.min(100, (usadas / limiteMensal) * 100)}%`, backgroundColor: cor },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

function AtendenteModal({ matricula, onFechar }: { matricula: string | null; onFechar: () => void }) {
  const { trocas, atendentes, limiteMensal } = useGestor();
  const atendente = atendentes.find((a) => a.matricula === matricula);
  if (!atendente) return null;

  const historico = trocas.filter(
    (t) =>
      t.matriculaSolicitante === atendente.matricula || t.matriculaSubstituto === atendente.matricula
  );
  const usadas = trocasDoMes(atendente.matricula, trocas, atendentes);
  const comoSolicitante = historico.filter((t) => t.matriculaSolicitante === atendente.matricula).length;
  const comoSubstituto = historico.length - comoSolicitante;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onFechar}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciais(atendente.nome)}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.modalTitle}>{atendente.nome}</Text>
              <Text style={styles.sub}>
                {atendente.matricula} · {atendente.nivel} · {atendente.equipe}
              </Text>
            </View>
          </View>

          <View style={styles.resumoRow}>
            <View style={styles.resumoItem}>
              <Text style={[styles.resumoValor, { color: corUso(usadas, limiteMensal) }]}>
                {usadas}/{limiteMensal}
              </Text>
              <Text style={styles.resumoLabel}>No mês</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{comoSolicitante}</Text>
              <Text style={styles.resumoLabel}>Pediu troca</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{comoSubstituto}</Text>
              <Text style={styles.resumoLabel}>Cobriu turno</Text>
            </View>
          </View>

          <SituacaoEditor key={`${atendente.status}-${atendente.retornoEm}`} atendente={atendente} />

          <Text style={styles.modalLabel}>Histórico de trocas</Text>
          <ScrollView style={styles.historico}>
            {historico.length === 0 ? (
              <Text style={styles.sub}>Nenhuma troca registrada.</Text>
            ) : (
              historico.map((t) => {
                const outro =
                  t.matriculaSolicitante === atendente.matricula
                    ? `Com ${t.substituto}`
                    : `Cobrindo ${t.solicitante}`;
                return (
                  <View key={t.id} style={styles.historicoRow}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.historicoNome}>{outro}</Text>
                      <Text style={styles.sub}>
                        {t.dataTurno} · {t.turno}
                      </Text>
                    </View>
                    <Text style={[styles.historicoStatus, { color: STATUS_CONFIG[t.status].color }]}>
                      {STATUS_CONFIG[t.status].label}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity style={styles.fecharButton} onPress={onFechar}>
            <Text style={styles.fecharText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function EquipeScreen() {
  const { atendentes, trocas, limiteMensal, setLimiteMensal } = useGestor();
  const [busca, setBusca] = useState('');
  const [equipe, setEquipe] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const equipes = [...new Set(atendentes.map((a) => a.equipe))];
  const termo = busca.trim().toLowerCase();
  const filtrados = atendentes
    .filter((a) => !equipe || a.equipe === equipe)
    .filter((a) => !termo || `${a.nome} ${a.matricula}`.toLowerCase().includes(termo));
  const noLimite = atendentes.filter((a) => trocasDoMes(a.matricula, trocas, atendentes) >= limiteMensal);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerGreeting}>Painel do Gestor</Text>
        <Text style={styles.headerTitle}>Equipe</Text>
      </View>

      <View style={styles.limiteBox}>
        <View style={styles.cardInfo}>
          <Text style={styles.nome}>Limite de trocas por mês</Text>
          <Text style={styles.sub}>
            {noLimite.length > 0
              ? `${noLimite.length} atendente(s) no limite`
              : 'Ninguém atingiu o limite'}
          </Text>
        </View>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => setLimiteMensal(Math.max(1, limiteMensal - 1))}>
            <Text style={styles.stepperText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValor}>{limiteMensal}</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => setLimiteMensal(Math.min(10, limiteMensal + 1))}>
            <Text style={styles.stepperText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buscaContainer}>
        <InputField
          placeholder="Buscar por nome ou matrícula"
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
          {[null, ...equipes].map((e) => (
            <TouchableOpacity
              key={e ?? 'todas'}
              style={[styles.filtroChip, equipe === e && styles.filtroChipSelected]}
              onPress={() => setEquipe(e)}>
              <Text style={[styles.filtroText, equipe === e && styles.filtroTextSelected]}>
                {e ?? 'Todas'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.matricula}
        renderItem={({ item }) => (
          <AtendenteCard atendente={item} onPress={() => setSelecionado(item.matricula)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum atendente encontrado.</Text>
          </View>
        }
      />

      <AtendenteModal matricula={selecionado} onFechar={() => setSelecionado(null)} />
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
  limiteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162030',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E2A38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  stepperValor: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 16,
    textAlign: 'center',
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#162030',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2A38',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2775F6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  nome: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  sub: {
    color: '#596579',
    fontSize: 12,
    marginTop: 2,
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
  usoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  usoLabel: {
    color: '#8A96A8',
    fontSize: 12,
  },
  usoValor: {
    fontSize: 12,
    fontWeight: '700',
  },
  usoTrilho: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E2A38',
    overflow: 'hidden',
  },
  usoBarra: {
    height: 6,
    borderRadius: 3,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalLabel: {
    fontSize: 12,
    color: '#8A96A8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resumoRow: {
    flexDirection: 'row',
    backgroundColor: '#1E2A38',
    borderRadius: 10,
    padding: 12,
    marginVertical: 16,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoValor: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumoLabel: {
    color: '#596579',
    fontSize: 11,
    marginTop: 2,
  },
  historico: {
    flexGrow: 0,
  },
  historicoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A38',
  },
  historicoNome: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  historicoStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  situacaoBox: {
    marginBottom: 16,
  },
  situacaoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  situacaoChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#596579',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  retornoLabel: {
    color: '#8A96A8',
    fontSize: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  retornoInput: {
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputErro: {
    borderColor: '#F44336',
  },
  erroText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
  },
  atalhoChip: {
    backgroundColor: '#1E2A38',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  atalhoText: {
    color: '#2775F6',
    fontSize: 12,
    fontWeight: '600',
  },
  salvarButton: {
    marginTop: 14,
    backgroundColor: '#2775F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  desabilitado: {
    opacity: 0.4,
  },
  fecharButton: {
    marginTop: 16,
    backgroundColor: '#1E2A38',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fecharText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
