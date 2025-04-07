// "use client";

// import { useZegoCloud } from "@/lib/hooks/useZegoCloud";
// import { MdOutlineCall } from "react-icons/md";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// interface Member {
//   uid: string;
//   name: string;
//   phoneNumber: string;
//   FCM_Id: string;
// }

// interface ZegoCloudInviteUIProps {
//   members: Member[];
//   onError: (message: string) => void;
//   userName: string;
//   userId: string;
// }

// const ZegoCloudInviteUI: React.FC<ZegoCloudInviteUIProps> = ({
//   members,
//   onError,
//   userName,
//   userId,
// }) => {
//   const {
//     isLoading,
//     isCalling,
//     isSendingInvitation,
//     showDialog,
//     startCall,
//     endCall,
//     zegoContainer,
//     setShowDialog,
//   } = useZegoCloud({ onError, userName, userId });

//   // New state to track call status
//   const [callEnded, setCallEnded] = useState(false);
//   const router = useRouter();

//   const handleEndCall = () => {
//     endCall();
//     setCallEnded(true);

//     router.push("/");
//   };

//   if (showDialog) {
//     return (
//       <>
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-sm text-center">
//             <p className="text-lg font-semibold text-gray-900">
//               You are on speaker
//             </p>
//             <button
//               onClick={() => startCall(members)}
//               className="mt-4 bg-[#45DA4A] text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300 hover:bg-[#3cc13f] hover:scale-105"
//             >
//               Okay
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <div className="">
//       {isLoading && <div className="text-gray-500">Connecting...</div>}

//       <div className="w-full">
//         {/* Show "Call Cancelled" if the call is ended */}
//         {callEnded ? (
//           <div className="text-gray-600 text-center text-lg font-semibold">
//             Call Cancelled
//           </div>
//         ) : members.length === 0 ? (
//           <div className="text-gray-600 text-center">
//             Please select a primary group first or add members to the existing
//             group.
//           </div>
//         ) : (
//           <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 transition-all duration-300">
//             {/* Member List */}
//             <ul className="space-y-3 w-full">
//               {members.map((member) => (
//                 <li
//                   key={member.uid}
//                   className={`flex items-center justify-between ${
//                     isCalling ? "" : "bg-[#D1E6FF]"
//                   } p-3 rounded-lg ${isCalling ? "" : "shadow-sm"}`}
//                 >
//                   {/* Left-aligned Member Name */}

//                   {isCalling ? (
//                     <div></div>
//                   ) : (
//                     <div className="text-left">
//                       <h2 className="text-sm font-medium text-gray-800">
//                         {member.name}
//                       </h2>
//                     </div>
//                   )}

//                   {/* Right-aligned Call Icon */}
//                   <button
//                     className={`p-2 rounded-full transition-all duration-300 ${
//                       isCalling ? "" : "bg-[#45DA4A]"
//                     }`}
//                   >
//                     {isCalling ? (
//                       <div></div>
//                     ) : (
//                       <MdOutlineCall className="text-white text-lg" />
//                     )}
//                   </button>
//                 </li>
//               ))}
//             </ul>

//             {isCalling ? (
//               <h2 className="text-[#FF4545] font-semibold text-xl text-center">
//                 Call Ended
//               </h2>
//             ) : (
//               <h2></h2>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Group Call Controls */}
//       {!callEnded && (
//         <div className="w-full fixed bottom-6 flex justify-center">
//           {!isCalling && !showDialog && members.length > 0 ? (
//             <div>
//               <button
//                 onClick={() => setShowDialog(true)}
//                 disabled={isLoading || isSendingInvitation}
//                 className="bg-[#45DA4A] text-white font-semibold rounded-full shadow-lg px-14 py-4 transition-all duration-300 hover:bg-[#45DA4A] hover:scale-105 disabled:opacity-50"
//               >
//                 {isSendingInvitation ? "Calling..." : "Start Group Call"}
//               </button>
//             </div>
//           ) : (
//             <div onClick={handleEndCall}></div>
//           )}
//         </div>
//       )}

