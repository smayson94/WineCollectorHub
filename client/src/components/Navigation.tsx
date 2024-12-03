import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Wine, GalleryHorizontalEnd, BarChart3 } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <Wine className="h-6 w-6 text-primary" />
                <span className="font-semibold text-xl">Wine Collector</span>
              </a>
            </Link>
            <div className="flex space-x-4">
              <Button
                variant={location === "/bins" ? "secondary" : "ghost"}
                asChild
              >
                <Link href="/bins">
                  <GalleryHorizontalEnd className="mr-2 h-4 w-4" />
                  Bins
                </Link>
              </Button>
              <Button
                variant={location === "/analytics" ? "secondary" : "ghost"}
                asChild
              >
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
