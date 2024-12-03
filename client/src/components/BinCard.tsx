import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wine, Pencil, Trash2 } from "lucide-react";
import type { Bin } from "@db/schema";

interface BinCardProps {
  bin: Bin;
  onEdit: (bin: Bin) => void;
  onDelete: (id: number) => void;
}

export default function BinCard({ bin, onEdit, onDelete }: BinCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{bin.name}</span>
          <div className="space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(bin)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(bin.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{bin.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Wine className="h-4 w-4" />
          <span>Capacity: {bin.capacity} bottles</span>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Created {new Date(bin.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}
