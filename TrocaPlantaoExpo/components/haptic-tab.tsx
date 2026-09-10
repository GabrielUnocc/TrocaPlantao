import * as Haptics from 'expo-haptics';
import { Pressable, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';

type TabBarButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'style'> & {
  href?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent) => void;
  onPressIn?: (e: GestureResponderEvent) => void;
};

export function HapticTab(props: TabBarButtonProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
