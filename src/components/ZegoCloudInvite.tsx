"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";

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
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const zimRef = useRef<ZIM | null>(null);

  const fetchToken = async (userId: string, roomID: string) => {
    try {
      const response = await fetch(
        `/api/token?userID=${userId}&roomID=${roomID}&expiresIn=3600`
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
      throw error;
    }
  };

  // useEffect(() => {
  //   const myMeeting = async () => {
  //     if (!zegoContainer.current) return;

  //     setIsLoading(true);
  //     try {
  //       await navigator.mediaDevices.getUserMedia({ audio: true });

  //       const token = await fetchToken(userId, roomID);

  //       try {
  //         // zimRef = ZIM.create({
  //         //   appID: parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || ""),
  //         // });

  //         console.log("Token:", token);
  //       } catch (zimError: Error | unknown) {
  //         console.error("ZIM Login Error:", zimError);
  //         onError(
  //           "ZIM login failed: " +
  //             (zimError instanceof Error ? zimError.message : "Unknown error")
  //         );
  //         setIsLoading(false);
  //         return;
  //       }

  //       const zegoInstance = ZegoUIKitPrebuilt.create(token); // Use the fetched token
  //       zpRef.current = zegoInstance;
  //       zegoInstance.addPlugins({ ZIM: zimRef });

  //       zegoInstance.joinRoom({
  //         container: zegoContainer.current,
  //         scenario: {
  //           mode: ZegoUIKitPrebuilt.GroupCall,
  //         },
  //         turnOnCameraWhenJoining: false,
  //         turnOnMicrophoneWhenJoining: true,
  //         showScreenSharingButton: false,
  //         showRoomTimer: true,
  //         showUserList: true,
  //       });
  //     } catch (error: unknown) {
  //       if (error instanceof DOMException && error.name === "NotAllowedError") {
  //         onError("Permission denied for microphone.");
  //       } else {
  //         onError(error instanceof Error ? error.message : "Connection failed");
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (userId && roomID) {
  //     myMeeting();
  //   }

  //   return () => {
  //     if (zpRef.current) {
  //       zpRef.current.destroy();
  //       zpRef.current = null;
  //     }
  //     if (zimRef) {
  //       zimRef.destroy();
  //       zimRef = null;
  //     }
  //   };
  // }, [userId, roomID, uName, onError]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const myMeeting = async () => {
      if (!zegoContainer.current) return;

      setIsLoading(true);
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const fetchedToken = await fetchToken(userId, roomID);

        if (!isMounted) return; // Check if component is still mounted

        try {
          zimRef.current = ZIM.create({
            appID: parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || ""),
          });
          await zimRef.current?.login(userId, fetchedToken); // Use fetched token or "" in dev
        } catch (zimError: Error | unknown) {
          console.error("ZIM Login Error:", zimError);
          onError(
            "ZIM login failed: " +
              (zimError instanceof Error ? zimError.message : "Unknown error")
          );
          setIsLoading(false);
          return;
        }

        const zegoInstance = ZegoUIKitPrebuilt.create(fetchedToken); // Use fetched token
        zpRef.current = zegoInstance;
        zegoInstance.addPlugins({ ZIM: zimRef.current });

        zegoInstance.joinRoom({
          container: zegoContainer.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          turnOnCameraWhenJoining: false, // Adjust as needed
          turnOnMicrophoneWhenJoining: true, // Adjust as needed
          showScreenSharingButton: false, // Adjust as needed
          showRoomTimer: true,
          showUserList: true,
        });
      } catch (error: Error | unknown) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          onError("Permission denied for microphone.");
        } else {
          onError(error instanceof Error ? error.message : "Connection failed");
        }
      } finally {
        if (isMounted) {
          // Check isMounted before setting state
          setIsLoading(false);
        }
      }
    };

    if (userId && roomID) {
      myMeeting();
    }

    return () => {
      isMounted = false; // Set isMounted to false on unmount
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
      if (zimRef.current) {
        zimRef.current.destroy();
        zimRef.current = null;
      }
    };
  }, [userId, roomID, uName, onError]); // Include onError in dependencies

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
      } catch (error: unknown) {
        console.error(
          "Error sending invitation:",
          error instanceof Error ? error.message : String(error)
        );
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
