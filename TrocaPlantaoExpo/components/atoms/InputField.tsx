import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export function InputField({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#596579"
      style={[styles.base, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: '#596579',
    borderRadius: 8,
    padding: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
});
