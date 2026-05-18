import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Pulsing placeholder block. Color is caller-controlled so it works on both
// the dark feed (slate-700) and the white detail screen (slate-200).
export function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={style}
      className={`rounded-md bg-slate-700 ${className ?? ''}`}
    />
  );
}

function DealCardSkeleton() {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-white p-4">
      <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-3/4 bg-slate-200" />
        <Skeleton className="h-3 w-1/2 bg-slate-200" />
        <Skeleton className="mt-1 h-6 w-24 rounded-full bg-slate-200" />
      </View>
    </View>
  );
}

export function DealListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="gap-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function DealDetailSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <Skeleton className="h-56 w-full rounded-none bg-slate-200" />
      <View className="gap-4 px-5 pt-4">
        <Skeleton className="h-7 w-2/3 bg-slate-200" />
        <Skeleton className="h-4 w-1/2 bg-slate-200" />
        <Skeleton className="h-5 w-40 bg-slate-200" />
        <Skeleton className="h-20 w-full bg-slate-200" />
        <Skeleton className="h-16 w-full bg-slate-200" />
      </View>
    </View>
  );
}
