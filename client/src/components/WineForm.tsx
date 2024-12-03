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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image } from "lucide-react";

interface WineFormProps {
  onSubmit: (data: InsertWine) => void;
  bins: { id: number; name: string }[];
  defaultValues?: Partial<InsertWine>;
}

export default function WineForm({ onSubmit, bins, defaultValues }: WineFormProps) {
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
      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const imageFile = formData.get('image') as File;
          
          if (imageFile && imageFile.size > 0) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);
            
            try {
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
              });
              
              if (!response.ok) {
                throw new Error('Failed to upload image');
              }
              
              const { imageUrl } = await response.json();
              form.setValue('imageUrl', imageUrl);
            } catch (error) {
              console.error('Image upload error:', error);
              return;
            }
          }
          
          form.handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6" 
        aria-describedby="wine-form-description">
        <p id="wine-form-description" className="text-sm text-muted-foreground">
          Enter the details for your new wine.
        </p>
        <FormField
          control={form.control}
          name="binId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Bin</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                value={field.value?.toString() || undefined}
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

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wine Label Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {field.value && (
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                      <img
                        src={field.value}
                        alt="Wine Label"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="image-upload" className="w-full">
                      <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                        <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload wine label image
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save Wine
        </Button>
      </form>
    </Form>
  );
}
