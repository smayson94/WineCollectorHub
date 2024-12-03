import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Wine,
  Search,
  Filter,
} from "lucide-react";
import type { Wine, Review, Bin } from "@db/schema";

// Extend from Wine type to include all base properties
interface WineWithReviews {
  id: number;
  binId: number;
  name: string;
  vintage: number;
  region: string;
  variety: string;
  producer: string;
  drinkFrom: number | null;
  drinkTo: number | null;
  createdAt: string;
  reviews?: Review[];
  bin?: Bin;
}

export default function WineTable() {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [isWineDialogOpen, setIsWineDialogOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineWithReviews | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wines with their reviews and bin information
  const { data: wines, isLoading } = useQuery<WineWithReviews[]>({
    queryKey: ["wines"],
    queryFn: async () => {
      const response = await fetch("/api/wines");
      if (!response.ok) throw new Error("Failed to fetch wines");
      return response.json();
    },
  });

  // Fetch bins for the wine form
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
          notes: "", // Optional notes could be added in a more detailed review form
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
      const matchesRegion = !filterRegion || wine.region === filterRegion;
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
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
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All regions</SelectItem>
            {uniqueRegions.map((region) => (
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
            {filteredWines.map((wine) => (
              <TableRow key={wine.id}>
                <TableCell className="font-medium">{wine.name}</TableCell>
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
        <DialogContent className="sm:max-w-[600px]" aria-describedby="wine-form-description">
          <DialogHeader>
            <DialogTitle>
              {selectedWine ? "Edit Wine" : "Add New Wine"}
            </DialogTitle>
            <p id="wine-form-description" className="text-sm text-muted-foreground">
              {selectedWine ? "Update the details of your wine." : "Add a new wine to your collection."}
            </p>
          </DialogHeader>
          <WineForm
            bins={bins || []}
            onSubmit={async (data) => {
              try {
                const response = await fetch(
                  selectedWine ? `/api/wines/${selectedWine.id}` : "/api/wines",
                  {
                    method: selectedWine ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  }
                );
                if (!response.ok) throw new Error("Failed to save wine");
                queryClient.invalidateQueries({ queryKey: ["wines"] });
                setIsWineDialogOpen(false);
                toast({
                  title: "Success",
                  description: `Wine ${selectedWine ? "updated" : "added"} successfully`,
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to save wine",
                  variant: "destructive",
                });
              }
            }}
            defaultValues={selectedWine || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
