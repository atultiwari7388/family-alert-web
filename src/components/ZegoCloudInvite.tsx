//ZegoCloudInvite.tsx

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
  // const [membersToCall, setMembersToCall] = useState<string[]>([]); // Track members to call

  useEffect(() => {
    const myMeeting = async () => {
      if (!zegoContainer.current) return;

      setIsLoading(true);
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const appId = APP_ID;
        const serverSecret = SERVER_SECRET;
        const userName = `${uName}_${userId}`;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomID,
          userId,
          userName,
          Date.now() + 3600 * 1000
        );

        const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstance.addPlugins({ ZIM });

        zegoInstance.joinRoom({
          container: zegoContainer.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: true,
          showScreenSharingButton: false,
          showRoomTimer: true,
          showUserList: true,
        });

        setZp(zegoInstance);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          onError("Permission denied for microphone.");
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

  const callMember = (member: { uid: string; name: string }) => {
    if (!zp) return; // Ensure Zego instance is available

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    let retryCount = 0;

    const sendInvitation = () => {
      zp.sendCallInvitation({
        callees: [{ userID: member.uid, userName: member.name }],
        callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
        timeout: 60,
      })
        .then(() => {
          console.log(`Call invitation sent to ${member.name}`);
        })
        .catch((error) => {
          console.error(`Failed to call ${member.name}:`, error);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            setTimeout(sendInvitation, RETRY_DELAY);
          } else {
            onError(`Failed to call ${member.name} after multiple attempts.`);
          }
        });
    };

    sendInvitation();
  };

  return (
    <div>
      {isLoading && <div>Connecting...</div>}
      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }}></div>

      {/* List of members with call buttons */}
      <div>
        {members.map((member) => (
          <div key={member.uid}>
            {member.name} ({member.uid})
            <button onClick={() => callMember(member)}>Call</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZegoCloudInvite;
