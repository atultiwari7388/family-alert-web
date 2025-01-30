"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { MdCallEnd } from "react-icons/md";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { AiOutlineAudioMuted } from "react-icons/ai";

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

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        // Fetch user data
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
          // Query vehicleGroups where ID matches joinedVehicles
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

          // Fetch members from matched vehicleGroups
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );

  if (!userData)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-500">User not found</p>
      </div>
    );

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4 sm:p-6 rounded-2xl relative flex flex-col justify-between border border-red-500 min-h-[80vh] sm:min-h-[600px]">
        <div className="text-center mt-8 sm:mt-4">
          <h1 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Alert</h1>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-8">
            {`${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim()}
            &apos;s Group Call
          </h2>
        </div>

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
              <button className="bg-red-100 p-2 rounded-full">
                <MdCallEnd className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center space-x-10">
          <button className="bg-gray-200 p-4 rounded-full">
            <HiOutlineSpeakerWave className="text-gray-600 text-lg" />
          </button>
          <button className="bg-gray-200 p-4 rounded-full">
            <AiOutlineAudioMuted className="text-gray-600 text-lg" />
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button className="bg-red-500 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-600">
            End Group Call
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firestore/firebase";
// import { MdCallEnd } from "react-icons/md";
// import { HiOutlineSpeakerWave } from "react-icons/hi2";
// import { AiOutlineAudioMuted } from "react-icons/ai";

// interface UserData {
//   email: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   mobileNumber: string | null;
// }

// export default function UserDetails({ userId }: { userId: string }) {
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch user details
//   useEffect(() => {
//     if (!userId) return;

//     const fetchUserDetails = async () => {
//       try {
//         const userRef = doc(db, "userCollection", userId);
//         const userSnap = await getDoc(userRef);

//         if (userSnap.exists()) {
//           setUserData(userSnap.data() as UserData);
//         } else {
//           setUserData(null);
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, [userId]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-gray-600">Loading...</p>
//       </div>
//     );

//   if (!userData)
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <p className="text-lg font-semibold text-red-500">User not found</p>
//       </div>
//     );

//   // Fallback values for missing user details
//   const fullName =
//     `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() ||
//     "Unknown Name";
//   // const email =
//   //   userData.email?.trim() !== "" ? userData.email : "Unknown Email";
//   // const mobileNumber =
//   //   userData.mobileNumber?.trim() !== ""
//   //     ? userData.mobileNumber
//   //     : "Unknown Number";

//   return (
//     <div className="h-screen w-full flex items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-4 sm:p-6 rounded-2xl relative flex flex-col justify-between border border-red-500 min-h-[80vh] sm:min-h-[600px]">
//         <div className="text-center mt-8 sm:mt-4">
//           <h1 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Alert</h1>
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-8">
//             {fullName}&apos;s Group Call
//           </h2>
//         </div>

//         <div className="space-y-4">
//           {Array.from({ length: 4 }).map((_, idx) => (
//             <div
//               key={idx}
//               className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
//             >
//               <div>
//                 <h2 className="text-sm font-medium">John Dew</h2>
//                 <p
//                   className={`text-xs font-medium ${
//                     idx % 2 === 0 ? "text-green-600" : "text-gray-600"
//                   }`}
//                 >
//                   {idx % 2 === 0 ? "Ringing..." : "00:54"}
//                 </p>
//               </div>
//               <button className="bg-red-100 p-2 rounded-full">
//                 <i className="fas fa-phone-slash text-red-500">
//                   <MdCallEnd />
//                 </i>
//               </button>
//             </div>
//           ))}
//         </div>

//         <div className="mt-6 flex justify-center space-x-10">
//           <button className="bg-gray-200 p-4 rounded-full">
//             <i className="fas fa-volume-up text-gray-600 text-lg">
//               <HiOutlineSpeakerWave />
//             </i>
//           </button>
//           <button className="bg-gray-200 p-4 rounded-full">
//             <i className="fas fa-microphone-slash text-gray-600 text-lg">
//               <AiOutlineAudioMuted />
//             </i>
//           </button>
//         </div>

//         <div className="mt-6 flex justify-center">
//           <button
//             // onClick={() => setShowCallScreen(false)}
//             className="bg-red-500 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-600"
//           >
//             End Group Call
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
