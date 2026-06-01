// Cross-platform dialog wrapper. Drop-in replacement for React Native's `Alert`.
//
// On native (iOS/Android) — delegates to RN Alert.alert (full feature parity).
// On web — RN's Alert.alert is a no-op, so we fall back to window.alert /
// window.confirm so confirmation dialogs (logout, cancel booking, etc.) still
// work.
//
// Usage: `import Alert from '../utils/dialog';` then call `Alert.alert(...)`
// exactly like the React Native API.
import { Alert as RNAlert, Platform } from 'react-native';

/**
 * @param {string} title
 * @param {string} [message]
 * @param {{text: string, onPress?: () => void, style?: 'cancel'|'destructive'|'default'}[]} [buttons]
 */
function alert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    return RNAlert.alert(title, message, buttons);
  }

  const text = [title, message].filter(Boolean).join('\n\n');

  // No buttons / single button → simple notice
  if (!buttons || buttons.length === 0) {
    if (typeof window !== 'undefined') window.alert(text);
    return;
  }

  if (buttons.length === 1) {
    if (typeof window !== 'undefined') window.alert(text);
    buttons[0].onPress && buttons[0].onPress();
    return;
  }

  // 2+ buttons → confirm dialog. Cancel = first cancel-style (or first); Confirm
  // = first non-cancel-style (or last).
  const cancelBtn = buttons.find(b => b.style === 'cancel') || buttons[0];
  const confirmBtn = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];

  const accepted = typeof window !== 'undefined' ? window.confirm(text) : true;
  if (accepted) {
    confirmBtn.onPress && confirmBtn.onPress();
  } else {
    cancelBtn.onPress && cancelBtn.onPress();
  }
}

const Alert = { alert };
export default Alert;
