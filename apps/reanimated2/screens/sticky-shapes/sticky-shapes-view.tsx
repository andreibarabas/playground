import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import SquareView from "./square-view";

export default function StickyShapesView() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <SquareView />
    </View>
  );
}
