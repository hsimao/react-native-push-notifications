import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    };
  }
});

export default function App() {
  useEffect(() => {
    // 檢查通知權限, 是否已經允許 app 使用通知功能, 若無授權則重新詢問
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          return;
        }
      });
  }, []);
  const triggerNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the first local notification we are sending!",
        sound: true // 開啟通知音效, 用戶需要有開啟聲音, 並且該 app 需要在背景執行, 才會有音效
      },
      trigger: {
        seconds: 10
      }
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Trigger Notification" onPress={triggerNotification} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
