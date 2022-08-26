import { StyleSheet, Text, View, Dimensions, Button } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import io from "socket.io-client";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function App() {
  const [location, setLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    getCurrentLocation();
  }, []);
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    if (location) {
      setLocation(location);
      console.log(location);
    }
  };

  useEffect(() => {
    let newSocket = io("http://192.168.42.144:7000", {
      path: "/api/socket",
    });
    setSocket(newSocket);
  }, []);
  const Socket = () => {
    const payload = {
      latitude: location?.coords?.latitude,
      longitude: location?.coords?.longitude,
      user_id: 1,
      vehicle_type: "car",
    };
    socket.emit("user_requesting_ride", payload);
  };
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords?.latitude,
          longitude: location?.coords?.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        <Marker coordinate={location?.coords} draggable />
      </MapView>
      <Button onPress={Socket} title="send location" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
