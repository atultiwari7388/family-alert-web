// UserDetails.tsx
// "use client";

// import { useEffect, useState } from "react";
// import {
//   collection,
//   doc,
//   DocumentReference,
//   getDoc,
//   getDocs,
// } from "firebase/firestore";
// import { db } from "@/lib/firestore/firebase";
// import ZegoCloudInvite from "./ZegoCloudInvite"; // Import the new component

// interface UserData {
//   email: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   mobileNumber: string | null;
//   joinedVehicles?: string[];
// }

// interface MemberData {
//   uid: string;
//   name: string;
// }

// export default function UserDetails({ userId }: { userId: string }) {
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [members, setMembers] = useState<MemberData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!userId) return;

//     const fetchUserDetails = async () => {
//       try {
//         const userRef = doc(db, "userCollection", userId);
//         const userSnap = await getDoc(userRef);
//         if (!userSnap.exists()) {
//           setUserData(null);
//           setLoading(false);
//           return;
//         }

//         const userData = userSnap.data() as UserData;
//         setUserData(userData);

//         if (userData.joinedVehicles && userData.joinedVehicles.length > 0) {
//           const vehicleGroupPromises = userData.joinedVehicles.map(
//             async (vehicleId) => {
//               const vehicleGroupRef = doc(db, "vehicleGroups", vehicleId);
//               const vehicleGroupSnap = await getDoc(vehicleGroupRef);
//               if (
//                 vehicleGroupSnap.exists() &&
//                 vehicleGroupSnap.data().admin === userId
//               ) {
//                 return vehicleGroupRef;
//               }
//               return null;
//             }
//           );

//           const matchedVehicleGroupRefs = (
//             await Promise.all(vehicleGroupPromises)
//           ).filter((ref): ref is DocumentReference => ref !== null);

//           const memberPromises = matchedVehicleGroupRefs.map(
//             async (groupRef) => {
//               const membersCollectionRef = collection(groupRef, "members");
//               const membersSnap = await getDocs(membersCollectionRef);

//               const memberData = await Promise.all(
//                 membersSnap.docs.map(async (memberDoc) => {
//                   const memberUid = memberDoc.id;
//                   const memberUserRef = doc(db, "userCollection", memberUid);
//                   const memberUserSnap = await getDoc(memberUserRef);

//                   if (memberUserSnap.exists()) {
//                     const { firstName, lastName } =
//                       memberUserSnap.data() as UserData;
//                     return {
//                       uid: memberUid,
//                       name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
//                     };
//                   }

//                   return { uid: memberUid, name: "Unknown User" };
//                 })
//               );

//               return memberData;
//             }
//           );

//           const allMembers = (await Promise.all(memberPromises)).flat();
//           setMembers(allMembers);
//         }
//       } catch (error) {
//         console.error("Error fetching user or members:", error);
//         setError("Failed to fetch user data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, [userId]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-gray-600">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-gray-600">{error}</p>
//       </div>
//     );
//   }

//   if (!userData) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-red-500">User not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen w-full flex items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-4 sm:p-6 rounded-2xl relative flex flex-col justify-between min-h-[80vh] sm:min-h-[600px]">
//         <div className="text-center mt-8 sm:mt-4">
//           <h1 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Alert</h1>
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-8">
//             {`${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim()}
//             &apos;s Group Call
//           </h2>
//         </div>

//         <ZegoCloudInvite
//           userData={userData}
//           userId={userId}
//           members={members}
//           onError={setError}
//           roomID={userId}
//         />
//       </div>
//     </div>
//   );
// }

// UserDetails.tsx
"use client";

import dynamic from "next/dynamic"; // Import dynamic from Next.js
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";

// Dynamically import ZegoCloudInvite with SSR disabled
const ZegoCloudInvite = dynamic(() => import("./ZegoCloudInvite"), {
  ssr: false,
});

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
  joinedVehicles?: string[];
}

interface MemberData {
  uid: string;
  name: string;
}

