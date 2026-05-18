import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Minimalist landing: one wordmark, one line of intent, two clear actions.
// Lots of negative space; a single accent; no ornamentation.
export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <View className="flex-1 justify-between px-7 py-10">
        {/* Brand block, optically centered in the upper space */}
        <View className="flex-1 justify-center">
          <Text className="text-5xl font-extrabold tracking-tight text-white">
            Dibs
          </Text>
          <Text className="mt-3 text-lg leading-6 text-slate-400">
            Local deals,{'\n'}before they&apos;re gone.
          </Text>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Pressable
            onPress={() => router.push('/signup')}
            accessibilityRole="button"
            className="items-center rounded bg-white py-4 active:scale-[0.98] active:opacity-90"
          >
            <Text className="text-base font-semibold text-slate-900">
              Sign up
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            className="items-center rounded border border-slate-700 py-4 active:opacity-60"
          >
            <Text className="text-base font-semibold text-white">Log in</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
