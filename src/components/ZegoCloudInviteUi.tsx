// components/ZegoCloudInviteUI.tsx
"use client";

import { useZegoCloud } from "@/lib/hooks/useZegoCloud";

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

  // return (
  //   <div className="flex flex-col justify-center items-center h-full">
  //     {isLoading && <div>Connecting...</div>}

  //     {!isCalling && (
  //       <div className="member-list">
  //         {/* <div>My User Name is {userName}</div>
  //         <div>My Members List</div> */}

  //         {members.length === 0 ? (
  //           <div>
  //             Please select a primary group first or add members to the existing
  //             group.
  //           </div>
  //         ) : (
  //           <div></div>
  //         )}

  //         <button
  //           onClick={() => startCall(members)}
  //           disabled={isLoading || isSendingInvitation}
  //           className="bg-green-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition duration-300 disabled:opacity-50 px-12 py-3"
  //         >
  //           {isSendingInvitation ? "Calling..." : "Call All"}
  //         </button>
  //       </div>
  //     )}

  //     {isCalling && (
  //       <div className="call-ui">
  //         <div>Calling {members.length} members...</div>
  //         <button onClick={endCall}>End Call</button>
  //       </div>
  //     )}

  //     <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
  //   </div>
  // );

  return (
    <div className="flex flex-col justify-center items-center h-full">
      {isLoading && <div>Connecting...</div>}

      {!isCalling && (
        <div className="member-list text-center">
          {members.length === 0 ? (
            <div>
              Please select a primary group first or add members to the existing
              group.
            </div>
          ) : (
            <div></div>
          )}

          {/* Call All Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => startCall(members)}
              disabled={isLoading || isSendingInvitation}
              className="bg-blue-600 text-white font-semibold rounded-lg shadow-md px-10 py-3 transition-all duration-300 hover:bg-blue-700 hover:scale-105 disabled:opacity-50"
            >
              {isSendingInvitation ? "Calling..." : "Call All"}
            </button>
          </div>
        </div>
      )}

      {isCalling && (
        <div className="call-ui text-center">
          <div>Calling {members.length} members...</div>

          {/* End Call Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={endCall}
              className="bg-red-600 text-white font-semibold rounded-lg shadow-md px-10 py-3 transition-all duration-300 hover:bg-red-700 hover:scale-105"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default ZegoCloudInviteUI;
