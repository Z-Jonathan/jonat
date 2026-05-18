import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Minimal scaffold — UI only. Auth is not wired here (consumers currently use
// anonymous auth; merchants use the email-OTP flow at /merchant).
export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
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
          Create account
        </Text>
        <Text className="mt-2 text-base text-slate-400">
          Save deals and never miss one nearby.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#64748b"
          autoCapitalize="words"
          className="mt-8 rounded-lg bg-slate-800 px-4 py-4 text-white"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          inputMode="email"
          className="mt-3 rounded-lg bg-slate-800 px-4 py-4 text-white"
        />

        <Pressable
          accessibilityRole="button"
          className="mt-4 items-center rounded bg-white py-4 active:scale-[0.98] active:opacity-90"
        >
          <Text className="text-base font-semibold text-slate-900">
            Create account
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/login')}
          accessibilityRole="button"
          className="mt-6 items-center"
        >
          <Text className="text-sm text-slate-400">
            Already have an account?{' '}
            <Text className="font-semibold text-white">Log in</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
