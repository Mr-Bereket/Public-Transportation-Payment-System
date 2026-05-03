import { Alert, Platform, AlertButton } from 'react-native';

type ShowAlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export const showAlert = (
  title: string,
  message: string,
  buttons?: ShowAlertButton[]
) => {
  if (Platform.OS === 'web') {
    const formattedMessage = `${title}\n\n${message}`;

    if (!buttons || buttons.length === 0) {
      window.alert(formattedMessage);
      return;
    }

    if (buttons.length === 1) {
      window.alert(formattedMessage);
      buttons[0].onPress?.();
      return;
    }

    const confirmed = window.confirm(formattedMessage);
    const positive = buttons.find((button) => button.style !== 'cancel') ?? buttons[0];
    const negative = buttons.find((button) => button.style === 'cancel') ?? buttons[1];

    if (confirmed) {
      positive.onPress?.();
    } else {
      negative?.onPress?.();
    }
    return;
  }

  Alert.alert(title, message, buttons as AlertButton[]);
};
