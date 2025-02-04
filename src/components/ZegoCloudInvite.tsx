"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

interface ZegoCloudInviteProps {
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
  userName: string;
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
  members,
  onError,
  userName,
}) => {
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const generateUniqueRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateUniqueUserId = () => {
    return `userID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchToken = async (userId: string, roomID: string) => {
    try {
      const response = await fetch(
        `/api/token?userID=${userId}&roomID=${roomID}`,
        { method: "GET" }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token fetch failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Fetched Data Token:", data.token);
      return data.token;
    } catch (error: unknown) {
      console.error("Token error:", error);
      onError(
        "Token fetch failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  useEffect(() => {
    const newRoomID = generateUniqueRoomId();
    const newUserID = generateUniqueUserId();
    setRoomID(newRoomID);
    setUserId(newUserID);
  }, []);

  useEffect(() => {
    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
    console.log("Zego App Id", appId);
    console.log(
      "Zego App Secret Key",
      process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
    );

    let isMounted = true;

    const myMeeting = async () => {
      if (!zegoContainer.current) return;

      setIsLoading(true);

      try {
        if (roomID) {
          const fetchedToken = await fetchToken(userId!, roomID);

          if (!isMounted) return;

          console.log("Fetched Token (for kitToken):", fetchedToken);

          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
            appId, // Use appId directly here
            fetchedToken,
            roomID,
            userId!,
            userName.trim()
          );

          console.log("Generated kitToken:", kitToken);

          const zp = ZegoUIKitPrebuilt.create(kitToken);
          zpRef.current = zp;

          zp.joinRoom({
            container: zegoContainer.current,
            scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
            turnOnCameraWhenJoining: false,
            turnOnMicrophoneWhenJoining: true,
            showScreenSharingButton: false,
            showRoomTimer: true,
            showUserList: true,
          });
        }
      } catch (error: Error | unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to join room";
        console.error("Error joining room:", error);
        onError(errorMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (userId && roomID) {
      myMeeting();
    }

    return () => {
      isMounted = false;
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [userId, userName, onError, roomID]);

  const callMember = (member: { uid: string; name: string }) => {
    if (!zpRef.current) {
      onError("Connection not ready");
      return;
    }

    const MAX_RETRIES = 3;
    let retryCount = 0;

    const sendInvitation = async () => {
      try {
        await zpRef.current!.sendCallInvitation({
          callees: [{ userID: member.uid, userName: member.name }],
          callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
          timeout: 60,
        });
        console.log(`Call invitation sent to ${member.name}`);
      } catch (error: Error | unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error sending invitation:", errorMessage);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(sendInvitation, 1000);
        } else {
          onError(
            `Failed to call ${member.name} after ${MAX_RETRIES} attempts`
          );
        }
      }
    };

    sendInvitation();
  };

  return (
    <div>
      {isLoading && <div>Connecting...</div>}
      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
      <div className="member-list">
        <div>My User Name is {userName}</div>
        {members.map((member) => (
          <div key={member.uid} className="member-item">
            <span>
              {member.name} ({member.uid})
            </span>
            <button onClick={() => callMember(member)} disabled={isLoading}>
              Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZegoCloudInvite;
