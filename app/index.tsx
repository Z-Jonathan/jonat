import { Text, View } from 'react-native';

// Placeholder screen for Step 1 — verifies NativeWind classes render.
export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-brand px-6">
      <Text className="text-4xl font-extrabold tracking-tight text-white">
        Dibs
      </Text>
      <Text className="mt-2 text-center text-base text-slate-300">
        Real-time deals from local spots — grab them before they&apos;re gone.
      </Text>

      <View className="mt-8 flex-row gap-3">
        <View className="rounded-full bg-urgent px-4 py-2">
          <Text className="text-sm font-semibold text-white">‹ 2h left</Text>
        </View>
        <View className="rounded-full bg-soon px-4 py-2">
          <Text className="text-sm font-semibold text-white">‹ 24h left</Text>
        </View>
      </View>

      <Text className="mt-10 text-xs uppercase tracking-widest text-emerald-400">
        NativeWind is working
      </Text>
    </View>
  );
}
