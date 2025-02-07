// components/ZegoCloudInvite.tsx
"use client";

import ZegoCloudInviteUI from "./ZegoCloudInviteUi";

interface ZegoCloudInviteProps {
  members: { uid: string; name: string }[];
  onError: (message: string) => void;
  userName: string;
  userId: string;
}

const ZegoCloudInvite: React.FC<ZegoCloudInviteProps> = (props) => {
  return <ZegoCloudInviteUI {...props} />;
};

export default ZegoCloudInvite;
