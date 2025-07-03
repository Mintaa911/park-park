
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import Link from "next/link";
import { type LucideProps, CarFront } from "lucide-react";

export default function Home() {
  const Icons = {
    logo: (props: LucideProps) => <CarFront {...props} />,
  }; 
  
  return (
    <main className="min-h-screen flex flex-col items-center ">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link
                href={"/"}
                className="flex items-center gap-2  font-bold"
              >
                <Icons.logo className="w-8 h-8" /> ParkPark
              </Link>
            </div>
          </div>
        </nav>
        <Hero />
        <div className="w-full max-w-5xl p-5 py-20 flex-1">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/parking.png"
                alt="map"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold ">
                Discover Amazing Spaces
              </h2>
              <p className="text-gray-400">
                Find parking anywhere, for now or for later
              </p>
              <p className="text-gray-400">
                Compare prices & pick the place that&apos;s best for you
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
