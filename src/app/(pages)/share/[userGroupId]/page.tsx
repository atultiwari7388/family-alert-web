import UserDetails from "@/components/UserDetailsComp";

export const metadata = {
  title: "Welcome to Family Alert",
};

export default async function UserPage({
  params,
}: {
  params: { userGroupId: string };
}) {
  // const { userId } = await params;
  const [userId, groupId] = params.userGroupId.split("-");
  return <UserDetails userId={userId} groupId={groupId} />;
}
