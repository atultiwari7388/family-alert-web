// "use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt, ZegoUser } from "@zegocloud/zego-uikit-prebuilt";
// import { ZIM } from "zego-zim-web";

// interface ZegoCloudInviteProps {
//   members: { uid: string; name: string }[];
//   onError: (error: string) => void;
//   userName: string;
//   userId: string;
// }

// const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
//   members,
//   onError,
//   userName,
//   userId,
// }) => {
//   const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
//   const zegoContainer = useRef<HTMLDivElement | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [roomID, setRoomID] = useState<string | null>(null);
//   const [isCalling, setIsCalling] = useState(false);
//   const [callingMember, setCallingMember] = useState<{
//     uid: string;
//     name: string;
//   } | null>(null);
//   const [isSendingInvitation, setIsSendingInvitation] = useState(false);

//   const generateUniqueRoomId = () => {
//     return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   const fetchToken = async (userId: string, roomID: string) => {
//     try {
//       const response = await fetch(
//         `/api/token?userID=${userId}&roomID=${roomID}`,
//         { method: "GET" }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(
//           `Token fetch failed: ${response.status} - ${errorText}`
//         );
//       }

//       const data = await response.json();
//       console.log("Fetched Data Token:", data.token);
//       return data.token;
//     } catch (error: unknown) {
//       console.error("Token error:", error);
//       onError(
//         "Token fetch failed: " +
//           (error instanceof Error ? error.message : "Unknown error")
//       );
//       throw error;
//     }
//   };

//   useEffect(() => {
//     const storedRoomID = localStorage.getItem("zego_room_id");

//     if (storedRoomID) {
//       setRoomID(storedRoomID);
//     } else {
//       const newRoomID = generateUniqueRoomId();
//       setRoomID(newRoomID);
//       localStorage.setItem("zego_room_id", newRoomID);
//     }
//   }, []);

//   useEffect(() => {
//     console.log("ref", zpRef);
//     const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
//     console.log("[Debug] Starting initialization with AppID:", appId);

//     let isMounted = true;
//     // let callStarted = false;
//     let zp: ZegoUIKitPrebuilt | null = null;

//     const myMeeting = async () => {
//       console.log(
//         "[Debug] myMeeting called, container:",
//         !!zegoContainer.current
//       );
//       if (!zegoContainer.current || !isMounted) {
//         console.log("[Debug] Container not ready or component unmounted");
//         return;
//       }

//       setIsLoading(true);

//       try {
//         if (roomID && userId) {
//           console.log("[Debug] Fetching token for roomID:", roomID);
//           const fetchedToken = await fetchToken(userId, roomID);
//           console.log("[Debug] Token fetched successfully");

//           if (!isMounted) {
//             console.log("[Debug] Component unmounted during token fetch");
//             return;
//           }

//           const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
//             appId,
//             fetchedToken,
//             roomID,
//             userId,
//             userName.trim()
//           );
//           console.log("[Debug] Kit token generated");

//           if (!isMounted) {
//             console.log("[Debug] Component unmounted before Zego creation");
//             return;
//           }

//           zp = ZegoUIKitPrebuilt.create(kitToken);
//           zpRef.current = zp;
//           zp.addPlugins({ ZIM });
//           console.log("[Debug] ZegoUIKitPrebuilt created and assigned to ref");
//         }
//       } catch (error) {
//         console.error("[Debug] Error in myMeeting:", error);
//         if (isMounted) {
//           onError(error instanceof Error ? error.message : String(error));
//         }
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     if (userId && roomID) {
//       console.log("[Debug] Calling myMeeting with userId:", userId);
//       myMeeting().catch((error) => {
//         console.error("[Debug] Unhandled error in myMeeting:", error);
//       });
//     }

//     return () => {
//       console.log("[Debug] Starting cleanup");
//       isMounted = false;
//       if (zpRef.current) {
//         console.log("[Debug] Destroying Zego instance");
//         zpRef.current.destroy();
//         zpRef.current = null;
//       }
//       zp = null;
//       console.log("[Debug] Cleanup complete");
//     };
//   }, [userId, userName, onError, roomID, members]);

//   const startCall = (members: { uid: string; name: string }[]) => {
//     setIsCalling(true);
//     console.log("Calling members", members);
//     callMembers(members);
//   };

//   const endCall = () => {
//     if (zpRef.current) {
//       zpRef.current.hangUp();
//     }
//     setIsCalling(false);
//     setCallingMember(null);
//   };

//   const callMembers = async (members: { uid: string; name: string }[]) => {
//     console.log("[Debug] callMembers called, zpRef.current:", !!zpRef.current);

//     if (isSendingInvitation) {
//       return;
//     }

//     setIsSendingInvitation(true);

//     try {
//       const MAX_RETRIES = 3;
//       let retryCount = 0;
//       // convert member array to ZegoUser array
//       const zegoUsers: ZegoUser[] = members.map((member) => ({
//         userID: member.uid,
//         userName: member.name,
//       }));
//       const sendInvitation = async () => {
//         try {
//           await zpRef.current!.sendCallInvitation({
//             callees: zegoUsers,
//             callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//             timeout: 60,
//           });
//           console.log(`Call invitation sent to ${members.length} members`);
//         } catch (error: Error | unknown) {
//           const errorMessage =
//             error instanceof Error ? error.message : String(error);
//           console.error("Error sending invitation:", errorMessage);
//           if (retryCount < MAX_RETRIES) {
//             retryCount++;
//             setTimeout(sendInvitation, 1000);
//           } else {
//             onError(`Failed to call members after ${MAX_RETRIES} attempts`);
//           }
//         }
//       };

//       await sendInvitation();
//     } catch (error) {
//       console.error("Error in callMembers:", error);
//       onError("An error occurred while calling.");
//     } finally {
//       setIsSendingInvitation(false);
//     }
//   };

//   if (members) {
//   }

//   return (
//     <div>
//       {isLoading && <div>Connecting...</div>}

//       {isCalling && callingMember && (
//         <div className="call-ui">
//           <div>Calling {callingMember.name}...</div>
//           <button onClick={endCall}>End Call</button>
//         </div>
//       )}

//       {!isCalling && (
//         <div className="member-list">
//           <div>My User Name is {userName}</div>
//           <div>My Members List</div>

//           {members.length === 0 ? ( // Check if members array is empty
//             <div>
//               Please select a primary group first or add members to the existing
//               group. {/* Display your custom message */}
//             </div>
//           ) : (
//             members.map((member) => (
//               <div key={member.uid} className="member-item">
//                 <span>
//                   {member.name} ({member.uid})
//                 </span>
//               </div>
//             ))
//           )}
//           <button
//             onClick={() => startCall(members)}
//             disabled={isLoading || isSendingInvitation}
//             className="bg-blue-500 rounded-sm"
//           >
//             Call All
//           </button>
//         </div>
//       )}

//       <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
//     </div>
//   );
// };

// export default ZegoCloudInvite;
