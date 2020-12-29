import { StatusBar } from "expo-status-bar";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StickyShapesScreen } from "./screens/sticky-shapes";

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Sticky Shapes" component={StickyShapesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
