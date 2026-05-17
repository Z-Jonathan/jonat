import { Stack } from 'expo-router';

// Merchant flow lives outside the consumer tab bar.
export default function MerchantLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
