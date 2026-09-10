import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { InputField } from '@/components/atoms/InputField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';

export default function RegisterScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [crm, setCrm] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  function handleCadastro() {
    if (!nome || !crm || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    Alert.alert('Sucesso', 'Cadastro realizado! Faça login para continuar.', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Dados Pessoais</Text>
          <InputField
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />
          <InputField
            placeholder="CRM (ex: CRM-SP 12345)"
            value={crm}
            onChangeText={setCrm}
            autoCapitalize="characters"
          />

          <Text style={styles.sectionLabel}>Acesso</Text>
          <InputField
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            placeholder="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
          <InputField
            placeholder="Confirmar senha"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          <PrimaryButton title="Criar Conta" onPress={handleCadastro} />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
            <Text style={styles.linkText}>Já tem conta? </Text>
            <Text style={styles.linkAction}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#2775F6',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#596579',
  },
  card: {
    backgroundColor: '#162030',
    borderRadius: 16,
    padding: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#596579',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#596579',
    fontSize: 14,
  },
  linkAction: {
    color: '#2775F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
