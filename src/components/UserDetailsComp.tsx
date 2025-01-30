"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { LuAlarmClock, LuMessageSquareMore } from "react-icons/lu";
import { MdCallEnd } from "react-icons/md";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { AiOutlineAudioMuted } from "react-icons/ai";

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
}

export default function UserDetails({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCallScreen, setShowCallScreen] = useState<boolean>(false);

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
  // const email =
  //   userData.email?.trim() !== "" ? userData.email : "Unknown Email";
  // const mobileNumber =
  //   userData.mobileNumber?.trim() !== ""
  //     ? userData.mobileNumber
  //     : "Unknown Number";

  if (showCallScreen) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
          <h1 className="text-lg font-bold text-center mb-4">Alert</h1>

          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-blue-100 p-4 rounded-lg"
              >
                <div>
                  <h2 className="text-sm font-medium">John Dew</h2>
                  <p
                    className={`text-xs font-medium ${
                      idx % 2 === 0 ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {idx % 2 === 0 ? "Ringing..." : "00:54"}
                  </p>
                </div>
                <button className="bg-red-100 p-2 rounded-full">
                  <i className="fas fa-phone-slash text-red-500">
                    <MdCallEnd />
                  </i>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center space-x-10">
            <button className="bg-gray-200 p-4 rounded-full">
              <i className="fas fa-volume-up text-gray-600 text-lg">
                <HiOutlineSpeakerWave />
              </i>
            </button>
            <button className="bg-gray-200 p-4 rounded-full">
              <i className="fas fa-microphone-slash text-gray-600 text-lg">
                <AiOutlineAudioMuted />
              </i>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowCallScreen(false)}
              className="bg-red-500 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-600"
            >
              End Group Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="h-full w-full max-w-md p-6 bg-white rounded-2xl shadow-lg relative flex flex-col justify-between">
        <div className="absolute top-4 right-4 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
          T
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold mb-4">Alert Audio...</h1>
          <h2 className="text-xl font-semibold mb-8">
            {fullName}&apos;s Group Call
          </h2>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>

        <div className="flex justify-around">
          <div className="flex flex-col items-center">
            <button className="bg-orange-100 p-4 rounded-full shadow-md hover:scale-110 transition-all duration-200">
              <LuAlarmClock className="text-orange-500 text-2xl" />
            </button>
            <span className="mt-2 text-sm font-medium">Reminder</span>
          </div>
          <div className="flex flex-col items-center">
            <button className="bg-orange-100 p-4 rounded-full shadow-md hover:scale-110 transition-all duration-200">
              <LuMessageSquareMore className="text-orange-500 text-2xl" />
            </button>
            <span className="mt-2 text-sm font-medium">Message</span>
          </div>
          <div className="flex flex-col items-center">
            <button className="bg-orange-100 p-4 rounded-full shadow-md hover:scale-110 transition-all duration-200">
              <MdCallEnd className="text-orange-500 text-2xl" />
            </button>
            <span className="mt-2 text-sm font-medium">Decline</span>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowCallScreen(true)}
            className="relative bg-green-500 text-white text-lg font-bold px-16 py-6 rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            <span className="absolute inset-0 animate-ping bg-green-400 rounded-full opacity-75"></span>
            <h1 className="text-sm">Accept</h1>
          </button>
        </div>
      </div>
    </div>
  );
}
