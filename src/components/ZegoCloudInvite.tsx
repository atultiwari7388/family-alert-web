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

  useEffect(() => {
    const myMeeting = async () => {
      if (!zegoContainer.current) return;

      setIsLoading(true);
      try {
        // Request audio permission only (no video)
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const appId = APP_ID;
        const serverSecret = SERVER_SECRET;
        const userName = `${uName}_${userId}`;

        // Generate token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomID,
          userId,
          userName,
          Date.now() + 3600 * 1000
        );

        // Create Zego instance
        const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstance.addPlugins({ ZIM });

        // **Login the caller to Zego**
        // await zegoInstance.getSignalingPlugin().login(userId, userName);

        // Join the room as a voice call
        zegoInstance.joinRoom({
          container: zegoContainer.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          turnOnCameraWhenJoining: false, // Voice-only mode
          turnOnMicrophoneWhenJoining: true, // Enable microphone
          showScreenSharingButton: false, // No screen share
          showRoomTimer: true, // Show call duration
          showUserList: true, // Show who joined
        });

        setZp(zegoInstance);

        // Invite all group members
        inviteMembers(zegoInstance);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          onError("Permission denied for camera and microphone.");
        } else {
          onError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && roomID) {
      myMeeting();
    }

    return () => {
      if (zp) {
        zp.destroy();
        setZp(null);
      }
    };
  }, [userId, roomID]);

  const inviteMembers = async (zegoInstance: ZegoUIKitPrebuilt) => {
    if (!zegoInstance) return;

    for (const member of members) {
      try {
        // **Ensure each member is logged into Zego before calling them**
        // await zegoInstance.getSignalingPlugin().login(member.uid, member.name);

        await zegoInstance.sendCallInvitation({
          callees: [{ userID: member.uid, userName: member.name }],
          callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall, // Voice Call
          timeout: 60, // 60 seconds to accept
        });
      } catch (error) {
        onError(`Failed to call ${member.name}: ${error}`);
      }
    }
  };

  return (
    <div>
      {isLoading && <div>Connecting...</div>}
      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

export default ZegoCloudInvite;
