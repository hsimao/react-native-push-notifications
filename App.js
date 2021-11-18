import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Button } from "react-native";
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
  const [pushToken, setPushToken] = useState("");

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
          throw new Error("Permission not granted!");
        }
      })
      .then(() => {
        console.log("get expo push notifications server token");
        return Notifications.getExpoPushTokenAsync();
      })
      .then((data) => {
        const pushToken = data.data;
        console.log("pushToken", pushToken);
        setPushToken(pushToken);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    // 監聽用戶點擊通知事件
    const clickSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const type = response.notification.request.content.data.type;
        if (type === "newMessage") {
          // handle go to chatroom
        }
      });
    // 監聽接收到通知事件
    const showSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("notification", notification);
        const type = notification.request.content.data.type;
        if (type === "newMessage") {
          // handle go to chatroom
          console.log("is newMessage");
        }
      }
    );

    return () => {
      clickSubscription.remove();
      showSubscription.remove();
    };
  }, []);

  // 本地推播
  const triggerNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the first local notification we are sending!",
        sound: true, // 開啟通知音效, 用戶需要有開啟聲音, 並且該 app 需要在背景執行, 才會有音效
        data: {
          type: "newMessage" // 可傳遞到監聽事件內判斷, 並進行跳轉或其他邏輯處理
        }
      },
      trigger: {
        seconds: 5 // 5 秒後觸發
      }
    });
  };

  // 透過 expo push server 推送訊息到某裝置上
  const triggerNotificationToDevice = (idList = []) => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: idList,
        data: {
          extraData: "Some data"
        },
        sound: "default",
        title: "Send mars the app",
        body: "This push notificatoin was send mars app!"
      })
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger Notification from local"
        onPress={triggerNotification}
      />

      <Button
        title="Trigger Notification from push server"
        onPress={() => triggerNotificationToDevice([pushToken])}
      />
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
