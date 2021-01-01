import React from "react";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import {
  addCurve,
  addLine,
  addQuadraticCurve,
  AnimatedColor,
  createPath,
  mix,
  serialize,
} from "react-native-redash";
import Svg, { Path } from "react-native-svg";
import mixPoint from "../../utils/mixPoint";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const H_FACTOR = 0.4;
const V_FACTOR = 2.5;
export const SIZE = 100;
export const MAX_HEIGHT = SIZE * V_FACTOR;

/**
 * Render the square component, based on the specified animation progress
 */
const StretchableSquareView: React.FC<StretchableSquareViewProps> = (props) => {
  const { progress, colorProgress } = props;

  const scaleY = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [1, V_FACTOR])
  );

  //
  // Define the stretchable square
  //
  const animatedProps = useAnimatedProps(() => {
    const deformationX = interpolate(
      progress.value,
      [0, 1],
      [0, SIZE * H_FACTOR]
    );

    // the square's points
    const topLeading = { x: 0, y: 0 };
    const topTrailing = { x: SIZE, y: 0 };
    const bottomTrailing = { x: SIZE - deformationX, y: SIZE * scaleY.value };
    const bottomLeading = { x: 0 + deformationX, y: SIZE * scaleY.value };

    // build the path from the top left point
    const path = createPath(topLeading);

    // the upper simple line
    addLine(path, topTrailing);

    // the right quadratic bezier curve (single control point)
    addQuadraticCurve(
      path,
      { x: bottomTrailing.x, y: topTrailing.y + SIZE * 0.1 },
      bottomTrailing
    );

    // the bottom simple line
    addLine(path, bottomLeading);

    // the left quadratic bezier curve (single control point)
    addQuadraticCurve(
      path,
      { x: bottomLeading.x, y: topLeading.y + SIZE * 0.1 },
      topLeading
    );

    return {
      d: serialize(path),
      fill: interpolateColor(
        colorProgress.value,
        [0, 1],
        ["#7EDAB9", "#FF0000"]
      ),
    };
  });

  //
  // SVG by default takes the full size of the parent
  // but we want to take the size of the square
  //
  const animatedStyle = useAnimatedStyle(() => ({
    width: SIZE,
    height: SIZE * scaleY.value,
    backgroundColor: "pink",
  }));

  return (
    <AnimatedSvg style={animatedStyle}>
      <AnimatedPath animatedProps={animatedProps} />
    </AnimatedSvg>
  );
};

export default StretchableSquareView;

type StretchableSquareViewProps = {
  progress: Animated.SharedValue<number>;
  colorProgress: Animated.SharedValue<number>;
};
