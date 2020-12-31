import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
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
import SquareView, { MAX_HEIGHT, SIZE } from "./square-view";

const SquareContainer: React.FC<SquareContainerProps> = (props) => {
  const state = useSharedValue(props.initialValue);

  const sticked = useSharedValue(true);
  const translationY = useSharedValue(0);
  const dest = useSharedValue(0);
  const containerRef = useAnimatedRef<Animated.View>();

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      // ctx.startX = x.value;
    },
    onActive: (event, ctx) => {
      translationY.value = event.translationY;

      if (translationY.value > MAX_HEIGHT) {
        sticked.value = false;
      }

      //calculate the potential snapping point, if now we would release the
      //TODO: move to useAnimatedOnLayout once it becomes available
      const measured = measure(containerRef);
      dest.value = snapPoint(translationY.value, event.velocityY, [
        0,
        measured.height - SIZE,
      ]);
    },
    onEnd: ({ velocityY }) => {
      translationY.value = withSpring(
        dest.value,
        { velocity: velocityY },
        () => {
          sticked.value = true;

          //we have finished snapping to the opposite side
          if (dest.value !== 0) {
            //and since we are rotating the view, reset those states as well
            dest.value = 0;
            translationY.value = 0;
          }
        }
      ); //release with a spring animation

      //imediatelly once we finish the gesture
      //we should call the onChange
      if (dest.value !== 0) {
        //so change the state
        state.value = !state.value;

        runOnJS(props.onChange)(state.value);
      }
    },
  });

  //
  // when we move from sticked to not sticked, we want to transition the shape between
  // deformed one to normal square one, so we a using this progress
  //
  const isStickingProgress = useDerivedValue(() =>
    withSpring(sticked.value ? 1 : 0)
  );

  //
  // the deformation depends on the pull + when it's changes from sticking to floating
  // we need to take that into consideration as well
  //
  const deformationProgress = useDerivedValue(
    () =>
      isStickingProgress.value *
      interpolate(
        translationY.value,
        [0, MAX_HEIGHT],
        [0, 1],
        Extrapolate.CLAMP
      )
  );

  //
  // when changing from sticking to floating, we want the top part of the square to also
  // move slowly to the position, and not be abrupt
  //
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - isStickingProgress.value) * translationY.value },
    ],
  }));

  //
  // whenever the snapping destination changes, animate the color transition
  // according to this progress
  //
  const colorProgress = useDerivedValue(() =>
    withTiming(dest.value !== 0 ? 1 : 0)
  );

  const containerStyle = useAnimatedStyle(() => ({
    //  transform: [{ rotate: state.value ? "0deg" : "180deg" }],
  }));

  console.log("state", state.value);

  return (
    <Animated.View
      ref={containerRef}
      style={[styles.container, props.style, containerStyle]}
    >
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={animatedStyle}>
          <SquareView
            progress={deformationProgress}
            colorProgress={colorProgress}
          />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default SquareContainer;

type SquareContainerProps = {
  initialValue: boolean; //the initial value of the toggle
  onChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
