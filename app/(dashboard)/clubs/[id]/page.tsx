import ClubDiscussion from "@/components/clubs/ClubDiscussion";

// 1. Mark the component as async
// 2. Define params as a Promise
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 3. Await the params before using them
  const resolvedParams = await params;

  return (
    <div className="p-6 h-full">
      <ClubDiscussion clubId={resolvedParams.id} />
    </div>
  );
}
