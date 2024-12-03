import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WineTable from "../components/WineTable";

export default function Wines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wine Collection</h1>
        <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-add-wine-trigger]')?.click()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Wine
        </Button>
      </div>
      <WineTable />
    </div>
  );
}
