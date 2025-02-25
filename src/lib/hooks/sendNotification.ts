import { httpsCallable } from "firebase/functions";
import { functions } from "../firestore/firebase";

export const sendNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  roomId?: string
) => {
  try {
    const sendNotificationFn = httpsCallable(functions, "sendNotification");

    const response = await sendNotificationFn({
      tokens: fcmTokens,
      notification: { title, body },
      data: {
        roomId: roomId ?? "",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    });

    if ((response.data as { success: boolean; error?: string })?.success) {
      console.log("Notification sent successfully");
    } else {
      console.error(
        "Failed to send notification:",
        (response.data as { success: boolean; error?: string })?.error
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
