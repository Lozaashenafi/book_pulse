export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#fdfcf8] dark:bg-[#1a1614]">
      {/* Standard container for the feedback content */}
      <main>{children}</main>
    </div>
  );
}
