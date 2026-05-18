import { Link, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-brand px-8">
        <Text className="text-xl font-bold text-white">Page not found</Text>
        <Text className="mt-2 text-center text-slate-300">
          That screen doesn&apos;t exist.
        </Text>
        <Link href="/" asChild>
          <Pressable className="mt-6 rounded-full bg-white px-6 py-3">
            <Text className="font-semibold text-slate-900">Back to deals</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
