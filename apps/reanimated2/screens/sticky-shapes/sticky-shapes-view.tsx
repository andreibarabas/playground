import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Square from "./square-container";

export default function StickyShapesView() {
  const [toogle1, setToogle1] = useState(true);
  const [toogle2, setToogle2] = useState(false);
  const [toogle3, setToogle3] = useState(true);

  return (
    <>
      <Text>
        States: {toogle1 ? "on" : "off"} - {toogle2 ? "on" : "off"} -{" "}
        {toogle3 ? "on" : "off"}
      </Text>
      <View style={styles.container}>
        <Square initialValue={toogle1} onChange={setToogle1} />
        <Square initialValue={toogle2} onChange={setToogle2} />
        <Square initialValue={toogle3} onChange={setToogle3} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});
