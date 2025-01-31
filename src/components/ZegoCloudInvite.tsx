// ZegoCloudInvite.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { FcVideoCall } from "react-icons/fc";
import { APP_ID, SERVER_SECRET } from "@/utils/constants"; // Assuming you have these constants

interface ZegoCloudInviteProps {
  userData: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  userId: string;
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
  roomID: string; // Add roomID prop
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
  const zegoContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isZegoReady, setIsZegoReady] = useState(false); // New state for Zego readiness

  useEffect(() => {
    setIsClient(true);
    console.log("ZegoCloudInvite useEffect started");

    const fetchTokenAndInitializeZego = async () => {
      setIsLoading(true);
      console.log("fetchTokenAndInitializeZego started");

      try {
        const appId = APP_ID;
        const serverSecret = SERVER_SECRET;
        const userName = uName + userId;

        console.log("App ID:", appId);
        console.log("Server Secret (exists?):", !!serverSecret);
        console.log("User  ID:", userId);
        console.log("Room ID:", roomID);
        console.log("User Name:", userName);

        const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomID,
          userId,
          userName
        );

        console.log("Token generated:", token);

        if (token && zegoContainer.current) {
          console.log("Zego container is available");
          const zegoInstance = ZegoUIKitPrebuilt.create(token);
          zegoInstance.addPlugins({ ZIM });

          zegoInstance.joinRoom({
            container: zegoContainer.current,
            sharedLinks: [{ url: window.location.origin }],
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          });

          setZp(zegoInstance);
          setIsZegoReady(true);
          console.log("Zego instance initialized and ready");
        } else {
          console.log(
            "Token or container is missing.  Token:",
            !!token,
            "Container:",
            !!zegoContainer.current
          );
        }
      } catch (error) {
        console.error("Error initializing Zego:", error);
        onError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
        console.log("fetchTokenAndInitializeZego finished");
      }
    };

    if (userId && roomID) {
      console.log("Calling fetchTokenAndInitializeZego");
      fetchTokenAndInitializeZego();
    }

    return () => {
      if (zp) {
        console.log("Destroying Zego instance");
        zp.destroy();
        setZp(null);
        setIsZegoReady(false);
      }
      console.log("ZegoCloudInvite useEffect cleanup finished");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, roomID]);

  const invite = (targetUser: { userID: string; userName: string }) => {
    console.log("Invite function called");
    if (!isZegoReady) {
      console.warn("Zego instance is not yet initialized.");
      return;
    }

    if (zp) {
      console.log("Sending call invitation to:", targetUser);
      setCallInvited(targetUser.userID);
      zp.sendCallInvitation({
        callees: [targetUser],
        callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
        timeout: 60,
      })
        .then((res) => console.warn("Call invitation sent:", res))
        .catch((err) => {
          console.error("Error sending call invitation:", err);
          onError("Failed to send call invitation.");
          setCallInvited(null);
        });
    } else {
      console.warn("Zego instance is not initialized.");
    }
  };

  if (!isClient) {
    return <div>Loading... (Zego will initialize on the client)</div>;
  }

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }}></div>
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
            <button
              className="bg-red-100 p-2 rounded-full"
              onClick={() =>
                invite({ userID: member.uid, userName: member.name })
              } // Call the invite function
              disabled={!isZegoReady || member.uid === callInvited || isLoading} // Disable until ready
            >
              <FcVideoCall className="text-red-500" />
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZegoCloudInvite;
