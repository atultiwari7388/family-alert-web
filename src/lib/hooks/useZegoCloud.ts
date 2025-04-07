"use client";

import { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { sendNotification } from "./sendNotification";
import { sendAlertMessage } from "./sendAlertMsg";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firestore/firebase";

interface UseZegoCloudProps {
  onError: (message: string) => void;
  userName: string;
  userId: string;
}

interface Member {
  uid: string;
  name: string;
  phoneNumber: string;
  FCM_Id: string;
}

export const useZegoCloud = ({
  onError,
  userName,
  userId,
}: UseZegoCloudProps) => {
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isSendingInvitation, setIsSendingInvitation] =
    useState<boolean>(false);

  const generateUniqueRoomId = (): string => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchToken = async (
    userId: string,
    roomID: string
  ): Promise<string> => {
    try {
      const response = await fetch(
        `/api/token?userID=${userId}&roomID=${roomID}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token fetch failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token error:", error);
      onError(
        "Token fetch failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  useEffect(() => {
    const storedRoomID = localStorage.getItem("zego_room_id");
    setRoomID(storedRoomID || generateUniqueRoomId());
  }, []);

  useEffect(() => {
    if (roomID && !localStorage.getItem("zego_room_id")) {
      localStorage.setItem("zego_room_id", roomID);
    }
  }, [roomID]);

  useEffect(() => {
    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
    let isMounted = true;

    const initializeZego = async () => {
      if (!zegoContainer.current || !roomID || !userId) return;

      setIsLoading(true);
      try {
        const fetchedToken = await fetchToken(userId, roomID);
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          appId,
          fetchedToken,
          roomID,
          userId,
          userName.trim()
        );

        if (!isMounted) return;

        zpRef.current = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current.addPlugins({ ZIM });
      } catch (error) {
        onError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    initializeZego();

    return () => {
      isMounted = false;
      zpRef.current?.destroy();
      zpRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName, roomID, onError]);

  const startCall = async (members: Member[]) => {
    if (!zpRef.current || isSendingInvitation) return;

    setIsCalling(true);
    setIsSendingInvitation(true);

    try {
      const MAX_RETRIES = 3;
      let retryCount = 0;

      const zegoUsers = members.map((member) => ({
        userID: member.uid,
        userName: member.name,
      }));

      const sendInvitation = async () => {
        try {
          await zpRef.current!.sendCallInvitation({
            callees: [],
            callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
            timeout: 60,
          });

          // Call Firebase Function
          const sendNewAlertMsg = httpsCallable(functions, "sendNewAlertMsg");
          await sendNewAlertMsg({
            adminUid: userId,
            senderName: userName || "Someone",
          });

          console.log(
            "Call invitation sent successfully.",
            "adminUid:",
            userId,
            "senderName:",
            userName
          );

          // Extract user tokens and phone numbers for alerts
          const fcmTokens = members
            .map((member) => member.FCM_Id)
            .filter(Boolean);
          const phoneNumbers = members
            .map((member) => member.phoneNumber)
            .filter(Boolean);

          // Notification and Alert Message
          if (fcmTokens.length > 0) {
            await sendNotification(
              fcmTokens,
              "Incoming Call",
              `${zegoUsers[0].userName} is calling you`
            );
          }

          if (phoneNumbers.length > 0) {
            await sendAlertMessage(
              phoneNumbers,
              "You have an incoming call. Please check the app."
            );
          }
        } catch (error) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(sendInvitation, 1000);
          } else {
            throw error;
          }
        }
      };

      await sendInvitation();
    } catch (error) {
      onError(
        "Failed to start call: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsSendingInvitation(false);
      setShowDialog(false);
    }
  };

  const endCall = () => {
    zpRef.current?.hangUp();
    setIsCalling(false);
    setShowDialog(false);
  };

  return {
    isLoading,
    isCalling,
    showDialog,
    isSendingInvitation,
    startCall,
    endCall,
    zegoContainer,
    setShowDialog,
  };
};
