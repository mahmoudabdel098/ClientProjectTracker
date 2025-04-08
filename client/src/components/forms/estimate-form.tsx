import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEstimateSchema, insertEstimateItemSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Client, Project } from "@shared/schema";
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
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

// Create schemas for the form
const estimateItemFormSchema = insertEstimateItemSchema.omit({
  estimateId: true,
}).extend({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be a non-negative number"),
});

const estimateFormSchema = insertEstimateSchema.omit({
  userId: true,
}).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  status: z.enum(["draft", "sent", "approved", "rejected"]),
  items: z.array(estimateItemFormSchema),
});

export type EstimateFormValues = z.infer<typeof estimateFormSchema>;

type EstimateFormProps = {
  defaultValues?: Partial<EstimateFormValues>;
  onSubmit: (data: EstimateFormValues) => void;
  isSubmitting?: boolean;
  preselectedClientId?: number;
  preselectedProjectId?: number;
};

export default function EstimateForm({ 
  defaultValues = {
    title: "",
    status: "draft",
    clientId: undefined,
    projectId: undefined,
    items: [{ description: "", quantity: 1, price: 0 }],
  },
  onSubmit,
  isSubmitting = false,
  preselectedClientId,
  preselectedProjectId
}: EstimateFormProps) {
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(
    preselectedClientId || defaultValues.clientId
  );
  
  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch projects for selected client
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: [`/api/projects?clientId=${selectedClientId}`],
    enabled: !!selectedClientId,
  });

  // Initialize the form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues,
  });

  // Set up field array for estimate items
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  // Add a new item to the estimate
  const addItem = () => {
    append({ description: "", quantity: 1, price: 0 });
  };

  // Calculate total amount
  const watchItems = form.watch("items") || [];
  const totalAmount = watchItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0);
  }, 0);

  // Handle client change
  const handleClientChange = (clientId: string) => {
    const parsedId = parseInt(clientId);
    setSelectedClientId(parsedId);
    form.setValue("clientId", parsedId);
    form.setValue("projectId", undefined);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimate Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter estimate title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <Select
                  onValueChange={handleClientChange}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
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
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project *</FormLabel>
                <Select
                  onValueChange={(value) => form.setValue("projectId", parseInt(value))}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                  disabled={!selectedClientId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedClientId ? "Select a project" : "Select a client first"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Estimate Items</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              {fields.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No items added. Click "Add Item" to start.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                Description
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Item description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                Qty
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1}
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                Price
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  step={0.01}
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-9 w-9"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-6 border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount:</p>
                  <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
                  <input 
                    type="hidden" 
                    {...form.register("totalAmount")}
                    value={totalAmount}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Estimate
          </Button>
        </div>
      </form>
    </Form>
  );
}
