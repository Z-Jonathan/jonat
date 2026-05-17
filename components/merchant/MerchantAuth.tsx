import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { requestEmailOtp, verifyEmailOtp } from '../../lib/merchant';

// Email OTP code flow — merchant enters email, gets a 6-digit code, types it
// back. No deep-link handling.
export function MerchantAuth({ onAuthed }: { onAuthed: () => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await requestEmailOtp(email);
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      await verifyEmailOtp(email, code);
      onAuthed();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="text-2xl font-extrabold text-white">
        Merchant sign-in
      </Text>
      <Text className="mt-1 text-sm text-slate-400">
        {step === 'email'
          ? 'We’ll email you a one-time code.'
          : `Enter the code we sent to ${email}.`}
      </Text>

      {step === 'email' ? (
        <>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@business.com"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            inputMode="email"
            className="mt-5 rounded-xl bg-slate-800 px-4 py-3 text-white"
          />
          <PrimaryButton
            label="Send code"
            busy={busy}
            disabled={email.trim().length < 3}
            onPress={sendCode}
          />
        </>
      ) : (
        <>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="6-digit code"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            inputMode="numeric"
            className="mt-5 rounded-xl bg-slate-800 px-4 py-3 text-center text-lg tracking-[8px] text-white"
          />
          <PrimaryButton
            label="Verify"
            busy={busy}
            disabled={code.trim().length < 6}
            onPress={verify}
          />
          <Pressable
            onPress={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
            className="mt-3 items-center"
          >
            <Text className="text-sm text-slate-400">Use a different email</Text>
          </Pressable>
        </>
      )}

      {error ? (
        <Text className="mt-4 text-center text-sm text-urgent">{error}</Text>
      ) : null}
    </View>
  );
}

function PrimaryButton({
  label,
  busy,
  disabled,
  onPress,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={busy || disabled}
      onPress={onPress}
      className={`mt-4 items-center rounded-full bg-white py-3 ${
        busy || disabled ? 'opacity-50' : ''
      }`}
    >
      {busy ? (
        <ActivityIndicator color="#0f172a" />
      ) : (
        <Text className="font-semibold text-slate-900">{label}</Text>
      )}
    </Pressable>
  );
}
