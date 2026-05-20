import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <View className="flex-1 justify-between px-7 pb-10 pt-10">
        <View className="flex-1">
          <Text className="text-xs font-bold tracking-[0.3em] text-soon">
            DIBS
          </Text>

          <Text
            accessibilityRole="header"
            className="mt-14 text-6xl font-black leading-[1.02] tracking-tight text-white"
          >
            Local deals,{'\n'}before they’re{'\n'}
            <Text className="text-soon">gone.</Text>
          </Text>

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
