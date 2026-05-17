import { Image, Pressable, Text, View } from 'react-native';

import { categoryLabel } from '../constants/categories';
import { formatDistanceMiles } from '../lib/geo';
import type { NearbyDeal } from '../lib/queries';
import { formatTimeLeft, getUrgency, type Urgency } from '../lib/time';

type Props = {
  deal: NearbyDeal;
  now: Date;
  onPress: () => void;
};

const ACCENT: Record<Urgency, string> = {
  expired: 'border-l-slate-300',
  urgent: 'border-l-urgent',
  soon: 'border-l-soon',
  normal: 'border-l-slate-200',
};

const COUNTDOWN_BG: Record<Urgency, string> = {
  expired: 'bg-slate-200',
  urgent: 'bg-urgent',
  soon: 'bg-soon',
  normal: 'bg-slate-100',
};

const COUNTDOWN_TEXT: Record<Urgency, string> = {
  expired: 'text-slate-600',
  urgent: 'text-white',
  soon: 'text-white',
  normal: 'text-slate-700',
};

export function DealCard({ deal, now, onPress }: Props) {
  const urgency = getUrgency(deal.expires_at, now);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row gap-3 rounded-2xl border-l-4 bg-white p-4 ${ACCENT[urgency]}`}
    >
      {deal.store_logo_url ? (
        <Image
          source={{ uri: deal.store_logo_url }}
          className="h-12 w-12 rounded-full bg-slate-100"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-200">
          <Text className="text-base font-bold text-slate-500">
            {deal.store_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="flex-1">
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
          {deal.store_name}
          {deal.distance_meters != null
            ? ` · ${formatDistanceMiles(deal.distance_meters)}`
            : ''}
        </Text>

        <View className="mt-2 flex-row">
          <View
            className={`rounded-full px-2.5 py-1 ${COUNTDOWN_BG[urgency]}`}
          >
            <Text
              className={`text-xs font-semibold ${COUNTDOWN_TEXT[urgency]}`}
            >
              {formatTimeLeft(deal.expires_at, now)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
