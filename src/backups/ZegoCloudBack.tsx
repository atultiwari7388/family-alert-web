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

//1 feb 18:12 2025

//ZegoCloudInvite.tsx

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
//   // const [membersToCall, setMembersToCall] = useState<string[]>([]); // Track members to call

//   useEffect(() => {
//     const myMeeting = async () => {
//       if (!zegoContainer.current) return;

//       setIsLoading(true);
//       try {
//         await navigator.mediaDevices.getUserMedia({ audio: true });

//         const appId = APP_ID;
//         const serverSecret = SERVER_SECRET;
//         const userName = `${uName}_${userId}`;

//         const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//           appId,
//           serverSecret,
//           roomID,
//           userId,
//           userName,
//           Date.now() + 3600 * 1000
//         );

//         const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
//         zegoInstance.addPlugins({ ZIM });

//         zegoInstance.joinRoom({
//           container: zegoContainer.current,
//           scenario: {
//             mode: ZegoUIKitPrebuilt.GroupCall,
//           },
//           turnOnCameraWhenJoining: false,
//           turnOnMicrophoneWhenJoining: true,
//           showScreenSharingButton: false,
//           showRoomTimer: true,
//           showUserList: true,
//         });

//         setZp(zegoInstance);
//       } catch (error) {
//         if (error instanceof DOMException && error.name === "NotAllowedError") {
//           onError("Permission denied for microphone.");
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

//   const callMember = (member: { uid: string; name: string }) => {
//     if (!zp) return; // Ensure Zego instance is available

//     const MAX_RETRIES = 3;
//     const RETRY_DELAY = 1000;

//     let retryCount = 0;

//     const sendInvitation = () => {
//       zp.sendCallInvitation({
//         callees: [{ userID: member.uid, userName: member.name }],
//         callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//         timeout: 60,
//       })
//         .then(() => {
//           console.log(`Call invitation sent to ${member.name}`);
//         })
//         .catch((error) => {
//           console.error(`Failed to call ${member.name}:`, error);
//           if (retryCount < MAX_RETRIES) {
//             retryCount++;
//             console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
//             setTimeout(sendInvitation, RETRY_DELAY);
//           } else {
//             onError(`Failed to call ${member.name} after multiple attempts.`);
//           }
//         });
//     };

//     sendInvitation();
//   };

//   return (
//     <div>
//       {isLoading && <div>Connecting...</div>}
//       <div ref={zegoContainer} style={{ width: "100%", height: "500px" }}></div>

//       {/* List of members with call buttons */}
//       <div>
//         {members.map((member) => (
//           <div key={member.uid}>
//             {member.name} ({member.uid})
//             <button onClick={() => callMember(member)}>Call</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ZegoCloudInvite;

//new backup 4 feb 2025

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// interface ZegoCloudInviteProps {
//   userId: string;
//   members: { uid: string; name: string }[];
//   onError: (error: string) => void;
//   roomID: string;
//   userName: string;
// }

// const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
//   userId,
//   members,
//   onError,
//   roomID,
//   userName,
// }) => {
//   const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
//   const zegoContainer = useRef<HTMLDivElement | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

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
//       throw error; // Re-throw the error to be caught in useEffect
//     }
//   };

//   useEffect(() => {
//     let isMounted = true;

//     const myMeeting = async () => {
//       if (!zegoContainer.current) return;

//       setIsLoading(true);

//       try {
//         const fetchedToken = await fetchToken(userId, roomID);

//         if (!isMounted) return;

//         console.log("Fetched Token (for kitToken):", fetchedToken);
//         const hardCodedUserName = "Kalua Don";

//         const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
//           parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || ""),
//           fetchedToken,
//           roomID,
//           userId,
//           hardCodedUserName
//           // userName.trim()
//         );

//         console.log("Generated kitToken:", kitToken);

//         const zp = ZegoUIKitPrebuilt.create(kitToken);
//         zpRef.current = zp;

