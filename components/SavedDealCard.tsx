import { Pressable, Text, View } from 'react-native';

import { categoryLabel } from '../constants/categories';
import type { SavedDeal } from '../lib/queries';
import { formatTimeLeft, getUrgency } from '../lib/time';

type Props = {
  saved: SavedDeal;
  now: Date;
  onPress: () => void;
};

// Saved deals intentionally stay visible after they expire (or get removed) so
// users see what they missed — never silently dropped.
export function SavedDealCard({ saved, now, onPress }: Props) {
  const deal = saved.deal;

  if (!deal) {
    return (
      <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <Text className="text-sm text-slate-500">
          This deal is no longer available.
        </Text>
      </View>
    );
  }

  const urgency = getUrgency(deal.expires_at, now);
  const expired = urgency === 'expired';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`rounded-2xl border-l-4 bg-white p-4 ${
        expired ? 'border-l-slate-300 opacity-60' : 'border-l-soon'
      }`}
    >
      <View className="flex-row items-start justify-between gap-2">
        <Text className="flex-1 text-base font-bold text-slate-900">
          {deal.title}
        </Text>
        <View className="rounded-full bg-slate-100 px-2 py-0.5">
          <Text className="text-[11px] font-medium text-slate-600">
            {categoryLabel(deal.category)}
          </Text>
        </View>
      </View>

      <Text className="mt-0.5 text-sm text-slate-500" numberOfLines={1}>
        {deal.store?.name ?? 'Unknown store'}
      </Text>

      <View className="mt-2 flex-row">
        <View
          className={`rounded-full px-2.5 py-1 ${
            expired ? 'bg-slate-200' : 'bg-soon'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              expired ? 'text-slate-600' : 'text-white'
            }`}
          >
            {expired ? 'Expired' : formatTimeLeft(deal.expires_at, now)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
