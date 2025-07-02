import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { LotStatus, ParkingLot } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useInsertMutation, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

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
    }),
    is_24_hours: z.boolean().optional(),
});

type CreateLotFormData = z.infer<typeof createLotSchema>;

interface CreateLotFormProps {
    userId: string;
    selectedLot?: ParkingLot;
}

export default function LotForm({ userId, selectedLot }: CreateLotFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLotModalOpen, setIsLotModalOpen] = useState(false);
    const [lotData, setLotData] = useState<ParkingLot | null>(selectedLot || null);

    const form = useForm<CreateLotFormData>({
        resolver: zodResolver(createLotSchema),
        defaultValues: {
            status: lotData?.status as LotStatus || LotStatus.OPEN,
            name: lotData?.name || "",
            phone: lotData?.phone || "",
            location: lotData?.location || "",
            description: lotData?.description || "",
            description_tag: lotData?.description_tag || "",
            space_count: lotData?.space_count?.toString() || "1",
            open: lotData?.open || "",
            close: lotData?.close || "",
            amenities: lotData?.amenities.join(",") || "",
            is_24_hours: lotData?.is_24_hours || false,
        }
    });


    useEffect(() => {
        if (selectedLot) {
            setLotData({
                ...selectedLot
            });
            form.reset({
                status: selectedLot?.status as LotStatus || LotStatus.OPEN,
                name: selectedLot?.name || "",
                phone: selectedLot?.phone || "",
                location: selectedLot?.location || "",
                description: selectedLot?.description || "",
                description_tag: selectedLot?.description_tag || "",
                space_count: selectedLot?.space_count?.toString() || "1",
                open: selectedLot?.open || "",
                close: selectedLot?.close || "",
                amenities: selectedLot?.amenities.join(",") || "",
                is_24_hours: selectedLot?.is_24_hours || false,
            })
        }
    }, [selectedLot, form]);

    const queryClient = useQueryClient();



    const supabase = createClient();
    const { mutateAsync: createLot } = useInsertMutation(
        supabase.from('lots'),
        ['lot_id'],
        'lot_id',
        {
            onSuccess: () => {
                toast.success("Lot created successfully");
                form.reset();
                setIsLotModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['lots', userId] });
            },
            onError: (error) => {
                console.error("Error creating lot", error);
                toast.error("Error creating lot");
            }
        }
    )
    const { mutateAsync: updateLot } = useUpdateMutation(
        supabase.from('lots'),
        ['lot_id'],
        'lot_id',
        {
            onSuccess: () => {
                toast.success("Lot updated successfully");
                form.reset();
                setIsLotModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['lots', userId] });
            },
            onError: (error) => {
                console.error("Error updating lot", error);
                toast.error("Error updating lot");
            }
        }
    )

    const onSubmit = async (data: CreateLotFormData) => {
        setIsSubmitting(true);
        try {
            // Convert string values to appropriate types
            const newLotData = {
                ...data,
                space_count: parseInt(data.space_count),
                amenities: data.amenities ? data.amenities.split(',').map(a => a.trim()) : [],
                supervisors: [userId],
                employees: [],
                images: [],
                qr_image: "",
                slug: data.name.toLowerCase().replace(/ /g, '-'),
                is_24_hours: data.is_24_hours ? true : false,
            };

            if (lotData) {
                await updateLot({
                    ...newLotData,
                    lot_id: lotData.lot_id,
                    qr_image: lotData.qr_image,
                    slug: lotData.slug,
                    employees: lotData.employees,
                    supervisors: lotData.supervisors,
                    images: lotData.images,
                    is_24_hours: lotData.is_24_hours ? true : false,
                });
            } else {

                await createLot([newLotData]);
            }

        } catch (error) {
            console.error("Error creating/updating lot", error);
            toast.error("Error creating/updating lot");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        setIsLotModalOpen(false);
    };

    return (
        <Dialog open={isLotModalOpen} onOpenChange={setIsLotModalOpen}>
            <DialogTrigger asChild>
                {lotData ? (
                    <Button variant="outline">
                        <Pencil className="w-4 h-4" />
                        Edit Lot
                    </Button>
                ) : (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                        <Plus className="w-4 h-4" />
                        Add New Lot
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{lotData ? "Edit Parking Lot" : "Create New Parking Lot"}</DialogTitle>
                    <DialogDescription>
                        {lotData ? "Edit the parking facility to your management system." : "Add a new parking facility to your management system."}
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
                        <div className="flex  gap-4">
                            {!form.watch('is_24_hours') && (
                                <>
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
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="is_24_hours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>24 Hours open</FormLabel>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                {isSubmitting ? "Processing..." : lotData ? "Update Parking Lot" : "Create Parking Lot"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}