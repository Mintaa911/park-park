
'use client';

import { frontendBaseUrl, getImageUrl } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { ParkingLot } from '@/types';
import { useState } from 'react';
import { useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { createClient } from '@/lib/supabase/client';

interface QrCodeProps {
  selectedLot: ParkingLot;
}

export default function GenerateQrCode({ selectedLot }: QrCodeProps) {
  const [isGeneratingQr, setIsGeneratingQr] = useState(false); 
  const supabase = createClient();
  const { mutateAsync: updateLot } = useUpdateMutation(
    supabase.from('lots'),
    ['lot_id'],
    'lot_id',
    {
      onSuccess: () => {
        console.log("Lot updated successfully");
      },
      onError: (error) => {
        console.error("Error updating lot", error);
      }
    }
  )   
  
    // Function to generate QR code as image and upload to bucket
    const generateAndUploadQrCode = async () => {
      setIsGeneratingQr(true);
      
      try {
        // Create a temporary div to render the QR code
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.background = 'white';
        tempDiv.style.padding = '16px';
        document.body.appendChild(tempDiv);
        
        // Create QR code component
        const qrValue = `${frontendBaseUrl}/${selectedLot.slug}`;
        const qrElement = document.createElement('div');
        tempDiv.appendChild(qrElement);
        
        // Use react-qr-code to render the QR code
        const React = await import('react');
        const ReactDOM = await import('react-dom/client');
        const root = ReactDOM.createRoot(qrElement);
        root.render(
          React.createElement(QRCode, {
            value: qrValue,
            size: 200,
            level: 'M',
            bgColor: '#FFFFFF',
            fgColor: '#000000',
          })
        );
        
        // Wait a bit for the QR code to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Convert the div to canvas using html2canvas
        const html2canvas = await import('html2canvas');
        const canvas = await html2canvas.default(tempDiv, {
          backgroundColor: '#FFFFFF',
          width: 232, // 200 + 32 padding
          height: 232,
          scale: 2, // Higher resolution
        });
        
        // Convert canvas to blob
        canvas.toBlob(async (blob: Blob | null) => {
          if (!blob) {
            throw new Error('Could not generate QR code image');
          }
          
          // Upload to Supabase storage
          const fileName = `qr-codes/${selectedLot.lot_id}/qr-code.png`;
          const { data: uploadData, error } = await supabase.storage
            .from('lots')
            .upload(fileName, blob, {
              contentType: 'image/png',
              upsert: true
            });
          
          if (error) {
            console.error("Error uploading QR code:", error);
            throw error;
          }
          
          // Update lot with QR image path
          await updateLot({
            lot_id: selectedLot.lot_id,
            qr_image: uploadData.path,
          });
          
          // Clean up
          document.body.removeChild(tempDiv);
          setIsGeneratingQr(false);
        }, 'image/png');
        
      } catch (error) {
        console.error("Error generating QR code:", error);
        setIsGeneratingQr(false);
      }
    };

  return (
    <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <QrCode className="w-4 h-4" />
        QR Code
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      {selectedLot.qr_image ? (
        <div>
          <img
            src={getImageUrl(`lots/${selectedLot.qr_image}`)}
            alt="QR Code"
            className="w-32 h-32 mx-auto border rounded-lg shadow-md"
          />
          <p className="text-sm text-gray-500 mt-2">Scan to access lot info</p>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={generateAndUploadQrCode}
          disabled={isGeneratingQr}
        >
          {isGeneratingQr ? "Generating..." : "Generate QR Code"}
        </Button>
      )}
    </CardContent>
  </Card>
  );
}
