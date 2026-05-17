import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealForm } from '../../components/merchant/DealForm';
import { MerchantAuth } from '../../components/merchant/MerchantAuth';
import { StoreSetup } from '../../components/merchant/StoreSetup';
import { useMerchantSession } from '../../hooks/useMerchantSession';
import { signOutMerchant } from '../../lib/merchant';

export default function MerchantPostScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { phase, context, reload } = useMerchantSession();

  // A freshly posted deal should appear in the consumer feed/search "immediately".
  const refreshConsumerData = () => {
    void qc.invalidateQueries({ queryKey: ['nearbyDeals'] });
    void qc.invalidateQueries({ queryKey: ['searchDeals'] });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to app"
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-800"
        >
          <Text className="text-lg text-slate-200">‹</Text>
        </Pressable>
        {phase === 'ready' || phase === 'setup' ? (
          <Pressable
            onPress={async () => {
              await signOutMerchant();
              await reload();
            }}
            className="h-9 items-center justify-center rounded-full bg-slate-800 px-3"
          >
            <Text className="text-sm text-slate-300">Sign out</Text>
          </Pressable>
        ) : null}
      </View>

      {phase === 'loading' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : phase === 'auth' ? (
        <MerchantAuth onAuthed={reload} />
      ) : phase === 'setup' && context ? (
        <StoreSetup email={context.email} onReady={reload} />
      ) : phase === 'ready' && context?.store ? (
        <DealForm
          storeId={context.store.id}
          storeName={context.store.name}
          onPosted={refreshConsumerData}
        />
      ) : null}
    </SafeAreaView>
  );
}
