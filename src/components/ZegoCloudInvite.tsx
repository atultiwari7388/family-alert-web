// ZegoCloudInvite.tsx
"use client";

import { useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { APP_ID, SERVER_SECRET } from "@/utils/constants";
import { FcVideoCall } from "react-icons/fc";

interface ZegoCloudInviteProps {
  userData: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  userId: string;
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
  userData,
  userId,
  members,
  onError,
}) => {
  const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);

  useEffect(() => {
    if (userData) {
      const loadZego = async () => {
        try {
          const appID = APP_ID;
          const serverSecret = SERVER_SECRET;

          if (!appID || !serverSecret) {
            onError("Zego App ID or Server Secret is missing!");
            return;
          }

          const userName = `${userData.firstName ?? ""} ${
            userData.lastName ?? ""
          }`.trim();
          const roomID = userId;

          const TOKEN = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            userId,
            userName
          );

          const zegoInstance = ZegoUIKitPrebuilt.create(TOKEN);
          zegoInstance.addPlugins({ ZIM });
          setZp(zegoInstance);
        } catch (error) {
          console.error("Error initializing Zego SDK: ", error);
          onError("Failed to initialize Zego SDK.");
        }
      };

      loadZego();
    }
  }, [userData, userId, onError]);

  const invite = (targetUser: { userID: string; userName: string }) => {
    if (zp) {
      console.log("Zego instance is initialized:", zp);
      zp.sendCallInvitation({
        callees: [targetUser],
        callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
        timeout: 60,
      })
        .then((res) => {
          console.warn(res);
        })
        .catch((err) => {
          console.error("Error sending call invitation:", err);
          onError("Failed to send call invitation.");
        });
    } else {
      console.warn("Zego instance is not initialized.");
    }
  };

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div
          key={member.uid}
          className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
        >
          <div>
            <h2 className="text-sm font-medium">{member.name}</h2>
            <p className="text-xs font-medium text-green-600">Ringing...</p>
          </div>
          <button
            className="bg-red-100 p-2 rounded-full"
            onClick={() =>
              invite({ userID: member.uid, userName: member.name })
            }
          >
            <FcVideoCall className="text-red-500" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ZegoCloudInvite;
