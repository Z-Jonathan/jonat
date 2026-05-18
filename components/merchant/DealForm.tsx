import { addHours, endOfDay } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DEAL_CATEGORIES, type DealCategory } from '../../constants/categories';
import { track } from '../../lib/analytics';
import { createDeal, uploadDealImage } from '../../lib/merchant';
import type { Database } from '../../types/database';

type DiscountKind = Database['public']['Enums']['discount_kind'];

const DISCOUNTS: { value: DiscountKind; label: string }[] = [
  { value: 'bogo', label: 'BOGO' },
  { value: 'percent', label: '% off' },
  { value: 'fixed', label: '$ off' },
  { value: 'freebie', label: 'Free item' },
  { value: 'other', label: 'Other' },
];

type ExpiryChoice = '1h' | '2h' | '4h' | 'eod' | 'custom';
const EXPIRIES: { value: ExpiryChoice; label: string }[] = [
  { value: '1h', label: '1 hr' },
  { value: '2h', label: '2 hr' },
  { value: '4h', label: '4 hr' },
  { value: 'eod', label: 'End of day' },
  { value: 'custom', label: 'Custom' },
];

function expiresAtISO(choice: ExpiryChoice, customHours: number): string {
  const now = new Date();
  switch (choice) {
    case '1h':
      return addHours(now, 1).toISOString();
    case '2h':
      return addHours(now, 2).toISOString();
    case '4h':
      return addHours(now, 4).toISOString();
    case 'eod':
      return endOfDay(now).toISOString();
    case 'custom':
      return addHours(now, Math.max(1, customHours)).toISOString();
  }
}

// Defaults are pre-selected so a returning merchant can type a title and
// submit in well under 15s; chips refine from there.
export function DealForm({
  storeId,
  storeName,
  onPosted,
}: {
  storeId: string;
  storeName: string;
  onPosted: () => void;
}) {
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState<DiscountKind>('other');
  const [category, setCategory] = useState<DealCategory>('other');
  const [expiry, setExpiry] = useState<ExpiryChoice>('2h');
  const [customHours, setCustomHours] = useState('3');
  const [asset, setAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo permission denied — you can still post without one.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled) setAsset(res.assets[0]);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (asset) {
        imageUrl = await uploadDealImage(asset.uri, asset.mimeType ?? null);
      }
      const dealId = await createDeal({
        storeId,
        title,
        discountType: discount,
        category,
        expiresAt: expiresAtISO(expiry, Number(customHours) || 3),
        imageUrl,
      });
      track('merchant_posted', { store_id: storeId, deal_id: dealId });
      // Reset the fast path; keep store context.
      setTitle('');
      setAsset(null);
      setPosted(true);
      onPosted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post the deal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 18 }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text className="text-2xl font-extrabold text-white">Post a deal</Text>
        <Text className="mt-1 text-sm text-slate-400">for {storeName}</Text>
      </View>

      <View>
        <Label>Deal</Label>
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setPosted(false);
          }}
          placeholder="e.g. BOGO Tacos"
          placeholderTextColor="#94a3b8"
          className="rounded-xl bg-slate-800 px-4 py-3 text-lg text-white"
        />
      </View>

      <ChipGroup label="Discount">
        {DISCOUNTS.map((d) => (
          <Chip
            key={d.value}
            label={d.label}
            active={discount === d.value}
            onPress={() => setDiscount(d.value)}
          />
        ))}
      </ChipGroup>

      <ChipGroup label="Category">
        {DEAL_CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            label={c.label}
            active={category === c.value}
            onPress={() => setCategory(c.value)}
          />
        ))}
      </ChipGroup>

      <ChipGroup label="Expires in">
        {EXPIRIES.map((e) => (
          <Chip
            key={e.value}
            label={e.label}
            active={expiry === e.value}
            onPress={() => setExpiry(e.value)}
          />
        ))}
      </ChipGroup>

      {expiry === 'custom' ? (
        <View className="flex-row items-center gap-2">
          <Text className="text-slate-300">Hours from now:</Text>
          <TextInput
            value={customHours}
            onChangeText={setCustomHours}
            keyboardType="number-pad"
            className="w-20 rounded-xl bg-slate-800 px-3 py-2 text-center text-white"
          />
        </View>
      ) : null}

      <View>
        <Label>Photo (optional)</Label>
        <Pressable
          onPress={pickPhoto}
          className="overflow-hidden rounded-xl bg-slate-800"
        >
          {asset ? (
            <Image
              source={{ uri: asset.uri }}
              className="h-40 w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-20 items-center justify-center">
              <Text className="text-slate-400">+ Add a photo</Text>
            </View>
          )}
        </Pressable>
      </View>

      {error ? (
        <Text className="text-sm text-urgent">{error}</Text>
      ) : null}
      {posted ? (
        <Text className="text-sm font-semibold text-emerald-400">
          Posted — it’s live in the feed now.
        </Text>
      ) : null}

      <Pressable
        disabled={busy || title.trim().length === 0}
        onPress={submit}
        className={`items-center rounded-full bg-white py-4 ${
          busy || title.trim().length === 0 ? 'opacity-50' : ''
        }`}
      >
        {busy ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text className="text-base font-bold text-slate-900">
            Post deal
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </Text>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Label>{label}</Label>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`rounded-full border px-4 py-2 ${
        active ? 'border-white bg-white' : 'border-slate-600'
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          active ? 'text-slate-900' : 'text-slate-300'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
