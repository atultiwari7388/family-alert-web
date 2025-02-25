import UserDetails from "@/components/UserDetailsComp";

export const metadata = {
  title: "Welcome to Family Alert",
};

interface PageProps {
  params: { userGroupId: string };
}

export default function UserPage({ params }: PageProps) {
  const [userId, groupId] = params.userGroupId.split("-");
  return <UserDetails userId={userId} groupId={groupId} />;
}
