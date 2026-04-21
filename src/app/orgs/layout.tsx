import Header from "@/components/Header";

export default function OrgsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
