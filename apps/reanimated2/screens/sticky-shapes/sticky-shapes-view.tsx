import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import StretchableSquare from "./stretchable-square-container";

export default function StickyShapesView() {
  const [toogle1, setToogle1] = useState(true);
  const [toogle2, setToogle2] = useState(false);
  const [toogle3, setToogle3] = useState(true);

  return (
    <>
      <View style={styles.container}>
        <StretchableSquare initialValue={toogle1} onChange={setToogle1} />
        <StretchableSquare initialValue={toogle2} onChange={setToogle2} />
        <StretchableSquare initialValue={toogle3} onChange={setToogle3} />
      </View>
      <Text style={styles.status}>
        States: {toogle1 ? "true" : "false"} - {toogle2 ? "true" : "false"} -{" "}
        {toogle3 ? "true" : "false"}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  status: {
    textAlign: "center",
    backgroundColor: "yellow",
  },
});
