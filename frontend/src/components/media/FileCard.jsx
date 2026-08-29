import {
  formatSize,
  getFileIcon,
} from "../../utils/media";

function FileCard({
  file,
  onPreview,
  onCopyUrl,
  onDelete,
}) {
  return (
    <article className="media-card">
      <div className="card-preview file-preview">
        <span>
          {getFileIcon(file.name)}
        </span>

        <button
          type="button"
          className="preview-card-button"
          onClick={() =>
            onPreview(file)
          }
        >
          Preview
        </button>
      </div>

      <div className="card-info">
        <div className="card-name">
          <strong title={file.name}>
            {file.name}
          </strong>
        </div>

        <p>
          {formatSize(file.size)}
        </p>
      </div>

      <div className="card-actions">
        <button
          type="button"
          onClick={() =>
            onPreview(file)
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