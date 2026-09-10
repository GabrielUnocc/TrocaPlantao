import { Alert, ScrollView, View, StyleSheet } from 'react-native';
import { AppText } from '../components/atoms/AppText';
import { InputField } from '../components/atoms/InputField';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { LoginForm } from '../components/molecules/LoginForm';

export function ComponentesDemo() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <AppText variant="title">TrocaPlantão</AppText>
      <AppText variant="caption">Demonstração de componentes — Atomic Design</AppText>

      <View style={styles.section}>
        <AppText variant="body">Campo de busca (atom: InputField)</AppText>
        <InputField placeholder="Buscar colega..." />
      </View>

      <View style={styles.section}>
        <AppText variant="body">Botão avulso (atom: PrimaryButton)</AppText>
        <PrimaryButton
          title="Solicitar Troca"
          onPress={() => Alert.alert('TrocaPlantão', 'Solicitação enviada!')}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="body">Formulário de login (molecule: LoginForm)</AppText>
        <LoginForm onSubmit={() => Alert.alert('TrocaPlantão', 'Entrando...')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#0F1923',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  section: {
    marginTop: 24,
  },
});
