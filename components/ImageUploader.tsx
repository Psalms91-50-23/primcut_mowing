type DynamicImageInput = {
  id: string;
  label: string;
  file: File | null;
  previewUrl: string | null;
};

type ImageUploaderProps = {
  images: DynamicImageInput[];
  maxImages: number;
  imageInputKey: number;
  canAddMoreImages: boolean;
  onLabelChange: (id: string, value: string) => void;
  onFileChange: (id: string, file: File | null) => void;
  onAddImage: () => void;
  onRemoveImage: (id: string) => void;
  onOpenPreview: (url: string) => void;
};

export default function ImageUploader({
  images,
  maxImages,
  imageInputKey,
  canAddMoreImages,
  onLabelChange,
  onFileChange,
  onAddImage,
  onRemoveImage,
  onOpenPreview,
}: ImageUploaderProps) {
  return (
    <div className="space-y-4">
      <div className="font-semibold">Upload Images</div>

      <p className="text-xs italic text-gray-700">
        Please upload images if needed. Maximum {maxImages} images.
      </p>

      <div className="text-xs text-gray-600">
        {images.length} / {maxImages} image slots used
      </div>

      {images.map((img, index) => (
        <div
          key={img.id}
          className="rounded border border-gray-200 p-3 bg-white/70 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              Image {index + 1}
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveImage(img.id)}
                className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline hover:cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder={`Image ${index + 1} eg front yard`}
            value={img.label}
            onChange={(e) => onLabelChange(img.id, e.target.value)}
            className="input-border w-full border px-3 py-2 rounded"
          />

          <input
            key={`${imageInputKey}_${img.id}`}
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(img.id, e.target.files?.[0] || null)}
            className="input-border w-full border px-3 py-2 rounded hover:cursor-pointer"
          />

          {img.previewUrl && (
            <div className="space-y-2 block w-22 h-24 overflow-hidden rounded">
              <button
                type="button"
                onClick={() => onOpenPreview(img.previewUrl!)}
                className="block w-22 h-16 overflow-hidden rounded bg-gray-100 hover:opacity-90 transition hover:cursor-pointer"
              >
                <img
                  src={img.previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full rounded object-cover"
                />
              </button>

              <button
                type="button"
                onClick={() => onOpenPreview(img.previewUrl!)}
                className="text-xs text-green-700 hover:text-green-900 hover:underline hover:cursor-pointer"
              >
                Click to enlarge
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAddImage}
        disabled={!canAddMoreImages}
        className={`w-full border border-dashed py-2 rounded transition ${
          canAddMoreImages
            ? "border-green-700 text-green-700 hover:bg-green-50 hover:cursor-pointer"
            : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
        }`}
      >
        {canAddMoreImages
          ? "+ Add another image"
          : `Maximum ${maxImages} images reached`}
      </button>
    </div>
  );
}