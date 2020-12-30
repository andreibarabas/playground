import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import SquareView, { MAX_HEIGHT } from "./square-view";

const SquareContainer: React.FC<SquareContainerProps> = (props) => {
  const sticked = useSharedValue(true);
  const translationY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      // ctx.startX = x.value;
    },
    onActive: (event, ctx) => {
      translationY.value = event.translationY;

      if (translationY.value > MAX_HEIGHT) {
        sticked.value = false;
      }
    },
    onEnd: ({ velocityY }) => {
      translationY.value = withSpring(0, { velocity: velocityY }, () => {
        sticked.value = true;
      }); //release with a spring animation
    },
  });

  const progress = useDerivedValue(() =>
    sticked.value
      ? interpolate(
          translationY.value,
          [0, MAX_HEIGHT],
          [0, 1],
          Extrapolate.CLAMP
        )
      : 0
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (!sticked.value) {
      return { transform: [{ translateY: translationY.value }] };
    }

    return {};
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, props.style, animatedStyle]}>
        <SquareView progress={progress} />
      </Animated.View>
    </PanGestureHandler>
  );
};

export default SquareContainer;

type SquareContainerProps = {
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
});
