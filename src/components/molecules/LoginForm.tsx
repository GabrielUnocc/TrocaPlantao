import { View } from 'react-native';
import { InputField } from '../atoms/InputField';
import { PrimaryButton } from '../atoms/PrimaryButton';

type Props = {
  onSubmit: () => void;
};

export function LoginForm({ onSubmit }: Props) {
  return (
    <View>
      <InputField placeholder="E-mail" keyboardType="email-address" autoCapitalize="none" />
      <InputField placeholder="Senha" secureTextEntry />
      <PrimaryButton title="Entrar" onPress={onSubmit} />
    </View>
  );
}
