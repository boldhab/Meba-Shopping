export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="page-stack mx-auto w-full max-w-7xl px-6 py-8 md:px-12 lg:px-20">
      {children}
    </section>
  );
}
