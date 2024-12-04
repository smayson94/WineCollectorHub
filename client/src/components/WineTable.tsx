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

  const { data: wines, isLoading } = useQuery<WineWithReviews[]>({
    queryKey: ["wines"],
    queryFn: async () => {
      const response = await fetch("/api/wines");
      if (!response.ok) throw new Error("Failed to fetch wines");
      return response.json();
    },
  });

  const { data: bins } = useQuery<Bin[]>({
    queryKey: ["bins"],
    queryFn: async () => {
      const response = await fetch("/api/bins");
      if (!response.ok) throw new Error("Failed to fetch bins");
      return response.json();
    },
  });

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
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wineId,
          rating,
          notes: "",
        }),
      });
      if (!response.ok) throw new Error("Failed to add review");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    },
  });

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
    const avgRating = wine.reviews?.reduce((acc, rev) => acc + rev.rating, 0) ?? 0;
    const ratingCount = wine.reviews?.length ?? 0;
    return ratingCount > 0 ? (avgRating / ratingCount).toFixed(1) : "-";
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-[60px]"
                    onClick={() => reviewMutation.mutate({ wineId: wine.id, rating: 5 })}
                  >
                    <Star className="mr-1 h-4 w-4" />
                    {renderRating(wine)}
                  </Button>
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
          description={selectedWine ? "Update the details of your wine." : "Add a new wine to your collection."}
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
              onSubmit={async (data, image) => {
                try {
                  const formData = new FormData();
                  // Remove createdAt from the data before sending
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
