import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { LotStatus } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";

// Zod schema for form validation
const createLotSchema = z.object({
    name: z.string().min(1, "Lot name is required").max(100, "Lot name must be less than 100 characters"),
    phone: z.string().min(1, "Phone number is required").regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format"),
    location: z.string().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
    latitude: z.string().optional().refine((val) => !val || !isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90, {
        message: "Latitude must be between -90 and 90"
    }),
    longitude: z.string().optional().refine((val) => !val || !isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180, {
        message: "Longitude must be between -180 and 180"
    }),
    description: z.string().optional(),
    description_tag: z.string().optional(),
    space_count: z.string().min(1, "Total spaces is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Total spaces must be a positive number"
    }),
    open: z.string().optional(),
    close: z.string().optional(),
    amenities: z.string().optional(),
    status: z.enum([LotStatus.OPEN, LotStatus.CLOSED], {
        required_error: "Status is required"
    })
});

type CreateLotFormData = z.infer<typeof createLotSchema>;

interface CreateLotFormProps {
    userId: string;
    isCreateLotOpen: boolean;
    setIsCreateLotOpen: (isOpen: boolean) => void;
}

export default function CreateLotForm({ userId, isCreateLotOpen, setIsCreateLotOpen }: CreateLotFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateLotFormData>({
        resolver: zodResolver(createLotSchema),
        defaultValues: {
            status: LotStatus.OPEN
        }
    });

    const supabase = createClient();
    const { mutateAsync: createLot } = useInsertMutation(
        supabase.from('lots'),
        ['lot_id'],
        'lot_id',
        {
            onSuccess: () => {
                form.reset();
                setIsCreateLotOpen(false);
            },
            onError: (error) => {
                console.error(error.message)
            }
        }
    )

    const onSubmit = async (data: CreateLotFormData) => {
        setIsSubmitting(true);
        try {
            // Convert string values to appropriate types
            const lotData = {
                ...data,
                space_count: parseInt(data.space_count),
                amenities: data.amenities ? data.amenities.split(',').map(a => a.trim()) : [],
                supervisors: [userId],
                employees: [],
                images: [],
                qr_image: ""
            
            };

            await createLot([lotData]);
        } catch (error) {
            console.error('Error creating lot:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        setIsCreateLotOpen(false);
    };

    return (
        <Dialog open={isCreateLotOpen} onOpenChange={setIsCreateLotOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <Plus className="w-4 h-4" />
                    Add New Lot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Create New Parking Lot</DialogTitle>
                    <DialogDescription>
                        Add a new parking facility to your management system.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lot Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Downtown Parking" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main Street, City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="latitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                        <Input placeholder="40.7128" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="longitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                        <Input placeholder="-74.0060" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        </div> */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the parking facility..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description_tag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description Tag</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Premium Downtown Parking" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-between gap-4">
                            <FormField
                                control={form.control}
                                name="space_count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Spaces</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="150" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="open"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opening Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="close"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Closing Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="amenities"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amenities (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Security Cameras,Covered Parking,EV Charging" {...field} />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={LotStatus.OPEN}>Active</SelectItem>
                                            <SelectItem value={LotStatus.CLOSED}>Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Parking Lot"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}