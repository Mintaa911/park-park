import { ParkingLot, PickerFile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Star, Phone, MapPin, Clock, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FileUpload from "@/components/file-upload";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { formatTime, getImageUrl } from "@/lib/utils";
import GenerateQrCode from "@/components/generate-qr-code";
import { useQueryClient } from "@tanstack/react-query";
import LotForm from "./create-lot-form";

// Zod schema for form validation
const uploadImagesSchema = z.object({
  files: z.array(z.any()).min(1, "Please select at least one image to upload"),
});

type UploadImagesFormData = z.infer<typeof uploadImagesSchema>;

interface OverviewProps {
  selectedLot: ParkingLot;
  userId: string;
}

export default function Overview({ selectedLot, userId }: OverviewProps) {
  const [files, setFiles] = useState<PickerFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const supabase = createClient();

  const { mutateAsync: updateLot } = useUpdateMutation(
    supabase.from('lots'),
    ['lot_id'],
    'lot_id',
    {
      onSuccess: () => {
        console.log("Lot updated successfully");
        queryClient.invalidateQueries({ queryKey: ['lots'] });
      },
      onError: (error) => {
        console.error("Error updating lot", error);
      }
    }
  )

  const form = useForm<UploadImagesFormData>({
    resolver: zodResolver(uploadImagesSchema),
    defaultValues: {
      files: [],
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Upload all files and wait for all to complete
      const uploadPromises = files.map(async (file) => {
        const fileName = `images/${selectedLot.lot_id}/${file.name}`;

        const { data: uploadData, error } = await supabase.storage.from('lots').upload(
          fileName,
          file
        );

        if (error) {
          console.error("Error uploading file:", error);
          throw error; // Re-throw to be caught by Promise.all
        }

        return uploadData.path;
      });

      // Wait for all uploads to complete
      const images = await Promise.all(uploadPromises);

      // Now update the lot with all uploaded image paths
      await updateLot({
        lot_id: selectedLot.lot_id,
        images: [...selectedLot.images, ...images],
      });

      form.reset();
      setIsDialogOpen(false);

    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFiles([]);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Information */}
      <div className="lg:col-span-2 space-y-6">
        {/* Images */}

        <div>
          <div className="flex justify-between">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Facility Images
            </h4>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mb-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Facility Images</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <FileUpload
                                label="Upload Images"
                                files={files}
                                setFiles={(newFiles) => {
                                  setFiles(newFiles);
                                  field.onChange(newFiles);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || files.length === 0}
                        >
                          {isSubmitting ? "Uploading..." : "Upload Images"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <LotForm userId={userId} selectedLot={selectedLot} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedLot.images.map((image: string, index: number) => (
              <img
                key={index}
                src={getImageUrl(`lots/${image}`)}
                alt={`${selectedLot.name} - Image ${index + 1}`}
                className="w-64 h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
            ))}
          </div>
        </div>


        {/* Description */}
        {selectedLot.description && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">{selectedLot.description}</p>
            {selectedLot.description_tag && (
              <Badge variant="outline" className="mt-2">
                <Star className="w-3 h-3 mr-1" />
                {selectedLot.description_tag}
              </Badge>
            )}
          </div>
        )}

        {/* Contact & Hours */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {selectedLot.phone}
              </p>
              {selectedLot.latitude && selectedLot.longitude && (
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {selectedLot.latitude}, {selectedLot.longitude}
                </p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Operating Hours</h4>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(selectedLot.open)} - {formatTime(selectedLot.close)}
              </span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {selectedLot.amenities && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {selectedLot.amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats*/}
      <div className="space-y-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spaces</span>
              <span className="font-semibold text-2xl">{selectedLot.space_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Schedules</span>
              <span className="font-semibold">{2}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{3}</span>
            </div>

          </CardContent>
        </Card>

        {/* QR Code */}
        <GenerateQrCode selectedLot={selectedLot} />
      </div>
    </div>
  )
}