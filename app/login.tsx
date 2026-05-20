import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Scaffold: consumer auth not wired (merchants OTP via /merchant). The
// simulated send below keeps the loading state honest until it lands.
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submittedRef = useRef(false);

  const trimmed = email.trim();
  const isValidEmail = EMAIL_RE.test(trimmed);

  const validate = () => {
    if (!trimmed) {
      setError('Enter your email to continue.');
      return false;
    }
    if (!isValidEmail) {
      setError('That doesn’t look like a valid email.');
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async () => {
    submittedRef.current = true;
    if (!validate() || busy) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      router.replace('/home');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-7 py-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="py-1 active:opacity-60"
          >
            <Text className="text-base text-slate-400">‹ Back</Text>
          </Pressable>
        </View>

        <View className="flex-1 justify-between px-7 pb-10 pt-8">
          <View>
            <Text className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </Text>
            <Text className="mt-2 text-base text-slate-400">
              Log in to pick up where you left off.
            </Text>

            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError(null);
              }}
              onBlur={() => {
                if (submittedRef.current || trimmed.length > 0) validate();
              }}
              editable={!busy}
              placeholder="you@example.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              inputMode="email"
              returnKeyType="go"
              onSubmitEditing={submit}
              accessibilityLabel="Email address"
              accessibilityHint="We’ll email you a 6-digit code"
              className={`mt-8 rounded-lg bg-slate-800 px-4 py-4 text-white ${
                error ? 'border border-urgent' : ''
              }`}
            />
            {error ? (
              <Text
                accessibilityLiveRegion="polite"
                className="mt-2 text-sm text-urgent"
              >
                {error}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="mb-3 text-center text-sm text-slate-500">
              We’ll email you a 6-digit code to sign in.
            </Text>
            <Pressable
              onPress={submit}
              disabled={!isValidEmail || busy}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isValidEmail || busy, busy }}
              accessibilityLabel={busy ? 'Sending code' : 'Continue'}
              className={`h-14 items-center justify-center rounded bg-white active:scale-[0.98] active:opacity-90 ${
                !isValidEmail || busy ? 'opacity-40' : ''
              }`}
            >
              {busy ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text className="text-base font-semibold text-slate-900">
                  Continue
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/signup')}
              disabled={busy}
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`mt-6 items-center active:opacity-60 ${busy ? 'opacity-40' : ''}`}
            >
              <Text className="text-sm text-slate-400">
                New here?{' '}
                <Text className="font-semibold text-white">Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
