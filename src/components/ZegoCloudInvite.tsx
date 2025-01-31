// ZegoCloudInvite.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { FcVideoCall } from "react-icons/fc";

interface ZegoCloudInviteProps {
  userData: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  userId: string;
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
  roomID: string; // Add roomID prop
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
  userId,
  members,
  onError,
  roomID,
}) => {
  const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [callInvited, setCallInvited] = useState<string | null>(null); // Track invited user
  const zegoContainer = useRef(null);

  useEffect(() => {
    setIsClient(true);

    const fetchTokenAndInitializeZego = async () => {
      try {
        // Fetch the token from your server
        const response = await fetch(
          `/api/zego/getToken?userId=${userId}&roomID=${roomID}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch token");
        }
        const data = await response.json();
        const token = data.token; // Get the token from the response

        if (isClient && token) {
          // Create the Zego instance with the token
          const zegoInstance = ZegoUIKitPrebuilt.create(token);
          zegoInstance.addPlugins({ ZIM });

          zegoInstance.joinRoom({
            container: zegoContainer.current,
            sharedLinks: [
              {
                url: window.location.origin,
              },
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.OneONoneCall, // Or GroupCall
            },
          });

          setZp(zegoInstance);
        }
      } catch (error) {
        console.error("Error fetching token or initializing Zego:", error);
        onError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    };

    if (userId && roomID) {
      // Make sure both userId and roomID exist
      fetchTokenAndInitializeZego();
    }

    return () => {
      if (zp) {
        zp.destroy();
        setZp(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, onError, isClient, roomID]);

  const invite = (targetUser: { userID: string; userName: string }) => {
    if (zp) {
      setCallInvited(targetUser.userID); // Set the invited user
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
          setCallInvited(null); // Reset on error
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
              }
              disabled={member.uid === callInvited} // Disable if already invited
            >
              <FcVideoCall className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZegoCloudInvite;