//       {/* Video Call Container */}
//       {!callEnded && <div ref={zegoContainer} className="w-full h-[500px]" />}
//     </div>
//   );
// };

// export default ZegoCloudInviteUI;

"use client";

import { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt, ZegoUser } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { useRouter } from "next/navigation";
import { MdOutlineCall } from "react-icons/md";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firestore/firebase";

interface ZegoCloudInviteProps {
  members: { uid: string; name: string }[];
  onError: (error: string) => void;
  userName: string;
  userId: string;
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
  members,
  onError,
  userName,
  userId,
}) => {
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const zegoContainer = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isSendingInvitation, setIsSendingInvitation] =
    useState<boolean>(false);
  const [callEnded, setCallEnded] = useState(false);

  const router = useRouter();

  const generateUniqueRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    const storedRoomID = localStorage.getItem("zego_room_id");

    if (storedRoomID) {
      setRoomID(storedRoomID);
    } else {
      const newRoomID = generateUniqueRoomId();
      setRoomID(newRoomID);
      localStorage.setItem("zego_room_id", newRoomID);
    }
  }, []);

  useEffect(() => {
    console.log("ref", zpRef);
    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
    console.log("[Debug] Starting initialization with AppID:", appId);

    let isMounted = true;
    // let callStarted = false;
    let zp: ZegoUIKitPrebuilt | null = null;

    const myMeeting = async () => {
      console.log(
        "[Debug] myMeeting called, container:",
        !!zegoContainer.current
      );
      if (!zegoContainer.current || !isMounted) {
        console.log("[Debug] Container not ready or component unmounted");
        return;
      }

      setIsLoading(true);

      try {
        if (roomID && userId) {
          console.log("[Debug] Fetching token for roomID:", roomID);
          const fetchedToken = await fetchToken(userId, roomID);
          console.log("[Debug] Token fetched successfully");

          if (!isMounted) {
            console.log("[Debug] Component unmounted during token fetch");
            return;
          }

          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
            appId,
            fetchedToken,
            roomID,
            userId,
            userName.trim()
          );
          console.log("[Debug] Kit token generated");

          if (!isMounted) {
            console.log("[Debug] Component unmounted before Zego creation");
            return;
          }

          zp = ZegoUIKitPrebuilt.create(kitToken);
          zpRef.current = zp;
          zp.addPlugins({ ZIM });
          console.log("[Debug] ZegoUIKitPrebuilt created and assigned to ref");
        }
      } catch (error) {
        console.error("[Debug] Error in myMeeting:", error);
        if (isMounted) {
          onError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (userId && roomID) {
      console.log("[Debug] Calling myMeeting with userId:", userId);
      myMeeting().catch((error) => {
        console.error("[Debug] Unhandled error in myMeeting:", error);
      });
    }

    return () => {
      console.log("[Debug] Starting cleanup");
      isMounted = false;
      if (zpRef.current) {
        console.log("[Debug] Destroying Zego instance");
        zpRef.current.destroy();
        zpRef.current = null;
      }
      zp = null;
      console.log("[Debug] Cleanup complete");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName, onError, roomID, members]);

  const startCall = (members: { uid: string; name: string }[]) => {
    setIsCalling(true);
    console.log("Calling members", members);
    callMembers(members);
  };

  const endCall = () => {
    zpRef.current?.hangUp();
    setIsCalling(false);
    setShowDialog(false);
  };

  const handleEndCall = () => {
    endCall();
    setCallEnded(true);

    router.push("/");
  };

  const callMembers = async (members: { uid: string; name: string }[]) => {
    console.log("[Debug] callMembers called, zpRef.current:", !!zpRef.current);

    if (isSendingInvitation) {
      return;
    }

    setIsSendingInvitation(true);

    try {
      const MAX_RETRIES = 3;
      let retryCount = 0;
      // convert member array to ZegoUser array
      const zegoUsers: ZegoUser[] = members.map((member) => ({
        userID: member.uid,
        userName: member.name,
      }));
      const sendInvitation = async () => {
        try {
          await zpRef.current!.sendCallInvitation({
            callees: zegoUsers,
            callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
            timeout: 60,
          });
          // Call Firebase Function
          const sendNewAlertMsg = httpsCallable(functions, "sendNewAlertMsg");
          await sendNewAlertMsg({
            adminUid: userId,
            senderName: userName || "Someone",
          });
          console.log(`Call invitation sent to ${members.length} members`);
        } catch (error: Error | unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Error sending invitation:", errorMessage);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(sendInvitation, 1000);
          } else {
            onError(`Failed to call members after ${MAX_RETRIES} attempts`);
          }
        }
      };

      await sendInvitation();
    } catch (error) {
      console.error("Error in callMembers:", error);
      onError("An error occurred while calling.");
    } finally {
      setIsSendingInvitation(false);
    }
  };

  if (showDialog) {
    return (
      <>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-sm text-center">
            <p className="text-lg font-semibold text-gray-900">
              You are on speaker
            </p>
            <button
              onClick={() => startCall(members)}
              className="mt-4 bg-[#45DA4A] text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300 hover:bg-[#3cc13f] hover:scale-105"
            >
              Okay
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="">
      {isLoading && <div className="text-gray-500">Connecting...</div>}

      <div className="w-full">
        {/* Show "Call Cancelled" if the call is ended */}
        {callEnded ? (
          <div className="text-gray-600 text-center text-lg font-semibold">
            Call Cancelled
          </div>
        ) : members.length === 0 ? (
          <div className="text-gray-600 text-center">
            Please select a primary group first or add members to the existing
            group.
          </div>
        ) : (
          <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 transition-all duration-300">
            {/* Member List */}
            <ul className="space-y-3 w-full">
              {members.map((member) => (
                <li
                  key={member.uid}
                  className={`flex items-center justify-between ${
                    isCalling ? "" : "bg-[#D1E6FF]"
                  } p-3 rounded-lg ${isCalling ? "" : "shadow-sm"}`}
                >
                  {/* Left-aligned Member Name */}

                  {isCalling ? (
                    <div></div>
                  ) : (
                    <div className="text-left">
                      <h2 className="text-sm font-medium text-gray-800">
                        {member.name}
                      </h2>
                    </div>
                  )}

                  {/* Right-aligned Call Icon */}
                  <button
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isCalling ? "" : "bg-[#45DA4A]"
                    }`}
                  >
                    {isCalling ? (
                      <div></div>
                    ) : (
                      <MdOutlineCall className="text-white text-lg" />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {isCalling ? (
              <h2 className="text-[#FF4545] font-semibold text-xl text-center">
                Call Ended
              </h2>
            ) : (
              <h2></h2>
            )}
          </div>
        )}
      </div>

      {/* Group Call Controls */}
      {!callEnded && (
        <div className="w-full fixed bottom-6 flex justify-center">
          {!isCalling && !showDialog && members.length > 0 ? (
            <div>
              <button
                onClick={() => setShowDialog(true)}
                disabled={isLoading || isSendingInvitation}
                className="bg-[#45DA4A] text-white font-semibold rounded-full shadow-lg px-14 py-4 transition-all duration-300 hover:bg-[#45DA4A] hover:scale-105 disabled:opacity-50"
              >
                {isSendingInvitation ? "Calling..." : "Start Group Call"}
              </button>
            </div>
          ) : (
            <div onClick={handleEndCall}></div>
          )}
        </div>
      )}

      {/* Video Call Container */}
      {!callEnded && <div ref={zegoContainer} className="w-full h-[500px]" />}
    </div>
  );
};

export default ZegoCloudInvite;
