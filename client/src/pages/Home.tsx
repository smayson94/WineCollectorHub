import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative">
        <AspectRatio ratio={3/1}>
          <img
            src="https://images.unsplash.com/photo-1464638681273-0962e9b53566"
            alt="Vineyard"
            className="object-cover w-full rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <h1 className="text-4xl font-bold">Welcome to Wine Collector</h1>
              <p className="text-xl">Organize and track your wine collection with ease</p>
              <Button size="lg" asChild>
                <Link href="/bins">View Your Collection</Link>
              </Button>
            </div>
          </div>
        </AspectRatio>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Manage Your Bins</h2>
          <p>Create and organize storage locations for your wines, track capacity, and keep your collection organized.</p>
          <img
            src="https://images.unsplash.com/photo-1669711517630-7596bfc47351"
            alt="Wine Cellar"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Track Your Wines</h2>
          <p>Record detailed information about each wine, including vintage, region, and drinking windows.</p>
          <img
            src="https://images.unsplash.com/photo-1516154767575-2146adebdf32"
            alt="Wine Bottles"
            className="rounded-lg"
          />
        </div>
      </section>
    </div>
  );
}
