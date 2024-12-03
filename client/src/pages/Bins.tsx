import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import BinCard from "../components/BinCard";
import BinForm from "../components/BinForm";
import type { Bin, InsertBin } from "@db/schema";

export default function Bins() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bins, isLoading } = useQuery({
    queryKey: ["bins"],
    queryFn: async () => {
      const response = await fetch("/api/bins");
      if (!response.ok) throw new Error("Failed to fetch bins");
      return response.json() as Promise<Bin[]>;
    },
  });

  const createBin = useMutation({
    mutationFn: async (data: InsertBin) => {
      const response = await fetch("/api/bins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create bin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Bin created successfully",
      });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Storage Bins</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bins?.map((bin) => (
          <BinCard
            key={bin.id}
            bin={bin}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="form-description">
          <DialogHeader>
            <DialogTitle>Add New Storage Bin</DialogTitle>
            <p id="form-description" className="text-sm text-muted-foreground">
              Enter the details for your new storage bin.
            </p>
          </DialogHeader>
          <BinForm
            onSubmit={async (data) => {
              try {
                await createBin.mutateAsync(data);
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to create bin",
                  variant: "destructive",
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
