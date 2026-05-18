import { useEffect } from 'react';
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { NearbyDeal } from '../lib/queries';
import { getUrgency } from '../lib/time';
import { DealCard } from './DealCard';

type Props = {
  deal: NearbyDeal;
  now: Date;
  onPress: () => void;
  // Called after the expiry fade-out completes so the screen can drop it.
  onExpire: (id: string) => void;
};

const FADE_MS = 600;

// Feed-only wrapper: realtime-inserted cards fade/slide in from the top;
// when a card crosses its expiry it fades out, then is removed. DealCard
// itself stays presentational (Search/Saved reuse it without this behavior).
export function AnimatedDealCard({ deal, now, onPress, onExpire }: Props) {
  const expired = getUrgency(deal.expires_at, now) === 'expired';
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!expired) return;
    opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
      if (finished) runOnJS(onExpire)(deal.id);
    });
  }, [expired, deal.id, onExpire, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={style}>
      <DealCard deal={deal} now={now} onPress={onPress} />
    </Animated.View>
  );
}
