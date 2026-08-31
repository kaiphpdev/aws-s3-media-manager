import {
  formatSize,
  getFileIcon,
} from "../../utils/media";

function FileCard({
  file,
  selected,
  onToggleSelect,
  onOpen,
  onCopyUrl,
  onDelete,
}) {
  return (
    <article
      className={`media-card ${
        selected
          ? "selected"
          : ""
      }`}
    >
      <div className="file-select">
        <input
          type="checkbox"
          checked={selected}
          onChange={() =>
            onToggleSelect(
              file
            )
          }
          onClick={(event) =>
            event.stopPropagation()
          }
        />
      </div>

      <div
        className="card-preview file-preview"
        onClick={() =>
          onOpen(file)
        }
      >
        <span>
          {getFileIcon(
            file.name
          )}
        </span>

        <div className="preview-overlay">
          Preview
        </div>
      </div>

      <div className="card-info">
        <div className="card-name">
          <strong
            title={
              file.name
            }
          >
            {file.name}
          </strong>
        </div>

        <p>
          {formatSize(
            file.size
          )}
        </p>
      </div>

      <div className="card-actions">
        <button
          type="button"
          onClick={() =>
            onOpen(file)
          }
        >
          Preview
        </button>

        <button
          type="button"
          onClick={() =>
            onCopyUrl(file)
          }
        >
          Copy URL
        </button>

        <button
          type="button"
          className="delete-button"
          onClick={() =>
            onDelete(file)
          }
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default FileCard;