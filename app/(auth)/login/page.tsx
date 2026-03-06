import AuthPage from "@/components/home/AuthPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // CRITICAL: You must await the promise to get the 'next' value
  const params = await searchParams; // Wait for Next.js params

  return (
    <>
      <AuthPage type="sign-in" nextUrl={params.next} />
    </>
  );
}
