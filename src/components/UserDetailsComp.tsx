// UserDetails.tsx
"use client";

import dynamic from "next/dynamic"; // Import dynamic from Next.js
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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
  phoneNumber: string;
  FCM_Id: string;
}

export default function UserDetails({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !groupId) return;

    const fetchUserAndGroupDetails = async () => {
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

        // Fetch vehicle group
        const vehicleGroupRef = doc(db, "vehicleGroups", groupId);
        const vehicleGroupSnap = await getDoc(vehicleGroupRef);

        if (!vehicleGroupSnap.exists()) {
          setError("Vehicle group not found");
          setLoading(false);
          return;
        }

        const vehicleGroupData = vehicleGroupSnap.data();

        // Verify user is group admin
        if (vehicleGroupData.admin !== userId) {
          setError("User is not authorized for this group");
          setLoading(false);
          return;
        }

        // Fetch group members
        const membersCollectionRef = collection(vehicleGroupRef, "members");
        const membersSnap = await getDocs(membersCollectionRef);

        const memberData = await Promise.all(
          membersSnap.docs.map(async (memberDoc) => {
            const memberUid = memberDoc.id;
            const memberUserRef = doc(db, "userCollection", memberUid);
            const memberUserSnap = await getDoc(memberUserRef);

            if (memberUserSnap.exists()) {
              const { firstName, lastName } = memberUserSnap.data() as UserData;
              return {
                uid: memberUid,
                name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
                phoneNumber: memberUserSnap.data().mobileNumber ?? "",
                FCM_Id: memberUserSnap.data().FCM_Id ?? "",
              };
            }
            return {
              uid: memberUid,
              name: "Unknown User",
              phoneNumber: "",
              FCM_Id: "",
            };
          })
        );

        setMembers(memberData);
        console.log("Group Members:", memberData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load group information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndGroupDetails();
  }, [userId, groupId]);

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
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-8">
            {`${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim()}
            &apos;s Group Call
          </h2>
        </div>

        <ZegoCloudInvite
          userId={userId}
          members={members}
          onError={setError}
          userName={`${userData.firstName ?? ""} ${
            userData.lastName ?? ""
          }`.trim()}
        />
      </div>
    </div>
  );
}

// useEffect(() => {
//   if (!userId) return;

//   const fetchUserDetails = async () => {
//     try {
//       const userRef = doc(db, "userCollection", userId);
//       const userSnap = await getDoc(userRef);
//       if (!userSnap.exists()) {
//         setUserData(null);
//         setLoading(false);
//         return;
//       }

//       const userData = userSnap.data() as UserData;
//       setUserData(userData);

//       if (userData.joinedVehicles && userData.joinedVehicles.length > 0) {
//         const vehicleGroupPromises = userData.joinedVehicles.map(
//           async (vehicleId) => {
//             const vehicleGroupRef = doc(db, "vehicleGroups", vehicleId);
//             const vehicleGroupSnap = await getDoc(vehicleGroupRef);
//             if (
//               vehicleGroupSnap.exists() &&
//               vehicleGroupSnap.data().admin === userId &&
//               //check group is primary or not
//               vehicleGroupSnap.data().isPrimary === true
//             ) {
//               return vehicleGroupRef;
//             }
//             return null;
//           }
//         );

//         const matchedVehicleGroupRefs = (
//           await Promise.all(vehicleGroupPromises)
//         ).filter((ref): ref is DocumentReference => ref !== null);

//         const memberPromises = matchedVehicleGroupRefs.map(
//           async (groupRef) => {
//             const membersCollectionRef = collection(groupRef, "members");
//             const membersSnap = await getDocs(membersCollectionRef);

//             const memberData = await Promise.all(
//               membersSnap.docs.map(async (memberDoc) => {
//                 const memberUid = memberDoc.id;
//                 const memberUserRef = doc(db, "userCollection", memberUid);
//                 const memberUserSnap = await getDoc(memberUserRef);

//                 if (memberUserSnap.exists()) {
//                   const { firstName, lastName } =
//                     memberUserSnap.data() as UserData;
//                   return {
//                     uid: memberUid,
//                     name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
//                   };
//                 }

//                 return { uid: memberUid, name: "Unknown User" };
//               })
//             );

//             return memberData;
//           }
//         );

//         const allMembers = (await Promise.all(memberPromises)).flat();
//         setMembers(allMembers);

//         console.log("All Members List", allMembers);
//       }
//     } catch (error) {
//       console.error("Error fetching user or members:", error);
//       setError("Failed to fetch user data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchUserDetails();
// }, [userId]);
