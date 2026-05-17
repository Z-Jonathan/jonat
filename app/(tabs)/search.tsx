import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealCard } from '../../components/DealCard';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNow } from '../../hooks/useNow';
import { searchDeals } from '../../lib/queries';

const MIN_CHARS = 2;

export default function SearchScreen() {
  const router = useRouter();
  const now = useNow();
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term, 300);
  const ready = debounced.trim().length >= MIN_CHARS;

  const searchQuery = useQuery({
    queryKey: ['searchDeals', debounced.trim()],
    enabled: ready,
    queryFn: () => searchDeals(debounced),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <View className="gap-3 px-4 pb-3 pt-2">
        <Text className="text-2xl font-extrabold text-white">Search</Text>
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="Deals or store names…"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="rounded-xl bg-slate-800 px-4 py-3 text-white"
        />
      </View>

      {!ready ? (
        <View className="mt-24 items-center px-8">
          <Text className="text-center text-base text-slate-300">
            Type at least {MIN_CHARS} characters to search.
          </Text>
        </View>
      ) : searchQuery.isPending ? (
        <View className="mt-24 items-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : searchQuery.isError ? (
        <View className="mt-24 items-center px-8">
          <Text className="text-center text-slate-300">
            Search failed. Try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchQuery.data}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <DealCard
              deal={item}
              now={now}
              onPress={() =>
                router.push({
                  pathname: '/deal/[id]',
                  params: { id: item.id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="mt-24 items-center px-8">
              <Text className="text-center text-base text-slate-300">
                No deals match “{debounced.trim()}”.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
