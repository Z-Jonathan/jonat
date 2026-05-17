import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useEffect } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealDetailSkeleton } from '../../components/Skeleton';
import { useNow } from '../../hooks/useNow';
import { track } from '../../lib/analytics';
import { formatDistanceMiles, haversineMeters } from '../../lib/geo';
import { useLocationStore } from '../../lib/locationStore';
import {
  getDealById,
  isDealSaved,
  saveDeal,
  unsaveDeal,
  type DealDetail,
} from '../../lib/queries';
import { formatTimeLeft, getUrgency, type Urgency } from '../../lib/time';
import type { Json } from '../../types/database';

const TIME_COLOR: Record<Urgency, string> = {
  expired: 'text-slate-400',
  urgent: 'text-urgent',
  soon: 'text-soon',
  normal: 'text-slate-700',
};

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const now = useNow();
  const coords = useLocationStore((s) => s.coords);

  const dealQuery = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDealById(id),
    enabled: !!id,
  });

  const savedQuery = useQuery({
    queryKey: ['dealSaved', id],
    queryFn: () => isDealSaved(id),
    enabled: !!id,
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (savedQuery.data) {
        await unsaveDeal(id);
      } else {
        await saveDeal(id);
        track('deal_saved', { deal_id: id });
      }
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['dealSaved', id] });
      const prev = qc.getQueryData<boolean>(['dealSaved', id]);
      qc.setQueryData(['dealSaved', id], !prev);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['dealSaved', id], ctx?.prev ?? false);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['dealSaved', id] });
      void qc.invalidateQueries({ queryKey: ['savedDeals'] });
    },
  });

  const deal = dealQuery.data;

  // Fire once per viewed deal.
  useEffect(() => {
    if (deal?.id) track('deal_viewed', { deal_id: deal.id });
  }, [deal?.id]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
        >
          <Text className="text-lg text-slate-700">‹</Text>
        </Pressable>
        {deal ? (
          <Pressable
            onPress={() =>
              Share.share({
                message: `${deal.title} at ${deal.store_name} — grab it on Dibs before it's gone.`,
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Share deal"
            className="h-9 px-3 items-center justify-center rounded-full bg-slate-100"
          >
            <Text className="font-semibold text-slate-700">Share</Text>
          </Pressable>
        ) : null}
      </View>

      {dealQuery.isPending ? (
        <DealDetailSkeleton />
      ) : !deal ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-slate-600">
            This deal isn&apos;t available anymore.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 rounded-full bg-slate-900 px-5 py-2"
          >
            <Text className="font-semibold text-white">Back to deals</Text>
          </Pressable>
        </View>
      ) : (
        <DealBody
          deal={deal}
          now={now}
          distanceMeters={
            coords
              ? haversineMeters(
                  coords.lat,
                  coords.lng,
                  deal.store_lat,
                  deal.store_lng,
                )
              : null
          }
          isSaved={savedQuery.data ?? false}
          onToggleSave={() => toggleSave.mutate()}
        />
      )}
    </SafeAreaView>
  );
}

function DealBody({
  deal,
  now,
  distanceMeters,
  isSaved,
  onToggleSave,
}: {
  deal: DealDetail;
  now: Date;
  distanceMeters: number | null;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const urgency = getUrgency(deal.expires_at, now);
  const expires = new Date(deal.expires_at);

  const openDirections = () => {
    track('directions_tapped', { deal_id: deal.id });
    const url = `https://www.google.com/maps/dir/?api=1&destination=${deal.store_lat},${deal.store_lng}`;
    void Linking.openURL(url);
  };

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {deal.image_url ? (
          <Image
            source={{ uri: deal.image_url }}
            className="h-56 w-full bg-slate-100"
            resizeMode="cover"
          />
        ) : null}

        <View className="gap-4 px-5 pt-4">
          <View>
            <Text className="text-2xl font-extrabold text-slate-900">
              {deal.title}
            </Text>
            <Text className="mt-1 text-base text-slate-500">
              {deal.store_name}
              {distanceMeters != null
                ? ` · ${formatDistanceMiles(distanceMeters)}`
                : ''}
            </Text>
          </View>

          <View>
            <Text className={`text-base font-semibold ${TIME_COLOR[urgency]}`}>
              {formatTimeLeft(deal.expires_at, now)}
            </Text>
            <Text className="mt-0.5 text-sm text-slate-500">
              Expires {format(expires, "EEE, MMM d 'at' h:mm a")}
            </Text>
          </View>

          {deal.description ? (
            <Section title="Details">
              <Text className="text-[15px] leading-5 text-slate-700">
                {deal.description}
              </Text>
            </Section>
          ) : null}

          {deal.terms ? (
            <Section title="Fine print">
              <Text className="text-sm leading-5 text-slate-500">
                {deal.terms}
              </Text>
            </Section>
          ) : null}

          <Section title="Where">
            <Text className="text-[15px] text-slate-700">
              {deal.store_address}
            </Text>
            <Hours hours={deal.store_hours} />
          </Section>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 border-t border-slate-100 px-5 py-3">
        <Pressable
          onPress={onToggleSave}
          accessibilityRole="button"
          className="items-center justify-center rounded-full border border-slate-300 px-5 py-3"
        >
          <Text className="font-semibold text-slate-800">
            {isSaved ? '♥ Saved' : '♡ Save'}
          </Text>
        </Pressable>
        <Pressable
          onPress={openDirections}
          accessibilityRole="button"
          className="flex-1 items-center justify-center rounded-full bg-slate-900 py-3"
        >
          <Text className="font-semibold text-white">Get Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </Text>
      {children}
    </View>
  );
}

// store_hours is merchant-defined jsonb (no fixed schema). Best-effort: render
// a flat { label: value } object; skip anything else.
function Hours({ hours }: { hours: Json | null }) {
  if (!hours || typeof hours !== 'object' || Array.isArray(hours)) return null;
  const entries = Object.entries(hours);
  if (entries.length === 0) return null;
  return (
    <View className="mt-1 gap-0.5">
      {entries.map(([day, value]) => (
        <Text key={day} className="text-sm text-slate-600">
          <Text className="capitalize text-slate-500">{day}: </Text>
          {String(value)}
        </Text>
      ))}
    </View>
  );
}
