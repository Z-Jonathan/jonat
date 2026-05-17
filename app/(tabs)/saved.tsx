import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavedDealCard } from '../../components/SavedDealCard';
import { useNow } from '../../hooks/useNow';
import { getSavedDeals } from '../../lib/queries';

export default function SavedScreen() {
  const router = useRouter();
  const now = useNow();

  const savedQuery = useQuery({
    queryKey: ['savedDeals'],
    queryFn: getSavedDeals,
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <Text className="text-2xl font-extrabold text-white">Saved</Text>
        <Pressable
          onPress={() => router.push('/merchant/post')}
          accessibilityRole="button"
        >
          <Text className="text-sm font-semibold text-soon">
            Merchant? Post a deal →
          </Text>
        </Pressable>
      </View>

      {savedQuery.isPending ? (
        <View className="mt-24 items-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : savedQuery.isError ? (
        <View className="mt-24 items-center px-8">
          <Text className="text-center text-slate-300">
            Couldn&apos;t load your saved deals.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedQuery.data}
          keyExtractor={(item) => item.deal?.id ?? item.saved_at}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <SavedDealCard
              saved={item}
              now={now}
              onPress={() => {
                if (item.deal) {
                  router.push({
                    pathname: '/deal/[id]',
                    params: { id: item.deal.id },
                  });
                }
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={savedQuery.isRefetching}
              onRefresh={() => savedQuery.refetch()}
              tintColor="#ffffff"
            />
          }
          ListEmptyComponent={
            <View className="mt-24 items-center px-8">
              <Text className="text-center text-base text-slate-300">
                No saved deals yet — tap the heart on a deal to keep it here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
