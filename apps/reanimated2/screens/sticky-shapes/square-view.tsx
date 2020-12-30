import React from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedProps,
} from "react-native-reanimated";
import {
  addCurve,
  addLine,
  createPath,
  mix,
  serialize,
} from "react-native-redash";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const H_FACTOR = 0.3;
const V_FACTOR = 2.5;
export const SIZE = 100;
export const MAX_HEIGHT = V_FACTOR * SIZE;

/**
 * Render the square component
 */
const SquareView: React.FC<SquareViewProps> = (props) => {
  const { progress } = props;

  const animatedProps = useAnimatedProps(() => {
    const deformation = {
      x: interpolate(progress.value, [0, 1], [0, SIZE * H_FACTOR]),
      y: interpolate(progress.value, [0, 1], [1, V_FACTOR]),
    };

    // the square points
    const topLeft = { x: 0, y: 0 };
    const topRight = { x: SIZE, y: 0 };
    const bottomRight = { x: SIZE - deformation.x, y: SIZE * deformation.y };
    const bottomLeft = { x: 0 + deformation.x, y: SIZE * deformation.y };

    // build the path from the top left point
    const path = createPath(topLeft);

    // the upper simple line
    addLine(path, topRight);

    // the right bezier curve
    addCurve(path, {
      c1: { x: topRight.x, y: 0 },
      c2: {
        x: bottomRight.x,
        y: 0,
      },
      to: bottomRight,
    });

    // the bottom simple line
    addLine(path, bottomLeft);

    // the left bezier curve
    addCurve(path, {
      c1: {
        x: bottomLeft.x,
        y: 0,
      },
      c2: { x: topLeft.x, y: 0 },
      to: topLeft,
    });

    return {
      d: serialize(path),
    };
  });

  return (
    <Svg>
      <AnimatedPath animatedProps={animatedProps} fill="#7EDAB9" />
    </Svg>
  );
};

export default SquareView;

type SquareViewProps = {
  progress: Animated.SharedValue<number>;
};
