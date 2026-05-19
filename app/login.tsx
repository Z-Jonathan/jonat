import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Minimal scaffold — UI only. Auth is not wired here (consumers currently use
// anonymous auth; merchants use the email-OTP flow at /merchant).
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <View className="px-7 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="py-1 active:opacity-60"
        >
          <Text className="text-base text-slate-400">‹ Back</Text>
        </Pressable>
      </View>

      <View className="flex-1 px-7 pt-8">
        <Text className="text-3xl font-extrabold tracking-tight text-white">
          Welcome back
        </Text>
        <Text className="mt-2 text-base text-slate-400">
          Log in to pick up where you left off.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          inputMode="email"
          className="mt-8 rounded-lg bg-slate-800 px-4 py-4 text-white"
        />

        <Pressable
          onPress={() => router.replace('/home')}
          accessibilityRole="button"
          className="mt-4 items-center rounded bg-white py-4 active:scale-[0.98] active:opacity-90"
        >
          <Text className="text-base font-semibold text-slate-900">
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
