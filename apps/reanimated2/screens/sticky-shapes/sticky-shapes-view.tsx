import React from "react";
import { View, StyleSheet } from "react-native";
import Square from "./square-container";

export default function StickyShapesView() {
  return (
    <View style={styles.container}>
      <Square />
      <Square />
      <Square />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
});
