import * as Location from 'expo-location';
import { type ComponentProps, type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { setupMerchantStore } from '../../lib/merchant';

// One-time setup for first-time merchants. Address is geocoded to a point so
// the store shows up in the consumer's nearby feed.
export function StoreSetup({
  email,
  onReady,
}: {
  email: string;
  onReady: () => void;
}) {
  const [merchantName, setMerchantName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    merchantName.trim() && storeName.trim() && address.trim() && !busy;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const results = await Location.geocodeAsync(address.trim());
      const first = results[0];
      if (!first) {
        setError("Couldn't find that address — try a more specific one.");
        return;
      }
      await setupMerchantStore({
        merchantName: merchantName.trim(),
        email,
        storeName: storeName.trim(),
        address: address.trim(),
        lat: first.latitude,
        lng: first.longitude,
        phone: phone.trim() || null,
        hoursText: hours.trim() || null,
      });
      onReady();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-extrabold text-white">
        Set up your store
      </Text>
      <Text className="mt-1 text-sm text-slate-400">
        One time only — we’ll reuse this every time you post.
      </Text>

      <Field label="Business / owner name">
        <Input value={merchantName} onChangeText={setMerchantName} />
      </Field>
      <Field label="Store name">
        <Input value={storeName} onChangeText={setStoreName} />
      </Field>
      <Field label="Address">
        <Input
          value={address}
          onChangeText={setAddress}
          placeholder="123 Main St, City, State"
        />
      </Field>
      <Field label="Phone (optional)">
        <Input
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </Field>
      <Field label="Hours (optional)">
        <Input
          value={hours}
          onChangeText={setHours}
          placeholder="Mon–Sat 9–6"
        />
      </Field>

      {error ? (
        <Text className="mt-4 text-sm text-urgent">{error}</Text>
      ) : null}

      <Pressable
        disabled={!canSubmit}
        onPress={submit}
        className={`mt-6 items-center rounded-full bg-white py-3 ${
          !canSubmit ? 'opacity-50' : ''
        }`}
      >
        {busy ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text className="font-semibold text-slate-900">Save store</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </Text>
      {children}
    </View>
  );
}

function Input(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#94a3b8"
      className="rounded-xl bg-slate-800 px-4 py-3 text-white"
      {...props}
    />
  );
}
