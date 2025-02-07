// components/ZegoCloudInviteUI.tsx
"use client";

import { useZegoCloud } from "../lib/hooks/useZegoCloud";

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
    <div>
      {isLoading && <div>Connecting...</div>}

      {!isCalling && (
        <div className="member-list">
          <div>My User Name is {userName}</div>
          <div>My Members List</div>

          {members.length === 0 ? (
            <div>
              Please select a primary group first or add members to the existing
              group.
            </div>
          ) : (
            members.map((member) => (
              <div key={member.uid} className="member-item">
                <span>
                  {member.name} ({member.uid})
                </span>
              </div>
            ))
          )}
          <button
            onClick={() => startCall(members)}
            disabled={isLoading || isSendingInvitation}
            className="bg-blue-500 rounded-sm"
          >
            {isSendingInvitation ? "Calling..." : "Call All"}
          </button>
        </div>
      )}

      {isCalling && (
        <div className="call-ui">
          <div>Calling {members.length} members...</div>
          <button onClick={endCall}>End Call</button>
        </div>
      )}

      <div ref={zegoContainer} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default ZegoCloudInviteUI;
