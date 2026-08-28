import { TextInput, TextInputProps } from 'react-native';

export function InputField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#596579"
      style={{
        borderWidth: 1,
        borderColor: '#596579',
        borderRadius: 8,
        padding: 14,
        color: '#FFFFFF',
        marginBottom: 12,
      }}
      {...props}
    />
  );
}
