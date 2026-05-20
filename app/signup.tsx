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

type FieldErrors = { name?: string; email?: string };

// Scaffold: consumer auth not wired (merchants OTP via /merchant). The
// simulated send below keeps the loading state honest until it lands.
export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const submittedRef = useRef(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isValidName = trimmedName.length >= 2;
  const isValidEmail = EMAIL_RE.test(trimmedEmail);
  const canSubmit = isValidName && isValidEmail && !busy;

  const validate = (only?: 'name' | 'email'): boolean => {
    const next: FieldErrors = { ...errors };
    if (!only || only === 'name') {
      if (!trimmedName) next.name = 'What should we call you?';
      else if (!isValidName) next.name = 'Use at least 2 characters.';
      else delete next.name;
    }
    if (!only || only === 'email') {
      if (!trimmedEmail) next.email = 'Enter your email to continue.';
      else if (!isValidEmail)
        next.email = 'That doesn’t look like a valid email.';
      else delete next.email;
    }
    setErrors(next);
    return !next.name && !next.email;
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
              Create account
            </Text>
            <Text className="mt-2 text-base text-slate-400">
              Save deals and never miss one nearby.
            </Text>

            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              onBlur={() => {
                if (submittedRef.current || trimmedName.length > 0)
                  validate('name');
              }}
              editable={!busy}
              placeholder="Name"
              placeholderTextColor="#64748b"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              accessibilityLabel="Your name"
              className={`mt-8 rounded-lg bg-slate-800 px-4 py-4 text-white ${
                errors.name ? 'border border-urgent' : ''
              }`}
            />
            {errors.name ? (
              <Text
                accessibilityLiveRegion="polite"
                className="mt-2 text-sm text-urgent"
              >
                {errors.name}
              </Text>
            ) : null}

            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              onBlur={() => {
                if (submittedRef.current || trimmedEmail.length > 0)
                  validate('email');
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
              className={`mt-3 rounded-lg bg-slate-800 px-4 py-4 text-white ${
                errors.email ? 'border border-urgent' : ''
              }`}
            />
            {errors.email ? (
              <Text
                accessibilityLiveRegion="polite"
                className="mt-2 text-sm text-urgent"
              >
                {errors.email}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="mb-3 text-center text-sm text-slate-500">
              We’ll email you a 6-digit code to confirm it’s you.
            </Text>
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit, busy }}
              accessibilityLabel={busy ? 'Creating account' : 'Create account'}
              className={`h-14 items-center justify-center rounded bg-white active:scale-[0.98] active:opacity-90 ${
                !canSubmit ? 'opacity-40' : ''
              }`}
            >
              {busy ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text className="text-base font-semibold text-slate-900">
                  Create account
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/login')}
              disabled={busy}
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`mt-6 items-center active:opacity-60 ${busy ? 'opacity-40' : ''}`}
            >
              <Text className="text-sm text-slate-400">
                Already have an account?{' '}
                <Text className="font-semibold text-white">Log in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
