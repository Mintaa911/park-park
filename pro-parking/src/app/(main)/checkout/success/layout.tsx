import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {

  return (
      <Suspense>
          {children}
      </Suspense>
  );
}