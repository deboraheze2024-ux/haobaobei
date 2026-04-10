'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadedImage {
  key: string;
  url: string;
  uploading?: boolean;
  error?: string;
}

export function ImageUploader({ images, onChange, maxImages = 9, className }: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    images.map(url => ({ key: url, url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxImages - uploadedImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) return;

    setUploadingCount(filesToUpload.length);

    for (const file of filesToUpload) {
      // 添加占位
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setUploadedImages(prev => [...prev, { key: tempId, url: '', uploading: true }]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '上传失败');
        }

        const data = await response.json();
        
        setUploadedImages(prev => 
          prev.map(img => 
            img.key === tempId 
              ? { key: data.key, url: data.url, uploading: false }
              : img
          )
        );
      } catch (error) {
        setUploadedImages(prev => 
          prev.map(img => 
            img.key === tempId 
              ? { key: tempId, url: '', uploading: false, error: error instanceof Error ? error.message : '上传失败' }
              : img
          )
        );
      }
    }

    setUploadingCount(0);
  };

  // 更新父组件
  useState(() => {
    const validImages = uploadedImages
      .filter(img => !img.uploading && !img.error && img.url)
      .map(img => img.key);
    onChange(validImages);
  });

  const handleRemove = (key: string) => {
    setUploadedImages(prev => prev.filter(img => img.key !== key));
    const validImages = uploadedImages
      .filter(img => img.key !== key && !img.uploading && !img.error && img.url)
      .map(img => img.key);
    onChange(validImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const canAddMore = uploadedImages.length < maxImages;

  return (
    <div className={cn('space-y-3', className)}>
      {/* 上传区域 */}
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <Upload className={cn('w-8 h-8 mx-auto mb-2', isDragging ? 'text-blue-500' : 'text-gray-400')} />
          <p className="text-sm text-gray-600">
            {isDragging ? '放开以上传' : '拖拽图片或点击上传'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            支持 JPG、PNG、GIF、WebP，最大 5MB
          </p>
          {uploadingCount > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">上传中...</span>
            </div>
          )}
        </div>
      )}

      {/* 图片预览 */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {uploadedImages.map((img) => (
            <div
              key={img.key}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
            >
              {img.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : img.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-500 p-2">
                  <X className="w-5 h-5 mb-1" />
                  <span className="text-xs text-center">{img.error}</span>
                </div>
              ) : (
                <>
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemove(img.key)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 图片计数 */}
      <p className="text-xs text-gray-500 text-right">
        {uploadedImages.filter(img => !img.uploading && !img.error).length} / {maxImages} 张图片
      </p>
    </div>
  );
}
