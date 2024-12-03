import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WineTable from "../components/WineTable";

export default function Wines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wine Collection</h1>
        <Button onClick={() => {
          const wineTable = document.querySelector<HTMLDivElement>('#wine-table');
          if (wineTable) {
            const addButton = wineTable.querySelector<HTMLButtonElement>('[data-add-wine-trigger]');
            if (addButton) {
              addButton.click();
            }
          }
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Wine
        </Button>
      </div>
      <WineTable />
    </div>
  );
}
