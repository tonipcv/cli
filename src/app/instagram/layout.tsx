export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen">
      {children}
    </div>
  );
} 