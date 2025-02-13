import UserDetails from "@/components/UserDetailsComp";

export const metadata = {
  title: "Welcome to Family Alert",
};

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserDetails userId={userId} />;
}
