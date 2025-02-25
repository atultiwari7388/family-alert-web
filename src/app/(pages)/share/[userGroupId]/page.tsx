import UserDetails from "@/components/UserDetailsComp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Family Alert",
};

export default async function UserPage({
  params,
}: {
  params: Promise<{ userGroupId: string }>;
}) {
  const resolvedParams = await params; // Await params
  const [userId, groupId] = resolvedParams.userGroupId.split("-");

  return <UserDetails userId={userId} groupId={groupId} />;
}
