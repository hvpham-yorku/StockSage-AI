export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:mx-28 md:mt-8 flex justify-center">
        {children}
    </div>
  );
}