//         zp.joinRoom({
//           container: zegoContainer.current,
//           scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
//           turnOnCameraWhenJoining: false,
//           turnOnMicrophoneWhenJoining: true,
//           showScreenSharingButton: false,
//           showRoomTimer: true,
//           showUserList: true,
//         });
//       } catch (error: Error | unknown) {
//         const errorMessage =
//           error instanceof Error ? error.message : "Failed to join room";
//         console.error("Error joining room:", error);
//         onError(errorMessage);
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     if (userId && roomID) {
//       myMeeting();
//     }

//     return () => {
//       isMounted = false;
//       if (zpRef.current) {
//         zpRef.current.destroy();
//         zpRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, roomID, userName, onError]); // Correct dependencies

//   const callMember = (member: { uid: string; name: string }) => {
//     if (!zpRef.current) {
//       onError("Connection not ready");
//       return;
//     }

//     const MAX_RETRIES = 3;
//     let retryCount = 0;

//     const sendInvitation = async () => {
//       try {
//         await zpRef.current!.sendCallInvitation({
//           callees: [{ userID: member.uid, userName: member.name }],
//           callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//           timeout: 60,
//         });
//         console.log(`Call invitation sent to ${member.name}`);
//       } catch (error: Error | unknown) {
//         const errorMessage =
//           error instanceof Error ? error.message : String(error);
//         console.error("Error sending invitation:", errorMessage);
//         if (retryCount < MAX_RETRIES) {
//           retryCount++;
//           setTimeout(sendInvitation, 1000);
//         } else {
//           onError(
//             `Failed to call ${member.name} after ${MAX_RETRIES} attempts`
//           );
//         }
//       }
//     };

//     sendInvitation();
//   };

//   return (
//     <div>
//       {isLoading && <div>Connecting...</div>} {/* Loading indicator */}
//       <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
//       <div className="member-list">
//         <div>My User Name is {userName}</div>
//         {members.map((member) => (
//           <div key={member.uid} className="member-item">
//             <span>
//               {member.name} ({member.uid})
//             </span>
//             <button onClick={() => callMember(member)} disabled={isLoading}>
//               Call
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ZegoCloudInvite;

//date 4 feb 17:58 pm

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { ZIM } from "zego-zim-web"; // Correct import for web

// interface ZegoCloudInviteProps {
//   members: { uid: string; name: string }[];
//   onError: (error: string) => void;
//   userName: string;
// }

// const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = ({
//   members,
//   onError,
//   userName,
// }) => {
//   const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
//   const zegoContainer = useRef<HTMLDivElement | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [roomID, setRoomID] = useState<string | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [isCalling, setIsCalling] = useState(false);
//   const [callingMember, setCallingMember] = useState<{
//     uid: string;
//     name: string;
//   } | null>(null);

//   const generateUniqueRoomId = () => {
//     return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   const generateUniqueUserId = () => {
//     return `userID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
//     const storedUserID = localStorage.getItem("zego_user_id");

//     if (storedRoomID) {
//       setRoomID(storedRoomID);
//     } else {
//       const newRoomID = generateUniqueRoomId();
//       setRoomID(newRoomID);
//       localStorage.setItem("zego_room_id", newRoomID);
//     }

//     if (storedUserID) {
//       setUserId(storedUserID);
//     } else {
//       const newUserID = generateUniqueUserId();
//       setUserId(newUserID);
//       localStorage.setItem("zego_user_id", newUserID);
//     }
//   }, []);

//   useEffect(() => {
//     const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
//     console.log("Zego App Id", appId);
//     console.log(
//       "Zego App Secret Key",
//       process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
//     );

//     let isMounted = true;
//     let callStarted = false;
//     let zp: ZegoUIKitPrebuilt | null = null;

//     const myMeeting = async () => {
//       if (!zegoContainer.current) return;

//       setIsLoading(true);

//       try {
//         if (roomID && userId) {
//           const fetchedToken = await fetchToken(userId, roomID);

//           if (!isMounted) return;

//           const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
//             appId,
//             fetchedToken,
//             roomID,
//             userId,
//             userName.trim()
//           );

//           zp = ZegoUIKitPrebuilt.create(kitToken);
//           zpRef.current = zp;

//           zp.addPlugins({ ZIM }); // Correct ZIM integration

//           zp.joinRoom({
//             container: zegoContainer.current,
//             scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
//             turnOnCameraWhenJoining: false,
//             turnOnMicrophoneWhenJoining: true,
//             showScreenSharingButton: false,
//             showRoomTimer: true,
//             showUserList: true,
//             onUserJoin: () => {
//               if (isMounted && !callStarted && members.length > 0) {
//                 callStarted = true;
//                 startCall(members[0]);
//               }
//             },
//           });
//         }
//       } catch (error: Error | unknown) {
//         const errorMessage =
//           error instanceof Error
//             ? error.message
//             : "Failed to join room or initialize ZIM: " + String(error);
//         console.error("Error:", error);
//         onError(errorMessage);
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     if (userId && roomID) {
//       myMeeting();
//     }

//     return () => {
//       isMounted = false;
//       if (zpRef.current) {
//         zpRef.current.destroy();
//         zpRef.current = null;
//       }
//       zp = null;
//     };
//   }, [userId, userName, onError, roomID, members]);

//   const startCall = (member: { uid: string; name: string }) => {
//     setIsCalling(true);
//     setCallingMember(member);
//     callMember(member);
//   };

//   const endCall = () => {
//     if (zpRef.current) {
//       zpRef.current.hangUp();
//     }
//     setIsCalling(false);
//     setCallingMember(null);
//   };

//   const callMember = (member: { uid: string; name: string }) => {
//     if (!zpRef.current) {
//       onError("Connection not ready");
//       return;
//     }

//     const MAX_RETRIES = 3;
//     let retryCount = 0;

//     const sendInvitation = async () => {
//       try {
//         await zpRef.current!.sendCallInvitation({
//           callees: [{ userID: member.uid, userName: member.name }],
//           callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//           timeout: 60,
//         });
//         console.log(`Call invitation sent to ${member.name}`);
//       } catch (error: Error | unknown) {
//         const errorMessage =
//           error instanceof Error ? error.message : String(error);
//         console.error("Error sending invitation:", errorMessage);
//         if (retryCount < MAX_RETRIES) {
//           retryCount++;
//           setTimeout(sendInvitation, 1000);
//         } else {
//           onError(
//             `Failed to call ${member.name} after ${MAX_RETRIES} attempts`
//           );
//         }
//       }
//     };

//     sendInvitation();
//   };

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
//           {members.map((member) => (
//             <div key={member.uid} className="member-item">
//               <span>
//                 {member.name} ({member.uid})
//               </span>
//               <button onClick={() => startCall(member)} disabled={isLoading}>
//                 Call
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <div
//         ref={zegoContainer}
//         style={{ width: "100%", height: "500px", display: "none" }}
//       />
//     </div>
//   );
// };

// export default ZegoCloudInvite;

//5 Feb 2025

"use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
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
//     const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
//     console.log("Zego App Id", appId);
//     console.log(
//       "Zego App Secret Key",
//       process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
//     );

//     let isMounted = true;
//     let callStarted = false;
//     let zp: ZegoUIKitPrebuilt | null = null;

//     const myMeeting = async () => {
//       if (!zegoContainer.current) return;

//       setIsLoading(true);

//       try {
//         if (roomID && userId) {
//           const fetchedToken = await fetchToken(userId, roomID);

//           if (!isMounted) return;

//           const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
//             appId,
//             fetchedToken,
//             roomID,
//             userId,
//             userName.trim()
//           );

//           zp = ZegoUIKitPrebuilt.create(kitToken);
//           zpRef.current = zp;

//           zp.addPlugins({ ZIM });

//           zp.joinRoom({
//             container: zegoContainer.current,
//             scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
//             turnOnCameraWhenJoining: false,
//             turnOnMicrophoneWhenJoining: true,
//             showScreenSharingButton: false,
//             showRoomTimer: true,
//             showUserList: true,
//             onUserJoin: () => {
//               if (isMounted && !callStarted && members.length > 0) {
//                 callStarted = true;
//                 startCall(members[0]);
//               }
//             },
//           });
//         }
//       } catch (error: Error | unknown) {
//         const errorMessage =
//           error instanceof Error
//             ? error.message
//             : "Failed to join room or initialize ZIM: " + String(error);
//         console.error("Error:", error);
//         onError(errorMessage);
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     if (userId && roomID) {
//       myMeeting();
//     }

//     return () => {
//       isMounted = false;
//       if (zpRef.current) {
//         zpRef.current.destroy();
//         zpRef.current = null;
//       }
//       zp = null;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, userName, onError, roomID, members]);

//   const startCall = (member: { uid: string; name: string }) => {
//     setIsCalling(true);
//     setCallingMember(member);
//     callMember(member);
//   };

//   const endCall = () => {
//     if (zpRef.current) {
//       zpRef.current.hangUp();
//     }
//     setIsCalling(false);
//     setCallingMember(null);
//   };

//   const callMember = async (member: { uid: string; name: string }) => {
//     if (!zpRef.current) {
//       onError("Connection not ready");
//       return;
//     }

//     if (isSendingInvitation) {
//       return;
//     }

//     setIsSendingInvitation(true);

//     try {
//       const MAX_RETRIES = 3;
//       let retryCount = 0;

//       const sendInvitation = async () => {
//         try {
//           await zpRef.current!.sendCallInvitation({
//             callees: [{ userID: member.uid, userName: member.name }],
//             callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//             timeout: 60,
//           });
//           console.log(`Call invitation sent to ${member.name}`);
//         } catch (error: Error | unknown) {
//           const errorMessage =
//             error instanceof Error ? error.message : String(error);
//           console.error("Error sending invitation:", errorMessage);
//           if (retryCount < MAX_RETRIES) {
//             retryCount++;
//             setTimeout(sendInvitation, 1000);
//           } else {
//             onError(
//               `Failed to call ${member.name} after ${MAX_RETRIES} attempts`
//             );
//           }
//         }
//       };

//       await sendInvitation();
//     } catch (error) {
//       console.error("Error in callMember:", error);
//       onError("An error occurred while calling.");
//     } finally {
//       setIsSendingInvitation(false);
//     }
//   };

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
//           {members.map((member) => (
//             <div key={member.uid} className="member-item">
//               <span>
//                 {member.name} ({member.uid})
//               </span>
//               <button
//                 onClick={() => startCall(member)}
//                 disabled={isLoading || isSendingInvitation}
//                 className="bg-blue-500 rounded-sm"
//               >
//                 Call
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <div
//         ref={zegoContainer}
//         style={{ width: "100%", height: "500px", display: "none" }}
//       />
//     </div>
//   );
// };

// export default ZegoCloudInvite;

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
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
//     const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
//     console.log("Zego App Id", appId);
//     console.log(
//       "Zego App Secret Key",
//       process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
//     );

//     let isMounted = true;
//     // let callStarted = false;
//     let zp: ZegoUIKitPrebuilt | null = null;

//     const myMeeting = async () => {
//       if (!zegoContainer.current) return;

//       setIsLoading(true);

//       try {
//         if (roomID && userId) {
//           const fetchedToken = await fetchToken(userId, roomID);

//           if (!isMounted) return;

//           const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
//             appId,
//             fetchedToken,
//             roomID,
//             userId,
//             userName.trim()
//           );

//           zp = ZegoUIKitPrebuilt.create(kitToken);
//           zpRef.current = zp;

//           zp.addPlugins({ ZIM });

//           // zp.joinRoom({
//           //   container: zegoContainer.current,
//           //   // <--- Configuration object is here
//           //   turnOnMicrophoneWhenJoining: false, // Set to true if needed
//           //   turnOnCameraWhenJoining: false, // Set to true if needed
//           //   showMyCameraToggleButton: true,
//           //   showMyMicrophoneToggleButton: true,
//           //   showAudioVideoSettingsButton: true,
//           //   showScreenSharingButton: true,
//           //   showTextChat: true,
//           //   showUserList: true,
//           //   maxUsers: 50, // Or your desired max users
//           //   layout: "Sidebar", // Or "Grid"
//           //   showLayoutButton: true,
//           //   scenario: {
//           //     mode: ZegoUIKitPrebuilt.OneONoneCall,
//           //     config: {
//           //       role: ZegoUIKitPrebuilt.Host,
//           //     },
//           //   },
//           //   onUserJoin: () => {
//           //     if (isMounted && !callStarted && members.length > 0) {
//           //       callStarted = true;
//           //       startCall(members[0]);
//           //     }
//           //   },
//           // });
//         }
//       } catch (error: Error | unknown) {
//         const errorMessage =
//           error instanceof Error
//             ? error.message
//             : "Failed to join room or initialize ZIM: " + String(error);
//         console.error("Error:", error);
//         onError(errorMessage);
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     if (userId && roomID) {
//       myMeeting();
//     }

//     return () => {
//       isMounted = false;
//       if (zpRef.current) {
//         zpRef.current.destroy();
//         zpRef.current = null;
//       }
//       zp = null;
//     };
//   }, [userId, userName, onError, roomID, members]);

//   const startCall = (member: { uid: string; name: string }) => {
//     setIsCalling(true);
//     setCallingMember(member);
//     callMember(member);
//   };

//   const endCall = () => {
//     if (zpRef.current) {
//       zpRef.current.hangUp();
//     }
//     setIsCalling(false);
//     setCallingMember(null);
//   };

//   const callMember = async (member: { uid: string; name: string }) => {
//     if (!zpRef.current) {
//       onError("Connection not ready");
//       return;
//     }

//     if (isSendingInvitation) {
//       return;
//     }

//     setIsSendingInvitation(true);

//     try {
//       const MAX_RETRIES = 3;
//       let retryCount = 0;

//       const sendInvitation = async () => {
//         try {
//           await zpRef.current!.sendCallInvitation({
//             callees: [{ userID: member.uid, userName: member.name }],
//             callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
//             timeout: 60,
//           });
//           console.log(`Call invitation sent to ${member.name}`);
//         } catch (error: Error | unknown) {
//           const errorMessage =
//             error instanceof Error ? error.message : String(error);
//           console.error("Error sending invitation:", errorMessage);
//           if (retryCount < MAX_RETRIES) {
//             retryCount++;
//             setTimeout(sendInvitation, 1000);
//           } else {
//             onError(
//               `Failed to call ${member.name} after ${MAX_RETRIES} attempts`
//             );
//           }
//         }
//       };

//       await sendInvitation();
//     } catch (error) {
//       console.error("Error in callMember:", error);
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
//                 <button
//                   onClick={() => startCall(member)} // Call startCall for this member
//                   disabled={isLoading || isSendingInvitation}
//                   className="bg-blue-500 rounded-sm"
//                 >
//                   Call
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
//     </div>
//   );
// };

// export default ZegoCloudInvite;
