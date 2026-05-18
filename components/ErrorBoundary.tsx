import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Catches render-time crashes anywhere in the tree and shows a friendly
// fallback instead of a white screen. (Async/query errors are handled inline
// per-screen; this is the last-resort net.)
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center bg-brand px-8">
        <Text className="text-xl font-bold text-white">
          Something went wrong
        </Text>
        <Text className="mt-2 text-center text-slate-300">
          The app hit an unexpected error. Try again.
        </Text>
        <Pressable
          onPress={this.reset}
          accessibilityRole="button"
          className="mt-6 rounded-full bg-white px-6 py-3"
        >
          <Text className="font-semibold text-slate-900">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
