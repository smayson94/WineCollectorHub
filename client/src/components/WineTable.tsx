import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import WineForm from "./WineForm";
import {
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Wine as WineIcon,
  Search,
  Filter,
  Plus as PlusIcon,
} from "lucide-react";
import type { Wine, Review, Bin } from "@db/schema";
import { cn } from "@/lib/utils";

interface WineWithReviews extends Wine {
  reviews?: Review[];
  bin?: Bin;
}

export default function WineTable() {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [isWineDialogOpen, setIsWineDialogOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineWithReviews | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wines, isLoading, error: wineError } = useQuery<WineWithReviews[]>({
    queryKey: ["wines"],
    queryFn: async () => {
      try {
        console.log("Fetching wines...");
        const response = await fetch("/api/wines");
        console.log("Wines API response status:", response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch wines: ${response.status}`);
        }
        const data = await response.json();
        console.log("Wines data received:", data.length, "wines");
        // Ensure reviews is always an array
        return data.map((wine: WineWithReviews) => ({
          ...wine,
          reviews: wine.reviews || []
        }));
      } catch (error) {
        console.error("Error fetching wines:", error);
        throw error;
      }
    },
  });

  const { data: bins, error: binError } = useQuery<Bin[]>({
    queryKey: ["bins"],
    queryFn: async () => {
      try {
        console.log("Fetching bins...");
        const response = await fetch("/api/bins");
        console.log("Bins API response status:", response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch bins: ${response.status}`);
        }
        const data = await response.json();
        console.log("Bins data received:", data.length, "bins");
        return data;
      } catch (error) {
        console.error("Error fetching bins:", error);
        throw error;
      }
    },
  });

  // Add error handling UI
  if (wineError) {
    return <div className="text-red-500">Error loading wines: {(wineError as Error).message}</div>;
  }

  if (binError) {
    return <div className="text-red-500">Error loading bins: {(binError as Error).message}</div>;
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/wines/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete wine");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast({
        title: "Success",
        description: "Wine deleted successfully",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ wineId, rating }: { wineId: number; rating: number }) => {
      if (rating < 0 || rating > 100) {
        throw new Error("Rating must be between 0 and 100");
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wineId,
          rating,
          notes: "",
          reviewDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add review");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast({
        title: "Success",
        description: "Rating updated successfully",
      });
    },
    onError: (error) => {
      console.error("Review error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rating",
        variant: "destructive",
      });
    },
  });

  const handleRating = async (wineId: number, newRating: number) => {
    try {
      if (isNaN(newRating) || newRating < 0 || newRating > 100) {
        toast({
          title: "Invalid Rating",
          description: "Please enter a number between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      await reviewMutation.mutateAsync({ wineId, rating: newRating });
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  const filteredWines = useMemo(() => {
    if (!wines) return [];
    return wines.filter((wine) => {
      const matchesSearch = wine.name.toLowerCase().includes(search.toLowerCase()) ||
        wine.producer.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = !filterRegion || filterRegion === "all" || wine.region === filterRegion;
      return matchesSearch && matchesRegion;
    });
  }, [wines, search, filterRegion]);

  const uniqueRegions = useMemo(() => {
    if (!wines) return [];
    return Array.from(new Set(wines.map((wine) => wine.region))).sort();
  }, [wines]);

  const handleEditWine = (wine: WineWithReviews) => {
    setSelectedWine(wine);
    setIsWineDialogOpen(true);
  };

  const handleDeleteWine = (id: number) => {
    if (window.confirm("Are you sure you want to delete this wine?")) {
      deleteMutation.mutate(id);
    }
  };


  const renderRating = (wine: WineWithReviews) => {
    if (!wine.reviews || wine.reviews.length === 0) {
      return "-";
    }
    const avgRating = wine.reviews.reduce((acc, rev) => acc + rev.rating, 0) / wine.reviews.length;
    return avgRating.toFixed(0);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div id="wine-table" className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          data-add-wine-trigger
          onClick={() => setIsWineDialogOpen(true)}
          className="mr-4"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Wine
        </Button>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search wines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={filterRegion || undefined} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All regions</SelectItem>
            {uniqueRegions
              .filter(region => region && region.trim() !== '')
              .map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vintage</TableHead>
              <TableHead>Producer</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Drinking Window</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWines.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <WineIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No wines in your collection yet.</p>
                </TableCell>
              </TableRow>
            )}
            {filteredWines.map((wine) => (
              <TableRow key={wine.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {wine.thumbnailUrl && (
                      <img
                        src={wine.thumbnailUrl}
                        alt={`${wine.name} label`}
                        className="w-8 h-8 object-cover rounded-sm"
                      />
                    )}
                    {wine.name}
                  </div>
                </TableCell>
                <TableCell>{wine.vintage}</TableCell>
                <TableCell>{wine.producer}</TableCell>
                <TableCell>{wine.region}</TableCell>
                <TableCell>{wine.variety}</TableCell>
                <TableCell>
                  {wine.drinkFrom && wine.drinkTo
                    ? `${wine.drinkFrom}-${wine.drinkTo}`
                    : "Not specified"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="w-20"
                      placeholder="0-100"
                      defaultValue={renderRating(wine)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          handleRating(wine.id, value);
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditWine(wine)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteWine(wine.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isWineDialogOpen} onOpenChange={setIsWineDialogOpen}>
        <DialogContent
          className="sm:max-w-[600px]"
          aria-describedby="wine-form-description"
        >
          <DialogHeader>
            <DialogTitle>
              {selectedWine ? "Edit Wine" : "Add New Wine"}
            </DialogTitle>
            <p id="wine-form-description" className="text-sm text-muted-foreground">
              {selectedWine ? "Update the details of your wine." : "Add a new wine to your collection."}
            </p>
          </DialogHeader>
          {(!bins || bins.length === 0) ? (
            <div className="text-center py-6">
              <WineIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">Please create a storage bin first before adding wines.</p>
              <Button asChild>
                <Link href="/bins">Create Storage Bin</Link>
              </Button>
            </div>
          ) : (
            <WineForm
              bins={bins}
              initialRating={selectedWine ? parseInt(renderRating(selectedWine)) : undefined}
              onSubmit={async (data, image) => {
                try {
                  const formData = new FormData();
                  const { createdAt, ...wineData } = data;
                  formData.append("wine", JSON.stringify(wineData));
                  if (image) {
                    formData.append("image", image);
                  }

                  let response;
                  if (selectedWine) {
                    response = await fetch(`/api/wines/${selectedWine.id}`, {
                      method: "PUT",
                      body: formData,
                    });
                  } else {
                    response = await fetch("/api/wines", {
                      method: "POST",
                      body: formData,
                    });
                  }

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Failed to save wine");
                  }

                  queryClient.invalidateQueries({ queryKey: ["wines"] });
                  setIsWineDialogOpen(false);
                  toast({
                    title: "Success",
                    description: `Wine ${selectedWine ? "updated" : "added"} successfully`,
                  });
                } catch (error) {
                  console.error("Wine save error:", error);
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to save wine",
                    variant: "destructive",
                  });
                }
              }}
              defaultValues={selectedWine ? {
                ...selectedWine,
                createdAt: new Date(selectedWine.createdAt)
              } : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}