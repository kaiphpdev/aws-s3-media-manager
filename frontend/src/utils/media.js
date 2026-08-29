export function formatSize(bytes) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(
    bytes / Math.pow(1024, index)
  ).toFixed(1)} ${units[index]}`;
}

export function getFileIcon(fileName) {
  const extension =
    fileName.split(".").pop()?.toLowerCase() || "";

  if (
    [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "svg",
      "avif",
    ].includes(extension)
  ) {
    return "🖼️";
  }

  if (
    [
      "mp4",
      "mov",
      "avi",
      "webm",
      "mkv",
    ].includes(extension)
  ) {
    return "🎬";
  }

  if (extension === "pdf") {
    return "📕";
  }

  if (["zip", "rar", "7z"].includes(extension)) {
    return "🗜️";
  }

  return "📄";
}

export function getVisiblePages(pagination) {
  const total = pagination.totalPages || 1;
  const current = pagination.page || 1;

  const pages = [];

  let start = Math.max(current - 2, 1);
  let end = Math.min(start + 4, total);

  if (end - start < 4) {
    start = Math.max(end - 4, 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}