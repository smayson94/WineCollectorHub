import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus as PlusIcon } from "lucide-react";
import WineTable from "../components/WineTable";

export default function Wines() {
  const [isWineDialogOpen, setIsWineDialogOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wine Collection</h1>
        <Button onClick={() => {
          const wineTable = document.querySelector<HTMLDivElement>('#wine-table');
          if (wineTable) {
            setIsWineDialogOpen(true);
            setSelectedWine(null); // Reset selected wine for new entry
          }
        }}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Wine
        </Button>
      </div>
      <WineTable />
    </div>
  );
}
