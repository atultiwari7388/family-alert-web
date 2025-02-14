"use client";

import { useZegoCloud } from "@/lib/hooks/useZegoCloud";
import { MdOutlineCall } from "react-icons/md";
import { useState } from "react";

interface Member {
  uid: string;
  name: string;
}

interface ZegoCloudInviteUIProps {
  members: Member[];
  onError: (message: string) => void;
  userName: string;
  userId: string;
}

const ZegoCloudInviteUI: React.FC<ZegoCloudInviteUIProps> = ({
  members,
  onError,
  userName,
  userId,
}) => {
  const {
    isLoading,
    isCalling,
    isSendingInvitation,
    startCall,
    endCall,
    zegoContainer,
  } = useZegoCloud({ onError, userName, userId });

  // New state to track call status
  const [callEnded, setCallEnded] = useState(false);

  const handleEndCall = () => {
    endCall();
    setCallEnded(true); // Mark call as ended
  };

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
                  className="flex items-center justify-between bg-[#D1E6FF] p-3 rounded-lg shadow-sm"
                >
                  {/* Left-aligned Member Name */}
                  <div className="text-left">
                    <h2 className="text-sm font-medium text-gray-800">
                      {member.name}
                    </h2>
                  </div>

                  {/* Right-aligned Call Icon */}
                  <button
                    className={`p-2 rounded-full transition-all duration-300 bg-[#45DA4A]
                      }`}
                  >
                    {isCalling ? (
                      // <MdCallEnd className="text-white text-lg" />
                      <div></div>
                    ) : (
                      <MdOutlineCall className="text-white text-lg" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Group Call Controls */}
      {!callEnded && (
        <div className="w-full fixed bottom-6 flex justify-center">
          {!isCalling && members.length > 0 ? (
            <button
              onClick={() => startCall(members)}
              disabled={isLoading || isSendingInvitation}
              className="bg-[#45DA4A] text-white font-semibold rounded-full shadow-lg px-14 py-4 transition-all duration-300 hover:bg-[#45DA4A] hover:scale-105 disabled:opacity-50"
            >
              {isSendingInvitation ? "Calling..." : "Start Group Call"}
            </button>
          ) : (
            <div onClick={handleEndCall}></div>
            // <button
            //   onClick={handleEndCall}
            //   className="bg-[#FF4545] text-white font-semibold rounded-full shadow-lg px-14 py-4 transition-all duration-300 hover:bg-[#FF4545] hover:scale-105"
            // >
            //   End Group Call
            // </button>
          )}
        </div>
      )}

      {/* Video Call Container */}
      {!callEnded && <div ref={zegoContainer} className="w-full h-[500px]" />}
    </div>
  );
};

export default ZegoCloudInviteUI;
