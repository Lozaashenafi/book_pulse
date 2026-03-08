import { getPublicProfileByUsername } from "@/services/profile.service";
import PublicProfileUI from "@/components/profile/PublicProfileUI";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch data on server
  const profileData = await getPublicProfileByUsername(username);

  if (!profileData) {
    notFound(); // Triggers the default 404 page
  }

  return <PublicProfileUI data={profileData} />;
}
