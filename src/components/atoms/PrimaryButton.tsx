import { Pressable, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export function PrimaryButton({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: '#2775F6', padding: 14, borderRadius: 8 }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {title}
      </Text>
    </Pressable>
  );
}
