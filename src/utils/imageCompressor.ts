/**
 * Utilitaire de compression d'image côté navigateur (client-side).
 * Redimensionne les photos à un maximum de 1600px tout en conservant le ratio d'aspect
 * et optimise l'encodage JPEG pour un chargement instantané et une bande passante minimale.
 */

export async function compressImageToMax(
  file: File | Blob,
  maxDimension = 1600,
  quality = 0.85
): Promise<File> {
  // Si ce n'est pas une image matricielle (ex: SVG ou non-image), on ne compresse pas
  if (file.type && (!file.type.startsWith("image/") || file.type === "image/svg+xml")) {
    if (file instanceof File) return file;
    return new File([file], "image.jpg", { type: file.type || "image/jpeg" });
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Si l'image est déjà sous la limite, on garde sa taille native
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        if (file instanceof File) resolve(file);
        else resolve(new File([file], "image.jpg", { type: "image/jpeg" }));
        return;
      }

      // Qualité de filtrage maximale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            if (file instanceof File) resolve(file);
            else resolve(new File([file], "image.jpg", { type: "image/jpeg" }));
            return;
          }
          const fileName = (file instanceof File ? file.name : "photo.jpg")
            .replace(/\.[^/.]+$/, "") + ".jpg";
          const compressedFile = new File([blob], fileName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      if (file instanceof File) resolve(file);
      else resolve(new File([file], "image.jpg", { type: "image/jpeg" }));
    };

    img.src = objectUrl;
  });
}
