import { useState, useRef, ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2, File } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

type FileUploadProps = {
  projectId: number;
  onSuccess?: () => void;
};

export default function FileUpload({ projectId, onSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      return new Promise((resolve, reject) => {
        xhr.open("POST", `/api/projects/${projectId}/files`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText || "Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
      resetUpload();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", fileName);
    
    try {
      await uploadFileMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled in mutation
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setFileName("");
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Upload File</h3>
      
      {!selectedFile ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-4">Drag and drop a file here, or click to browse</p>
          <Input
            ref={fileInputRef}
            type="file"
            className="max-w-xs"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center">
            <File className="h-8 w-8 text-primary-600 mr-2" />
            <div className="flex-1">
              <Input 
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="mb-1"
                placeholder="File name" 
              />
              <p className="text-xs text-gray-500">
                {selectedFile.size < 1024 * 1024
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetUpload}
              disabled={isUploading}
              className="ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
