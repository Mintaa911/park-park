
import { Hero } from "@/components/hero";

export default async function Home() {  
  return (
    <main className="min-h-screen flex flex-col items-center ">
      <div className="flex-1 w-full flex flex-col items-center">
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
