import FolderCard from "./FolderCard";
import FileCard from "./FileCard";

function MediaGrid({
  folders,
  files,
  onOpenFolder,
  onPreviewFile,
  onCopyUrl,
  onDeleteFile,
}) {
  return (
    <div className="media-grid">
      {folders.map(
        (folder) => (
          <FolderCard
            key={folder.key}
            folder={folder}
            onOpen={onOpenFolder}
          />
        )
      )}

      {files.map(
        (file) => (
          <FileCard
            key={file.key}
            file={file}
            onPreview={
              onPreviewFile
            }
            onCopyUrl={
              onCopyUrl
            }
            onDelete={
              onDeleteFile
            }
          />
        )
      )}
    </div>
  );
}

export default MediaGrid;