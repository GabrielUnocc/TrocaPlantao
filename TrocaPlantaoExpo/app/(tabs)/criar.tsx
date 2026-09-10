import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { InputField } from '@/components/atoms/InputField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';

const NIVEIS = ['N1', 'N2', 'N3', 'Líder'];

const TURNOS = ['07:00 – 19:00', '19:00 – 07:00', '07:00 – 13:00', '13:00 – 19:00'];

export default function CriarScreen() {
  const [equipe, setEquipe] = useState('');
  const [dataTurno, setDataTurno] = useState('');
  const [dataDesejada, setDataDesejada] = useState('');
  const [nivel, setNivel] = useState('');
  const [turno, setTurno] = useState('');
  const [observacao, setObservacao] = useState('');

  function handlePublicar() {
    if (!equipe || !dataTurno || !dataDesejada || !nivel || !turno) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    Alert.alert(
      'Solicitação Publicada!',
      'Sua solicitação de troca foi publicada. Outros médicos poderão entrar em contato.',
      [
        {
          text: 'OK',
          onPress: () => {
            setEquipe('');
            setDataTurno('');
            setDataDesejada('');
            setNivel('');
            setTurno('');
            setObservacao('');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nova Solicitação</Text>
          <Text style={styles.subtitle}>Publique um turno para troca</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Turno a Oferecer</Text>

          <Text style={styles.label}>Empresa / Equipe *</Text>
          <InputField
            placeholder="Nome da empresa ou equipe"
            value={equipe}
            onChangeText={setEquipe}
          />

          <Text style={styles.label}>Data do Turno *</Text>
          <InputField
            placeholder="DD/MM/AAAA"
            value={dataTurno}
            onChangeText={setDataTurno}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Turno *</Text>
          <View style={styles.chipsRow}>
            {TURNOS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, turno === t && styles.chipSelected]}
                onPress={() => setTurno(t)}>
                <Text style={[styles.chipText, turno === t && styles.chipTextSelected]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nível *</Text>
          <View style={styles.chipsRow}>
            {NIVEIS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, nivel === n && styles.chipSelected]}
                onPress={() => setNivel(n)}>
                <Text style={[styles.chipText, nivel === n && styles.chipTextSelected]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Desejada para Troca</Text>

          <Text style={styles.label}>Prefiro trocar pelo dia *</Text>
          <InputField
            placeholder="DD/MM/AAAA"
            value={dataDesejada}
            onChangeText={setDataDesejada}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Observações</Text>
          <InputField
            placeholder="Alguma preferência ou detalhe adicional?"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>

        <PrimaryButton title="Publicar Solicitação" onPress={handlePublicar} />
        <View style={{ height: 24 }} />
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#596579',
  },
  section: {
    backgroundColor: '#162030',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#AABBC9',
    marginBottom: 8,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#596579',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: '#2775F6',
    borderColor: '#2775F6',
  },
  chipText: {
    color: '#596579',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
