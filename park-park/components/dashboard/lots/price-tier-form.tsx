import { Button } from "@/components/ui/button";
import { DialogContent, Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useInsertMutation, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { PriceTier } from "@/types";
import { Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const formSchema = z.object({
    price: z.number().min(0),
    maxHour: z.number().min(0),
});

interface PriceTierFormProps {
    sechuledId: string;
    priceTier?: PriceTier;
}

export default function PriceTierForm({ sechuledId, priceTier }: PriceTierFormProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supabase = createClient();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: priceTier?.price ?? 0,
            maxHour: priceTier?.maxHour ?? 0,
        },
    });

    const { mutateAsync: createPriceTier, isPending: isCreatingPriceTier } = useInsertMutation(
        supabase.from('price_tiers'),
        ['price_id'],
        'price_id',
        {
            onSuccess: () => {
                toast.success("Price tier created successfully");
                queryClient.invalidateQueries({ queryKey: ['price-tiers', sechuledId] })
            },
            onError: (error) => {
                console.error("Error creating price tier", error);
                toast.error("Error creating price tier");
            }
        }
    )

    const { mutateAsync: updatePriceTier, isPending: isUpdatingPriceTier } = useUpdateMutation(
        supabase.from('price_tiers'),
        ['price_id'],
        'price_id',
        {
            onSuccess: () => {
                toast.success("Price tier updated successfully");
                queryClient.invalidateQueries({ queryKey: ['price-tiers', sechuledId] })
            },
            onError: (error) => {
                console.error("Error updating price tier", error);
                toast.error("Error updating price tier");
            }
        }
    )


    const handleSubmit = (data: z.infer<typeof formSchema>) => {
        if (!sechuledId) return

        if (priceTier) {
            updatePriceTier({
                price_id: priceTier.price_id,
                price: data.price,
                maxHour: data.maxHour,
            })
        } else {
            createPriceTier([
                {
                    schedule_id: sechuledId,
                    price: data.price,
                    maxHour: data.maxHour,
                }
            ])
        }


        setIsModalOpen(false);
        form.reset();
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                {priceTier ?
                    <Edit className="w-4 h-4" /> :
                    <Button variant="default" size="sm">Add Price Tier</Button>
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Price Tier</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 100"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxHour"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Hour</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 24"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="default" type="submit" disabled={isCreatingPriceTier || isUpdatingPriceTier}>{isCreatingPriceTier || isUpdatingPriceTier ? "Submitting..." : "Submit"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}