export default function UserDetails({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const userRef = doc(db, "userCollection", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setUserData(null);
          setLoading(false);
          return;
        }

        const userData = userSnap.data() as UserData;
        setUserData(userData);

        if (userData.joinedVehicles && userData.joinedVehicles.length > 0) {
          const vehicleGroupPromises = userData.joinedVehicles.map(
            async (vehicleId) => {
              const vehicleGroupRef = doc(db, "vehicleGroups", vehicleId);
              const vehicleGroupSnap = await getDoc(vehicleGroupRef);
              if (
                vehicleGroupSnap.exists() &&
                vehicleGroupSnap.data().admin === userId
              ) {
                return vehicleGroupRef;
              }
              return null;
            }
          );

          const matchedVehicleGroupRefs = (
            await Promise.all(vehicleGroupPromises)
          ).filter((ref): ref is DocumentReference => ref !== null);

          const memberPromises = matchedVehicleGroupRefs.map(
            async (groupRef) => {
              const membersCollectionRef = collection(groupRef, "members");
              const membersSnap = await getDocs(membersCollectionRef);

              const memberData = await Promise.all(
                membersSnap.docs.map(async (memberDoc) => {
                  const memberUid = memberDoc.id;
                  const memberUserRef = doc(db, "userCollection", memberUid);
                  const memberUserSnap = await getDoc(memberUserRef);

                  if (memberUserSnap.exists()) {
                    const { firstName, lastName } =
                      memberUserSnap.data() as UserData;
                    return {
                      uid: memberUid,
                      name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
                    };
                  }

                  return { uid: memberUid, name: "Unknown User" };
                })
              );

              return memberData;
            }
          );

          const allMembers = (await Promise.all(memberPromises)).flat();
          setMembers(allMembers);
        }
      } catch (error) {
        console.error("Error fetching user or members:", error);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4 sm:p-6 rounded-2xl relative flex flex-col justify-between min-h-[80vh] sm:min-h-[600px]">
        <div className="text-center mt-8 sm:mt-4">
          <h1 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Alert</h1>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-8">
            {`${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim()}
            &apos;s Group Call
          </h2>
        </div>

        <ZegoCloudInvite
          // userData={userData}
          userId={userId}
          members={members}
          onError={setError}
          roomID={userId}
          uName={`${userData.firstName ?? ""} ${
            userData.lastName ?? ""
          }`.trim()}
        />
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import {
//   collection,
//   doc,
//   DocumentReference,
//   getDoc,
//   getDocs,
// } from "firebase/firestore";
// import { db } from "@/lib/firestore/firebase";
// import { MdCallEnd } from "react-icons/md";
// import { HiOutlineSpeakerWave } from "react-icons/hi2";
// import { AiOutlineAudioMuted } from "react-icons/ai";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { APP_ID, SERVER_SECRET } from "@/utils/constants";

// interface UserData {
//   email: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   mobileNumber: string | null;
//   joinedVehicles?: string[];
// }

// interface MemberData {
//   uid: string;
//   name: string;
// }

// interface TargetUser {
//   userID: string;
//   userName: string;
// }

// export default function UserDetails({ userId }: { userId: string }) {
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [members, setMembers] = useState<MemberData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!userId) return;

//     const fetchUserDetails = async () => {
//       try {
//         const userRef = doc(db, "userCollection", userId);
//         const userSnap = await getDoc(userRef);
//         if (!userSnap.exists()) {
//           setUserData(null);
//           setLoading(false);
//           return;
//         }

//         const userData = userSnap.data() as UserData;
//         setUserData(userData);

//         if (userData.joinedVehicles && userData.joinedVehicles.length > 0) {
//           const vehicleGroupPromises = userData.joinedVehicles.map(
//             async (vehicleId) => {
//               const vehicleGroupRef = doc(db, "vehicleGroups", vehicleId);
//               const vehicleGroupSnap = await getDoc(vehicleGroupRef);
//               if (
//                 vehicleGroupSnap.exists() &&
//                 vehicleGroupSnap.data().admin === userId
//               ) {
//                 return vehicleGroupRef;
//               }
//               return null;
//             }
//           );

//           const matchedVehicleGroupRefs = (
//             await Promise.all(vehicleGroupPromises)
//           ).filter((ref): ref is DocumentReference => ref !== null);

//           const memberPromises = matchedVehicleGroupRefs.map(
//             async (groupRef) => {
//               const membersCollectionRef = collection(groupRef, "members");
//               const membersSnap = await getDocs(membersCollectionRef);

//               const memberData = await Promise.all(
//                 membersSnap.docs.map(async (memberDoc) => {
//                   const memberUid = memberDoc.id;
//                   const memberUserRef = doc(db, "userCollection", memberUid);
//                   const memberUserSnap = await getDoc(memberUserRef);

//                   if (memberUserSnap.exists()) {
//                     const { firstName, lastName } =
//                       memberUserSnap.data() as UserData;
//                     return {
//                       uid: memberUid,
//                       name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
//                     };
//                   }

//                   return { uid: memberUid, name: "Unknown User" };
//                 })
//               );

//               return memberData;
//             }
//           );

//           const allMembers = (await Promise.all(memberPromises)).flat();
//           setMembers(allMembers);
//         }
//       } catch (error) {
//         console.error("Error fetching user or members:", error);
//         setError("Failed to fetch user data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, [userId]);

//   useEffect(() => {
//     if (userData) {
//       const loadZego = async () => {
//         try {
//           const { ZIM } = await import("zego-zim-web");
//           const { ZegoUIKitPrebuilt } = await import(
//             "@zegocloud/zego-uikit-prebuilt"
//           );

//           const appID = APP_ID;
//           const serverSecret = SERVER_SECRET;

//           if (!appID || !serverSecret) {
//             setError("Zego App ID or Server Secret is missing!");
//             return;
//           }

//           const userID = userId;
//           const userName =
//             `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() +
//             userID;
//           const roomID = userID;

//           const TOKEN = ZegoUIKitPrebuilt.generateKitTokenForTest(
//             appID,
//             serverSecret,
//             roomID,
//             userID,
//             userName
//           );

//           const zegoInstance = ZegoUIKitPrebuilt.create(TOKEN);
//           zegoInstance.addPlugins({ ZIM });
//           setZp(zegoInstance);
//         } catch (error) {
//           console.error("Error initializing Zego SDK: ", error);
//           setError("Failed to initialize Zego SDK.");
//         }
//       };

//       loadZego();
//     }
//   }, [userData]);

//   useEffect(() => {
//     return () => {
//       if (zp) {
//         zp.destroy();
//       }
//     };
//   }, [zp]);

//   const invite = (targetUser: TargetUser) => {
//     if (zp) {
//       zp.sendCallInvitation({
//         callees: [targetUser],
//         callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
//         timeout: 60,
//       })
//         .then((res) => {
//           console.warn(res);
//         })
//         .catch((err) => {
//           console.warn(err);
//         });
//     } else {
//       console.warn("Zego instance is not initialized.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-gray-600">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-gray-600">{error}</p>
//       </div>
//     );
//   }

//   if (!userData) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-red-500">User not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen w-full flex items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-4 sm:p-6 rounded-2xl relative flex flex-col justify-between min-h-[80vh] sm:min-h-[600px]">
//         <div className="text-center mt-8 sm:mt-4">
//           <h1 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Alert</h1>
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-8">
//             {`${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim()}
//             &apos;s Group Call
//           </h2>
//         </div>

//         <div className="space-y-4">
//           {members.map((member) => (
//             <div
//               key={member.uid}
//               className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
//             >
//               <div>
//                 <h2 className="text-sm font-medium">{member.name}</h2>
//                 <p className="text-xs font-medium text-green-600">Ringing...</p>
//               </div>
//               <button
//                 className="bg-red-100 p-2 rounded-full"
//                 onClick={() =>
//                   invite({ userID: member.uid, userName: member.name })
//                 }
//               >
//                 <MdCallEnd className="text-red-500" />
//               </button>
//             </div>
//           ))}
//         </div>

//         <div className="mt-6 flex justify-center space-x-10">
//           <button className="bg-gray-200 p-4 rounded-full">
//             <HiOutlineSpeakerWave className="text-gray-600 text-lg" />
//           </button>
//           <button className="bg-gray-200 p-4 rounded-full">
//             <AiOutlineAudioMuted className="text-gray-600 text-lg" />
//           </button>
//         </div>

//         <div className="mt-6 flex justify-center">
//           <button className="bg-red-500 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-600">
//             End Group Call
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
