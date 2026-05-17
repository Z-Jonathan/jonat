import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedDealCard } from '../../components/AnimatedDealCard';
import { CategoryChips } from '../../components/CategoryChips';
import { RadiusPicker } from '../../components/RadiusPicker';
import { DealListSkeleton } from '../../components/Skeleton';
import { useLocation } from '../../hooks/useLocation';
import { useNow } from '../../hooks/useNow';
import { useRealtimeDeals } from '../../hooks/useRealtimeDeals';
import { milesToMeters } from '../../lib/geo';
import { useLocationStore } from '../../lib/locationStore';
import { getNearbyDeals, type NearbyDeal } from '../../lib/queries';

export default function HomeScreen() {
  const router = useRouter();
  const now = useNow();
  const { status, errorMsg, requestLocation, setManualLocation } =
    useLocation();

  const coords = useLocationStore((s) => s.coords);
  const radiusMiles = useLocationStore((s) => s.radiusMiles);
  const setRadiusMiles = useLocationStore((s) => s.setRadiusMiles);
  const categories = useLocationStore((s) => s.categories);
  const toggleCategory = useLocationStore((s) => s.toggleCategory);
  const clearCategories = useLocationStore((s) => s.clearCategories);

  const dealsQuery = useQuery({
    queryKey: [
      'nearbyDeals',
      coords?.lat,
      coords?.lng,
      radiusMiles,
      categories,
    ],
    enabled: coords != null,
    queryFn: () =>
      getNearbyDeals({
        lat: coords!.lat,
        lng: coords!.lng,
        radiusMeters: milesToMeters(radiusMiles),
        categories,
      }),
  });

  // Realtime-inserted deals are held locally and prepended; expired cards are
  // hidden after their fade-out. Both reset whenever the server data is
  // refreshed or the filters change (the fresh fetch already reflects them).
  const [liveDeals, setLiveDeals] = useState<NearbyDeal[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const dataUpdatedAt = dealsQuery.dataUpdatedAt;
  useEffect(() => {
    setLiveDeals([]);
    setHiddenIds(new Set());
  }, [dataUpdatedAt, coords?.lat, coords?.lng, radiusMiles, categories]);

  const handleNewDeal = useCallback((deal: NearbyDeal) => {
    setLiveDeals((prev) =>
      prev.some((d) => d.id === deal.id) ? prev : [deal, ...prev],
    );
  }, []);

  useRealtimeDeals({ enabled: coords != null, onNewDeal: handleNewDeal });

  const handleExpire = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Live deals first, then server results; de-duped by id, expired removed.
  const feedData = useMemo(() => {
    const seen = new Set<string>();
    const merged: NearbyDeal[] = [];
    for (const d of [...liveDeals, ...(dealsQuery.data ?? [])]) {
      if (seen.has(d.id) || hiddenIds.has(d.id)) continue;
      seen.add(d.id);
      merged.push(d);
    }
    return merged;
  }, [liveDeals, dealsQuery.data, hiddenIds]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <View className="gap-3 px-4 pb-3 pt-2">
        <Text className="text-2xl font-extrabold text-white">Dibs</Text>
        <RadiusPicker value={radiusMiles} onChange={setRadiusMiles} />
        <CategoryChips
          selected={categories}
          onToggle={toggleCategory}
          onClear={clearCategories}
        />
      </View>

      {coords == null ? (
        <LocationGate
          status={status}
          errorMsg={errorMsg}
          onRetry={requestLocation}
          onManual={setManualLocation}
        />
      ) : dealsQuery.isPending ? (
        <DealListSkeleton />
      ) : dealsQuery.isError ? (
        <Centered>
          <Text className="text-center text-slate-300">
            Couldn&apos;t load deals.
          </Text>
          <Pressable
            onPress={() => dealsQuery.refetch()}
            className="mt-4 rounded-full bg-white px-5 py-2"
          >
            <Text className="font-semibold text-slate-900">Try again</Text>
          </Pressable>
        </Centered>
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <AnimatedDealCard
              deal={item}
              now={now}
              onExpire={handleExpire}
              onPress={() =>
                router.push({
                  pathname: '/deal/[id]',
                  params: { id: item.id },
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={dealsQuery.isRefetching}
              onRefresh={() => dealsQuery.refetch()}
              tintColor="#ffffff"
            />
          }
          ListEmptyComponent={
            <View className="mt-24 items-center px-8">
              <Text className="text-center text-base text-slate-300">
                No deals nearby right now — try expanding your radius.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center px-8">{children}</View>
  );
}

function LocationGate({
  status,
  errorMsg,
  onRetry,
  onManual,
}: {
  status: ReturnType<typeof useLocation>['status'];
  errorMsg: string | null;
  onRetry: () => void;
  onManual: (query: string) => Promise<boolean>;
}) {
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'loading' || status === 'idle') {
    return (
      <Centered>
        <ActivityIndicator color="#ffffff" />
        <Text className="mt-3 text-slate-300">Getting your location…</Text>
      </Centered>
    );
  }

  // denied | error: offer a manual city fallback.
  return (
    <Centered>
      <Text className="text-center text-base text-slate-200">
        {errorMsg ?? 'We need a location to show nearby deals.'}
      </Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Enter a city or address"
        placeholderTextColor="#94a3b8"
        autoCapitalize="words"
        returnKeyType="search"
        onSubmitEditing={async () => {
          setBusy(true);
          await onManual(city);
          setBusy(false);
        }}
        className="mt-5 w-full rounded-xl bg-slate-800 px-4 py-3 text-white"
      />
      <View className="mt-3 flex-row gap-3">
        <Pressable
          onPress={onRetry}
          className="rounded-full border border-slate-600 px-5 py-2"
        >
          <Text className="font-semibold text-slate-200">Use GPS</Text>
        </Pressable>
        <Pressable
          disabled={busy || city.trim().length === 0}
          onPress={async () => {
            setBusy(true);
            await onManual(city);
            setBusy(false);
          }}
          className={`rounded-full bg-white px-5 py-2 ${
            busy || city.trim().length === 0 ? 'opacity-50' : ''
          }`}
        >
          <Text className="font-semibold text-slate-900">
            {busy ? 'Searching…' : 'Search'}
          </Text>
        </Pressable>
      </View>
    </Centered>
  );
}
