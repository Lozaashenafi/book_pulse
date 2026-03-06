import AuthPage from "@/components/home/AuthPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams; // Important: Await the params

  return (
    <>
      {/* Pass the 'next' parameter as nextUrl */}
      <AuthPage type="register" nextUrl={params.next} />
    </>
  );
}
