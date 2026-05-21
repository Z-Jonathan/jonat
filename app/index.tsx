import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <View className="flex-1 justify-between px-7 pb-10 pt-12">
        <View className="flex-1 justify-center">
          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel="Walking-distance good"
          >
            <Text className="text-2xl font-light tracking-tight text-paper">
              Walking-distance
            </Text>
            <Text className="text-8xl font-black leading-none tracking-tight text-paper">
              good.
            </Text>
          </View>

          <Text className="mt-10 text-base leading-6 text-slate-400">
            Croissants this morning. Pints at five. Tacos at ten.
          </Text>
        </View>

        <View className="gap-3">
          <Pressable
            onPress={() => router.push('/signup')}
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded bg-white active:scale-[0.98] active:opacity-90"
          >
            <Text className="text-base font-semibold text-slate-900">
              Sign up
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded border border-slate-700 active:opacity-60"
          >
            <Text className="text-base font-semibold text-white">Log in</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
