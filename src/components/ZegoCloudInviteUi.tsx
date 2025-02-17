"use client";

import { useZegoCloud } from "@/lib/hooks/useZegoCloud";
import { MdOutlineCall } from "react-icons/md";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    showDialog,
    startCall,
    endCall,
    zegoContainer,
    setShowDialog,
  } = useZegoCloud({ onError, userName, userId });

  // New state to track call status
  const [callEnded, setCallEnded] = useState(false);
  const router = useRouter();

  const handleEndCall = () => {
    endCall();
    setCallEnded(true); // Mark call as ended
    // TODO: Redirect to the home page
    router.push("/");
  };

  if (showDialog) {
    return (
      <>
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        // onClick={() => startCall(members)}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-sm text-center">
            <p className="text-lg font-semibold text-gray-900">You are on speaker</p>
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
                  className={`flex items-center justify-between ${isCalling ? "" : "bg-[#D1E6FF]"} p-3 rounded-lg ${isCalling ? "" : "shadow-sm"}`}
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
                    className={`p-2 rounded-full transition-all duration-300 ${isCalling ? "" : "bg-[#45DA4A]"
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


            {


              isCalling ? <h2 className="text-[#FF4545] font-semibold text-xl text-center">Call Ended</h2> : <h2></h2>


            }

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

export default ZegoCloudInviteUI;
