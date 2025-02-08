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

  return (
    <div className="flex flex-col items-center justify-between h-full max-w-sm mx-auto px-4 py-6">
      {isLoading && <div className="text-gray-500">Connecting...</div>}

      {!isCalling && (
        <div className="w-full text-center">
          {/* Members List */}
          {members.length === 0 ? (
            <div className="text-gray-600">
              Please select a primary group first or add members to the existing
              group.
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg rounded-xl p-6 transition-all duration-300 hover:shadow-xl">
              {/* Member List */}
              <ul className="space-y-3">
                {members.map((member) => (
                  <li
                    key={member.uid}
                    className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:border-blue-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-lg hover:text-blue-600 transition-colors">
                          {member.name}
                        </span>
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors relative"
                      title="End Call"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    </button>
                  </li>
                ))}

                {members.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic">
                      No team members found
                    </p>
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Group Call Button at Bottom */}
      {!isCalling && members.length > 0 && (
        <div className="w-full fixed bottom-6 flex justify-center">
          <button
            onClick={() => startCall(members)}
            disabled={isLoading || isSendingInvitation}
            className="bg-green-600 text-white font-semibold rounded-full shadow-lg px-14 py-4 transition-all duration-300 hover:bg-green-700 hover:scale-105 disabled:opacity-50"
          >
            {isSendingInvitation ? "Calling..." : "📞 Group Call"}
          </button>
        </div>
      )}

      {isCalling && (
        <div className="text-center">
          <div className="text-gray-700 mb-4">
            Calling {members.length} members...
          </div>

          {/* End Call Button */}
          <div className="fixed bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={endCall}
              className="bg-red-600 text-white font-semibold rounded-full shadow-lg px-14 py-4 transition-all duration-300 hover:bg-red-700 hover:scale-105"
            >
              ⛔ End Call
            </button>
          </div>
        </div>
      )}

      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default ZegoCloudInviteUI;
