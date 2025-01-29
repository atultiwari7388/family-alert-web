"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
}

export default function UserDetails({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user details
  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const userRef = doc(db, "userCollection", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
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

  // Fallback values for missing user details
  const fullName =
    `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() ||
    "Unknown Name";
  const email =
    userData.email?.trim() !== "" ? userData.email : "Unknown Email";
  const mobileNumber =
    userData.mobileNumber?.trim() !== ""
      ? userData.mobileNumber
      : "Unknown Number";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-80 text-center">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
            {fullName.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mt-4">{fullName}</h1>
        <p className="text-gray-500 text-sm">{email}</p>
        <p className="text-gray-700 font-medium mt-2">{mobileNumber}</p>
      </div>
    </div>
  );
}
