import { Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import React, { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { PickerFile } from '@/types';
import { FormLabel } from './ui/form';


export default function FileUpload({
  label,
  files,
  setFiles,
  maxFiles = 1,
}: {
  label: string;
  files: PickerFile[];
  setFiles: React.Dispatch<React.SetStateAction<PickerFile[]>>;
  maxFiles?: number;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles([
        ...files,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
    },
    accept: {
      'image/png': ['.png', '.PNG', '.jpg', '.jpeg', '.JPEG', '.svg', '.SVG'],
    },
    maxFiles: maxFiles,
    maxSize: 1024 * 1024 * 4,
  });

  const thumbs = files.map((file) => (
    <div className="w-20 h-20 rounded-md overflow-hidden relative" key={file.preview}>
      <div className="w-full h-full">
        <img
          className="w-full h-full object-cover"
          src={file.preview}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
      <button
        className="absolute top-0.5 right-0.5 bg-primary rounded-full p-1"
        onClick={() => {
          setFiles(files.filter((f) => f.preview !== file.preview));
          URL.revokeObjectURL(file.preview);
        }}
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>

      <div
        {...getRootProps()}
        className={cn('border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center', isDragActive && 'border-primary')}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-1">Drag and drop your {label} here</p>
        <p className="text-xs text-muted-foreground mb-4">PNG, JPG or SVG, max 4MB</p>
      </div>

      <aside className="flex flex-wrap gap-2">{thumbs}</aside>
    </div>
  );
}
