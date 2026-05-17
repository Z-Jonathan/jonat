import { Pressable, ScrollView, Text, View } from 'react-native';

import { DEAL_CATEGORIES, type DealCategory } from '../constants/categories';

type Props = {
  selected: DealCategory[];
  onToggle: (category: DealCategory) => void;
  onClear: () => void;
};

// Multi-select chip row. No selection == "All" (the feed shows every
// category), so the leading chip just clears the filter.
export function CategoryChips({ selected, onToggle, onClear }: Props) {
  const allActive = selected.length === 0;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2 px-0.5">
        <Chip label="All" active={allActive} onPress={onClear} />
        {DEAL_CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            label={c.label}
            active={selected.includes(c.value)}
            onPress={() => onToggle(c.value)}
          />
        ))}
      </View>
    </ScrollView>
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
      className={`rounded-full border px-3 py-1.5 ${
        active ? 'border-white bg-white' : 'border-slate-600'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          active ? 'text-slate-900' : 'text-slate-300'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
