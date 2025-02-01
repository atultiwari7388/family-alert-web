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
  const [isClient, setIsClient] = useState(false);
  const [callInvited, setCallInvited] = useState<string | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isZegoReady, setIsZegoReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const myMeeting = async () => {
    if (!zegoContainer.current) {
      console.warn("Zego container is not available yet. Retrying...");
      setTimeout(myMeeting, 500);
      return;
    }

    setIsLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

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
      });

      setZp(zegoInstance);
      setIsZegoReady(true);
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

  useEffect(() => {
    if (userId && roomID) {
      const checkContainerReady = setInterval(() => {
        if (zegoContainer.current) {
          clearInterval(checkContainerReady);
          myMeeting();
        }
      }, 500);
    }

    return () => {
      if (zp) {
        zp.destroy();
        setZp(null);
        setIsZegoReady(false);
      }
    };
  }, [userId, roomID]);

  useEffect(() => {
    if (isZegoReady) {
      if (members.length === 0) {
        onError("No members available to call.");
      } else {
        members.forEach((member) => {
          invite({ userID: member.uid, userName: member.name });
        });
      }
    }
  }, [isZegoReady, members]);

  const invite = (target: { userID: string; userName: string }) => {
    if (!isZegoReady) return;

    if (zp) {
      setCallInvited(target.userID);
      zp.sendCallInvitation({
        callees: [target],
        callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
        timeout: 60,
      }).catch(() => {
        onError("Failed to send call invitation.");
        setCallInvited(null);
      });
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <div
        ref={(el) => {
          zegoContainer.current = el;
        }}
        style={{ width: "100%", height: "500px" }}
      ></div>
      {members.length === 0 ? (
        <div>No members available to call.</div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.uid}
              className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
            >
              <div>
                <h2 className="text-sm font-medium">{member.name}</h2>
                <p className="text-xs font-medium text-green-600">
                  {member.uid === callInvited ? "Inviting..." : "Available"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ZegoCloudInvite;
