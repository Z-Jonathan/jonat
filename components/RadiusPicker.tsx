import { Pressable, Text, View } from 'react-native';

export const RADIUS_OPTIONS_MILES = [1, 5, 10, 25, 50] as const;

type Props = {
  value: number;
  onChange: (miles: number) => void;
};

// Presentational segmented control. The screen that uses it (Step 5) binds
// value/onChange to the location store.
export function RadiusPicker({ value, onChange }: Props) {
  return (
    <View className="flex-row rounded-full bg-slate-800 p-1">
      {RADIUS_OPTIONS_MILES.map((miles) => {
        const selected = miles === value;
        return (
          <Pressable
            key={miles}
            onPress={() => onChange(miles)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`flex-1 items-center rounded-full px-3 py-1.5 ${
              selected ? 'bg-white' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? 'text-slate-900' : 'text-slate-300'
              }`}
            >
              {miles} mi
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
