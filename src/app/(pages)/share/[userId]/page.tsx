import UserDetails from "@/components/UserDetailsComp";

export const metadata = {
  title: "Mylex Infotech - User Details",
};

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserDetails userId={userId} />;
}
