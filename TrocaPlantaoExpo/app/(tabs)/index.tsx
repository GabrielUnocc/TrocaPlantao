import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';

type Troca = {
  id: string;
  medico: string;
  crm: string;
  especialidade: string;
  hospital: string;
  dataPlantao: string;
  turno: string;
  dataDesejada: string;
};

const TROCAS: Troca[] = [
  {
    id: '1',
    medico: 'Dr. Rafael Lima',
    crm: 'CRM-SP 12345',
    especialidade: 'Cardiologia',
    hospital: 'Hospital das Clínicas',
    dataPlantao: '15/09/2026',
    turno: '07:00 – 19:00',
    dataDesejada: '18/09/2026',
  },
  {
    id: '2',
    medico: 'Dra. Ana Costa',
    crm: 'CRM-SP 67890',
    especialidade: 'Pediatria',
    hospital: 'Hospital Albert Einstein',
    dataPlantao: '20/09/2026',
    turno: '19:00 – 07:00',
    dataDesejada: '22/09/2026',
  },
  {
    id: '3',
    medico: 'Dr. Carlos Mendes',
    crm: 'CRM-RJ 11111',
    especialidade: 'Ortopedia',
    hospital: 'Hospital Sírio-Libanês',
    dataPlantao: '17/09/2026',
    turno: '07:00 – 19:00',
    dataDesejada: '19/09/2026',
  },
  {
    id: '4',
    medico: 'Dra. Juliana Torres',
    crm: 'CRM-SP 22222',
    especialidade: 'Neurologia',
    hospital: 'Hospital Santa Catarina',
    dataPlantao: '25/09/2026',
    turno: '19:00 – 07:00',
    dataDesejada: '27/09/2026',
  },
  {
    id: '5',
    medico: 'Dr. Fernando Souza',
    crm: 'CRM-MG 33333',
    especialidade: 'Clínica Médica',
    hospital: 'Hospital Municipal',
    dataPlantao: '28/09/2026',
    turno: '07:00 – 19:00',
    dataDesejada: '30/09/2026',
  },
];

function TrocaCard({ troca, onSolicitar }: { troca: Troca; onSolicitar: (id: string) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{troca.medico.charAt(troca.medico.indexOf(' ') + 1)}</Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.medicoName}>{troca.medico}</Text>
          <Text style={styles.crmText}>{troca.crm}</Text>
        </View>
        <View style={styles.especialidadeBadge}>
          <Text style={styles.especialidadeText}>{troca.especialidade}</Text>
        </View>
      </View>

      <View style={styles.hospitalRow}>
        <Text style={styles.hospitalIcon}>🏥</Text>
        <Text style={styles.hospitalText}>{troca.hospital}</Text>
      </View>

      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Oferece</Text>
          <Text style={styles.dateValue}>{troca.dataPlantao}</Text>
          <Text style={styles.turnoText}>{troca.turno}</Text>
        </View>
        <View style={styles.arrowBlock}>
          <Text style={styles.arrow}>⇄</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Deseja</Text>
          <Text style={styles.dateValue}>{troca.dataDesejada}</Text>
          <Text style={styles.turnoText}>Qualquer turno</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.solicitarButton}
        onPress={() => onSolicitar(troca.id)}>
        <Text style={styles.solicitarText}>Solicitar Troca</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TrocasScreen() {
  const [trocas] = useState(TROCAS);

  function handleSolicitar(id: string) {
    const troca = trocas.find((t) => t.id === id);
    Alert.alert(
      'Solicitação Enviada',
      `Sua solicitação de troca com ${troca?.medico} foi enviada. Aguarde a confirmação.`,
      [{ text: 'OK' }]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Bom dia 👋</Text>
          <Text style={styles.headerTitle}>Trocas Disponíveis</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{trocas.length}</Text>
        </View>
      </View>

      <FlatList
        data={trocas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrocaCard troca={item} onSolicitar={handleSolicitar} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  countBadge: {
    backgroundColor: '#2775F6',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2775F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  medicoName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  crmText: {
    color: '#596579',
    fontSize: 12,
    marginTop: 2,
  },
  especialidadeBadge: {
    backgroundColor: '#1E2A38',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  especialidadeText: {
    color: '#2775F6',
    fontSize: 11,
    fontWeight: '600',
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A38',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  hospitalIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  hospitalText: {
    color: '#AABBC9',
    fontSize: 13,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  turnoText: {
    fontSize: 11,
    color: '#596579',
    marginTop: 2,
  },
  arrowBlock: {
    paddingHorizontal: 12,
  },
  arrow: {
    fontSize: 20,
    color: '#2775F6',
  },
  solicitarButton: {
    backgroundColor: '#2775F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  solicitarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
