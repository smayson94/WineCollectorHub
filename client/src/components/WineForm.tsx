import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWineSchema, type InsertWine } from "@db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WineFormProps {
  onSubmit: (data: InsertWine, image?: File | null) => void;
  bins: { id: number; name: string }[];
  defaultValues?: Partial<InsertWine>;
  initialRating?: number;
}

export default function WineForm({ onSubmit, bins, defaultValues, initialRating }: WineFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [rating, setRating] = useState<number>(initialRating || 0);

  const form = useForm<InsertWine>({
    resolver: zodResolver(insertWineSchema),
    defaultValues: defaultValues || {
      binId: undefined,
      name: "",
      vintage: new Date().getFullYear(),
      region: "",
      variety: "",
      producer: "",
      drinkFrom: null,
      drinkTo: null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        try {
          const formData = new FormData();
          const { id, ...wineData } = data;
          formData.append("wine", JSON.stringify({
            ...wineData,
            binId: parseInt(wineData.binId.toString())
          }));
          if (selectedImage) {
            formData.append("image", selectedImage);
          }
          if (rating > 0) {
            formData.append("rating", rating.toString());
          }
          await onSubmit(data, selectedImage);
        } catch (error) {
          console.error("Form submission error:", error);
        }
      })} className="space-y-6" aria-describedby="form-description">
        <FormField
          control={form.control}
          name="binId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Bin</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
                aria-label="Select storage bin"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bins.map((bin) => (
                    <SelectItem key={bin.id} value={bin.id.toString()}>
                      {bin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wine Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vintage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vintage</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="variety"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grape Variety</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="producer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="drinkFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drink From</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drinkTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drink To</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* New Rating Field */}
        <FormItem>
          <FormLabel>Rating (0-100)</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setRating(value);
                }
              }}
              placeholder="Enter rating (0-100)"
            />
          </FormControl>
          <p className="text-sm text-muted-foreground">
            Leave empty if not rated yet
          </p>
        </FormItem>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <Label htmlFor="image" className="block mb-2">Wine Label Image</Label>
            <div className="flex items-center gap-4">
              {defaultValues?.imageUrl && (
                <img
                  src={defaultValues.imageUrl}
                  alt="Wine Label"
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="flex-1"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save Wine
          </Button>
        </div>
      </form>
    </Form>
  );
}