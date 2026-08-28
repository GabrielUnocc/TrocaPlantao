import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ComponentesDemo } from './src/screens/ComponentesDemo';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F1923" />
      <ComponentesDemo />
    </SafeAreaProvider>
  );
}

export default App;
