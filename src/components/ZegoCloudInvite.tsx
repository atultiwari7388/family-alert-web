"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { ZIM } from "zego-zim-web";
// import { FcVideoCall } from "react-icons/fc";
import { APP_ID } from "@/utils/constants";

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
  // const [callInvited, setCallInvited] = useState<string | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isZegoReady, setIsZegoReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // get token
  function generateToken(
    tokenServerUrl: string,
    appID: number,
    userID: string
  ) {
    // Obtain the token interface provided by the App Server
    return fetch(tokenServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: appID,
        user_id: userID,
      }),
    }).then(async (res) => {
      const result = await res.text();
      return result;
    });
  }

  const myMeeting = async (element: HTMLDivElement) => {
    // Ensure container exists before proceeding
    // if (!zegoContainer.current) {
    //   console.warn("Zego container is not available yet. Retrying...");
    //   setTimeout(myMeeting, 500); // Retry after 500ms
    //   return;
    // }

    setIsLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const appId = APP_ID;
      // const serverSecret = SERVER_SECRET;
      const userName = `${uName}_${userId}`;

      // generate token
      const token = await generateToken(
        "https://preview-uikit-server.zegotech.cn/api/token",
        2013980891,
        userId
      );

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appId,
        token,
        roomID,
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      // zegoInstance.addPlugins({ ZIM });

      zp.joinRoom({
        container: element, // Ensure container exists
        sharedLinks: [
          {
            name: "Copy link",
            url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
      });

      // setZp(zegoInstance);
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
          myMeeting(zegoContainer.current as HTMLDivElement);
        }
      }, 500); // Retry every 500ms
    }

    return () => {
      if (zp) {
        zp.destroy();
        setZp(null);
        setIsZegoReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, roomID]);

  // const invite = (targetUser: { userID: string; userName: string }) => {
  //   if (!isZegoReady) return;

  //   if (zp) {
  //     setCallInvited(targetUser.userID);
  //     zp.sendCallInvitation({
  //       callees: [targetUser],
  //       callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
  //       timeout: 60,
  //     }).catch(() => {
  //       onError("Failed to send call invitation.");
  //       setCallInvited(null);
  //     });
  //   }
  // };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isZegoReady && isLoading && <div>Loading...</div>}
      <div
        ref={(el) => {
          myMeeting(el as HTMLDivElement);
        }}
        style={{ width: "100%", height: "500px" }}
      ></div>
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.uid}
            className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
          >
            <div>
              <h2 className="text-sm font-medium">{member.name}</h2>
              <p className="text-xs font-medium text-green-600">
                {member.uid ? "Inviting..." : "Available"}
              </p>
            </div>
            {/* <button
              className="bg-red-100 p-2 rounded-full"
              onClick={() =>
                invite({ userID: member.uid, userName: member.name })
              }
              disabled={!isZegoReady || member.uid === callInvited || isLoading}
            >
              <FcVideoCall className="text-red-500" />
              Invite
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZegoCloudInvite;
