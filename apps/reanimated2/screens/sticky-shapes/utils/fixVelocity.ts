import Animated from "react-native-reanimated";

/**
 *
 * Reanimated gesture handler returns the normal velocity even if the view is rotated
 * So take that into consideration
 *
 * @param isInverted
 * @param velocity
 */
export default function fixVelocity(
  isOnTop: boolean,
  velocity: number
): number {
  "worklet";
  return velocity * (isOnTop ? 1 : -1);
}
