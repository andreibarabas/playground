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
export const SIZE = 100;
const X_OFFSET = SIZE / 2; //so we account for the negative deformations due to spring animation

/**
 * Render the square component, based on the specified animation progress
 */
const StretchableSquareView: React.FC<StretchableSquareViewProps> = (props) => {
  const { stretchFactor, scaleY, colorProgress } = props;

  const deformationX = useDerivedValue(() =>
    interpolate(stretchFactor.value, [0, 1], [0, SIZE * H_FACTOR])
  );

  //
  // Define the stretchable square
  //
  const animatedProps = useAnimatedProps(() => {
    // the square's points
    const topLeading = { x: X_OFFSET, y: 0 };
    const topTrailing = { x: X_OFFSET + SIZE, y: 0 };
    const bottomTrailing = {
      x: X_OFFSET + SIZE - Math.max(deformationX.value, 0),
      y: SIZE * scaleY.value,
    };
    const bottomLeading = {
      x: X_OFFSET + Math.max(deformationX.value, 0),
      y: SIZE * scaleY.value,
    };

    // build the path from the top left point
    const path = createPath(topLeading);

    // the upper simple line
    addLine(path, topTrailing);

    // the right quadratic bezier curve (single control point)
    addQuadraticCurve(
      path,
      {
        x: X_OFFSET + SIZE - deformationX.value,
        y: topTrailing.y + SIZE * 0.1 * scaleY.value,
      },
      bottomTrailing
    );

    // the bottom simple line
    addLine(path, bottomLeading);

    // the left quadratic bezier curve (single control point)
    addQuadraticCurve(
      path,
      {
        x: X_OFFSET + deformationX.value,
        y: topLeading.y + SIZE * 0.1 * scaleY.value,
      },
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
    width: SIZE * 2,
    height: SIZE * scaleY.value,
  }));

  return (
    <AnimatedSvg style={animatedStyle}>
      <AnimatedPath animatedProps={animatedProps} />
    </AnimatedSvg>
  );
};

export default StretchableSquareView;

type StretchableSquareViewProps = {
  stretchFactor: Animated.SharedValue<number>;
  scaleY: Animated.SharedValue<number>;
  colorProgress: Animated.SharedValue<number>;
};
