function FolderCard({
  folder,
  onOpen,
}) {
  return (
    <article
      className="media-card folder-card"
      onDoubleClick={() =>
        onOpen(folder)
      }
    >
      <div className="card-preview folder-preview">
        <span>📁</span>
      </div>

      <div className="card-info">
        <div className="card-name">
          <strong title={folder.name}>
            {folder.name}
          </strong>
        </div>

        <p>Folder</p>
      </div>

      <button
        type="button"
        className="open-folder-button"
        onClick={() =>
          onOpen(folder)
        }
      >
        Open folder
      </button>
    </article>
  );
}

export default FolderCard;