import FolderCard from "./FolderCard";
import FileCard from "./FileCard";

function MediaGrid({
  folders,
  files,
  selectedFiles,
  onOpenFolder,
  onOpenFile,
  onCopyUrl,
  onDeleteFile,
  onToggleFileSelection,
}) {
  return (
    <div className="media-grid">
      {folders.map(
        (folder) => (
          <FolderCard
            key={
              folder.key
            }
            folder={
              folder
            }
            onOpen={
              onOpenFolder
            }
          />
        )
      )}

      {files.map(
        (file) => (
          <FileCard
            key={
              file.key
            }
            file={file}
            selected={
              selectedFiles.includes(
                file.key
              )
            }
            onToggleSelect={
              onToggleFileSelection
            }
            onOpen={
              onOpenFile
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