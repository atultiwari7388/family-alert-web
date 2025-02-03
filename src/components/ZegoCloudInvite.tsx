"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { APP_ID, SERVER_SECRET } from "@/utils/constants";

interface ZegoCloudInviteProps {
  userId: string;
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
  roomID: string;
  uName: string;
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
  userId,
  members,
  onError,
  roomID,
  uName,
}) => {
  const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const zimRef = useRef<ZIM | null>(null);

  useEffect(() => {
    const initializeZego = async () => {
      if (!zegoContainer.current) return;

      setIsLoading(true);
      try {
        // Verify environment and permissions
        if (!window.isSecureContext) {
          throw new Error("Secure context (HTTPS/localhost) required");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());

        // Generate fresh token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          APP_ID,
          SERVER_SECRET,
          roomID,
          userId,
          `${uName}_${userId}`,
          Date.now() + 3600 * 1000
        );

        // Initialize Zego instance
        const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

        // Initialize ZIM before joining room
        zimRef.current = await ZIM.create({ appID: APP_ID });
        zegoInstance.addPlugins({ ZIM });

        // Configure room settings
        zegoInstance.joinRoom({
          container: zegoContainer.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: true,

          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false,
          showRoomTimer: true,
          showUserList: true,
          layout: "Auto",
        });

        setZp(zegoInstance);
        handleInvitations(zegoInstance);
      } catch (error) {
        handleErrors(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && roomID) {
      initializeZego();
    }

    return () => {
      if (zp) {
        zp.destroy();
        zimRef.current?.destroy();
        setZp(null);
      }
    };
  }, [userId, roomID]);

  const handleErrors = (error: unknown) => {
    console.error("Error:", error);
    if (error instanceof DOMException) {
      onError(
        error.name === "NotAllowedError"
          ? "Microphone access required"
          : "Audio device error"
      );
    } else if (error instanceof Error) {
      onError(error.message);
    } else {
      onError("Connection failed");
    }
  };

  const handleInvitations = (zegoInstance: ZegoUIKitPrebuilt) => {
    if (!members.length) return;

    const INVITATION_DELAY = 2000; // 2 seconds between invites
    const MAX_RETRIES = 2;

    members.forEach((member, index) => {
      setTimeout(async () => {
        let attempts = 0;
        const sendInvite = async () => {
          try {
            const response = await zegoInstance.sendCallInvitation({
              callees: [{ userID: member.uid, userName: member.name }],
              callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
              timeout: 60,
            });

            if (response.errorInvitees.length > 0) {
              throw new Error("Invitation failed");
            }
            console.log("Invitation sent to:", member.name);
          } catch (error) {
            console.error("Invitation error:", error);
            if (attempts++ < MAX_RETRIES) {
              console.log(`Retrying ${member.name} (attempt ${attempts})`);
              setTimeout(sendInvite, 1000 * attempts);
            } else {
              onError(`Failed to reach ${member.name}`);
            }
          }
        };

        sendInvite();
      }, index * INVITATION_DELAY);
    });
  };

  return (
    <div className="voice-call-container">
      {isLoading && <div className="loading-text">Initializing call...</div>}
      <div
        ref={zegoContainer}
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default ZegoCloudInvite;
