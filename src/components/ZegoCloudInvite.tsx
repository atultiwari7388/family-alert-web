"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

interface ZegoCloudInviteProps {
  userId: string;
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
  roomID: string;
  userName: string;
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
  userId,
  members,
  onError,
  roomID,
  userName,
}) => {
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchToken = async (userId: string, roomID: string) => {
    try {
      const response = await fetch(
        `/api/token?userID=${userId}&roomID=${roomID}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token fetch failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data.token;
    } catch (error: unknown) {
      console.error("Token error:", error);
      onError(
        "Token fetch failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error; // Re-throw the error to be caught in useEffect
    }
  };

  useEffect(() => {
    let isMounted = true;

    const myMeeting = async () => {
      if (!zegoContainer.current) return;

      setIsLoading(true);

      try {
        const fetchedToken = await fetchToken(userId, roomID);

        if (!isMounted) return;

        console.log("Fetched Token (for kitToken):", fetchedToken);

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || ""),
          fetchedToken,
          roomID,
          userId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, roomID, userName, onError]); // Correct dependencies

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
      {isLoading && <div>Connecting...</div>} {/* Loading indicator */}
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
