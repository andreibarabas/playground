import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Extrapolate,
  interpolate,
  interpolateColor,
  measure,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { mixColor, snapPoint } from "react-native-redash";
import StretchableSquareView, { SIZE } from "./stretchable-square-view";
import fixVelocity from "./utils/fixVelocity";

const StretchableSquareContainer: React.FC<StretchableSquareContainerProps> = (
  props
) => {
  const atTop = useSharedValue(props.initialValue, false);

  const sticked = useSharedValue(true);
  const translationY = useSharedValue(0);
  const dest = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const stickyThreshold = useDerivedValue(() => containerHeight.value * 0.25);

  //
  //
  //
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      //we need first to cancel any ongoing spring animations
      cancelAnimation(translationY);
    },
    onActive: (event, ctx) => {
      translationY.value = Math.max(event.translationY, 0); //so we can't drag up

      if (translationY.value > stickyThreshold.value) {
        sticked.value = false;
      }

      //calculate the potential snapping point, if now we would release the
      //but take into consideration the middle of the square
      dest.value = snapPoint(
        translationY.value,
        0, //TODO: fixVelocity(atTop.value, event.velocityY),
        [0, containerHeight.value - SIZE]
      );
    },
    onEnd: (event) => {
      translationY.value = withSpring(
        dest.value,
        { velocity: fixVelocity(atTop.value, event.velocityY) },
        () => {
          sticked.value = true;

          //we have finished snapping to the opposite side
          if (dest.value !== 0) {
            //finish changing the internal toogle state
            atTop.value = !atTop.value;

            //and since we are rotating the view, reset those states as well
            dest.value = 0;
            translationY.value = 0;
          }
        }
      ); //release with a spring animation

      //imediatelly once we end the gesture (not the animation)
      //we should call the onChange
      if (dest.value !== 0) {
        //notify the JS that the internal state is changing
        runOnJS(props.onChange)(!atTop.value);
      }
    },
  });

  //
  // when we move from sticked to not sticked, we want to transition the shape and position
  // between stretched one to normal square one, so we a using this morph progress
  //
  const morphProgress = useDerivedValue(() =>
    withSpring(sticked.value ? 1 : 0)
  );

  //
  // when changing from sticking to floating, we want the top part of the square to also
  // move slowly to the position, and not be abrupt
  //
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - morphProgress.value) * translationY.value }],
  }));

  //
  // SVG & Animated Path doesn't play nice with scale, so we need to send them directly scale value
  //
  const scaleY = useDerivedValue(
    () => 1 + (morphProgress.value * translationY.value) / SIZE
  );

  //
  //
  //
  const stretchFactor = useDerivedValue(() => {
    const stickyThreshold = containerHeight.value * 0.3;
    const distanceToThreshold =
      stickyThreshold - translationY.value * morphProgress.value;
    const normalizedDistanceToThreshold =
      stickyThreshold > 0 ? distanceToThreshold / stickyThreshold : 1;

    return 1 - normalizedDistanceToThreshold;
  });

  //
  // animate the color transition according to the starting poin (on / off)
  // and translation progress
  //
  const colorProgress = useDerivedValue(() =>
    withTiming(
      (atTop.value && dest.value !== 0) || (!atTop.value && dest.value === 0)
        ? 1
        : 0
    )
  );

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: atTop.value ? "0deg" : "180deg" }],
  }));

  return (
    <Animated.View
      style={[styles.container, props.style, containerStyle]}
      //TODO: move to native once useAnimatedOnLayout is available
      onLayout={(event) => {
        containerHeight.value = event.nativeEvent.layout.height;
      }}
    >
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.innerContainer, animatedStyle]}>
          <StretchableSquareView
            stretchFactor={stretchFactor}
            scaleY={scaleY}
            colorProgress={colorProgress}
          />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default StretchableSquareContainer;

type StretchableSquareContainerProps = {
  initialValue: boolean; //the initial value of the toggle
  onChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { alignItems: "center" },
});
