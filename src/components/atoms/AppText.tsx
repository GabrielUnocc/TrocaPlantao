import { Text, StyleSheet } from 'react-native';

type Props = {
  variant?: 'title' | 'body' | 'caption';
  children: React.ReactNode;
};

export function AppText({ variant = 'body', children }: Props) {
  return <Text style={styles[variant]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  caption: {
    fontSize: 12,
    color: '#596579',
  },
});
