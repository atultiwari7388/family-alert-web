// "use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { ZIM } from "zego-zim-web";
// import { FcVideoCall } from "react-icons/fc";
// import { APP_ID, SERVER_SECRET } from "@/utils/constants";

// interface ZegoCloudInviteProps {
//   userId: string;
//   members: { uid: string; name: string }[];
//   onError: (error: string) => void;
//   roomID: string;
//   uName: string;
// }

// const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
//   userId,
//   members,
//   onError,
//   roomID,
//   uName,
// }) => {
//   const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
//   const [isClient, setIsClient] = useState(false);
//   const [callInvited, setCallInvited] = useState<string | null>(null);
//   const zegoContainer = useRef<HTMLDivElement | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isZegoReady, setIsZegoReady] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const myMeeting = async () => {
//     // Ensure container exists before proceeding
//     if (!zegoContainer.current) {
//       console.warn("Zego container is not available yet. Retrying...");
//       setTimeout(myMeeting, 500); // Retry after 500ms
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

//       const appId = APP_ID;
//       const serverSecret = SERVER_SECRET;
//       const userName = `${uName}_${userId}`;

//       const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//         appId,
//         serverSecret,
//         roomID,
//         userId,
//         userName,
//         Date.now() + 3600 * 1000
//       );

//       const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
//       zegoInstance.addPlugins({ ZIM });

//       zegoInstance.joinRoom({
//         container: zegoContainer.current, // Ensure container exists
//         sharedLinks: [
//           {
//             name: "Copy link",
//             url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
//           },
//         ],
//         scenario: {
//           mode: ZegoUIKitPrebuilt.OneONoneCall,
//         },
//       });

//       setZp(zegoInstance);
//       setIsZegoReady(true);
//     } catch (error) {
//       if (error instanceof DOMException && error.name === "NotAllowedError") {
//         onError("Permission denied for camera and microphone.");
//       } else {
//         onError("An unknown error occurred.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userId && roomID) {
//       const checkContainerReady = setInterval(() => {
//         if (zegoContainer.current) {
//           clearInterval(checkContainerReady);
//           myMeeting();
//         }
//       }, 500); // Retry every 500ms
//     }

//     return () => {
//       if (zp) {
//         zp.destroy();
//         setZp(null);
//         setIsZegoReady(false);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, roomID]);

//   const invite = (targetUser: { userID: string; userName: string }) => {
//     if (!isZegoReady) return;

//     if (zp) {
//       setCallInvited(targetUser.userID);
//       zp.sendCallInvitation({
//         callees: [targetUser],
//         callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
//         timeout: 60,
//       }).catch(() => {
//         onError("Failed to send call invitation.");
//         setCallInvited(null);
//       });
//     }
//   };

//   if (!isClient) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       {isLoading && <div>Loading...</div>}
//       <div
//         ref={(el) => {
//           zegoContainer.current = el;
//         }}
//         style={{ width: "100%", height: "500px" }}
//       ></div>
//       <div className="space-y-4">
//         {members.map((member) => (
//           <div
//             key={member.uid}
//             className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
//           >
//             <div>
//               <h2 className="text-sm font-medium">{member.name}</h2>
//               <p className="text-xs font-medium text-green-600">
//                 {member.uid === callInvited ? "Inviting..." : "Available"}
//               </p>
//             </div>
//             <button
//               className="bg-red-100 p-2 rounded-full"
//               onClick={() =>
//                 invite({ userID: member.uid, userName: member.name })
//               }
//               disabled={!isZegoReady || member.uid === callInvited || isLoading}
//             >
//               <FcVideoCall className="text-red-500" />
//               Invite
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ZegoCloudInvite;

//1 Feb 14:19 2025

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { ZIM } from "zego-zim-web";
// import { APP_ID, SERVER_SECRET } from "@/utils/constants";

// interface ZegoCloudInviteProps {
//   userId: string;
//   members: { uid: string; name: string }[];
//   onError: (error: string) => void;
//   roomID: string;
//   uName: string;
// }

// const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
//   userId,
//   members,
//   onError,
//   roomID,
//   uName,
// }) => {
//   const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
//   const zegoContainer = useRef<HTMLDivElement | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const myMeeting = async () => {
//       if (!zegoContainer.current) return;

//       setIsLoading(true);
//       try {
//         // Request audio permission only (no video)
//         await navigator.mediaDevices.getUserMedia({ audio: true });

//         const appId = APP_ID;
//         const serverSecret = SERVER_SECRET;
//         const userName = `${uName}_${userId}`;

//         // Generate token
//         const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//           appId,
//           serverSecret,
//           roomID,
//           userId,
//           userName,
//           Date.now() + 3600 * 1000
//         );

//         // Create Zego instance
//         const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
//         zegoInstance.addPlugins({ ZIM });

//         // Join the room as a voice call
//         zegoInstance.joinRoom({
//           container: zegoContainer.current,
//           scenario: {
//             mode: ZegoUIKitPrebuilt.GroupCall,
//           },
//           turnOnCameraWhenJoining: false, // Voice-only mode
//           turnOnMicrophoneWhenJoining: true, // Enable microphone
//           showScreenSharingButton: false, // No screen share
//           showRoomTimer: true, // Show call duration
//           showUserList: true, // Show who joined
//         });

//         setZp(zegoInstance);

//         // Invite all group members
//         inviteMembers(zegoInstance);
//       } catch (error) {
//         if (error instanceof DOMException && error.name === "NotAllowedError") {
//           onError("Permission denied for camera and microphone.");
//         } else {
//           onError("An unknown error occurred.");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (userId && roomID) {
//       myMeeting();
//     }

//     return () => {
//       if (zp) {
//         zp.destroy();
//         setZp(null);
//       }
//     };
//   }, [userId, roomID]);

//   // const inviteMembers = (zegoInstance: ZegoUIKitPrebuilt) => {

//   //   if (!zegoInstance) return;

//   //   members.forEach((member) => {
//   //     zegoInstance
//   //       .sendCallInvitation({
//   //         callees: [{ userID: member.uid, userName: member.name }],
//   //         callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall, // Voice Call
//   //         timeout: 60, // 60 seconds to accept
//   //       })
//   //       .catch(() => {
//   //         onError(`Failed to call ${member.name}`);
//   //       });
//   //   });
//   // };

//   const inviteMembers = (zegoInstance: ZegoUIKitPrebuilt) => {
//     if (!zegoInstance) return;

//     const MAX_RETRIES = 3;
//     const RETRY_DELAY = 1000; // 1 second

//     members.forEach((member) => {
//       let retryCount = 0;

//       const sendInvitation = () => {
//         zegoInstance
//           .sendCallInvitation({
//             callees: [{ userID: member.uid, userName: member.name }],
//             callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//             timeout: 60,
//           })
//           .then(() => {
//             console.log(`Call invitation sent to ${member.name}`);
//           })
//           .catch((error) => {
//             console.error(`Failed to call ${member.name}:`, error);
//             if (retryCount < MAX_RETRIES) {
//               retryCount++;
//               console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
//               setTimeout(sendInvitation, RETRY_DELAY);
//             } else {
//               onError(`Failed to call ${member.name} after multiple attempts.`);
//             }
//           });
//       };

//       sendInvitation();
//     });
//   };

//   return (
//     <div>
//       {isLoading && <div>Connecting...</div>}
//       <div ref={zegoContainer} style={{ width: "100%", height: "500px" }}></div>
//     </div>
//   );
// };

// export default ZegoCloudInvite;
