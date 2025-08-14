
interface LayoutProps {
  children: React.ReactNode
}

export default async function Layout({ children }: LayoutProps) {

  return (
    <div className="flex flex-col flex-1 ">
      <main className="flex-1 overflow-auto w-full max-w-7xl mx-auto px-5 py-4 pt-20">
        {children}
      </main>
    </div>
  );
}