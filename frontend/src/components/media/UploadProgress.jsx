function UploadProgress({
  uploads,
  uploading,
  onClose,
}) {
  if (!uploads.length) {
    return null;
  }

  const completed =
    uploads.filter(
      (item) =>
        item.status ===
        "completed"
    ).length;

  const failed =
    uploads.filter(
      (item) =>
        item.status ===
        "failed"
    ).length;

  const finished =
    completed + failed;

  return (
    <div className="upload-progress-panel">
      <div className="upload-progress-header">
        <div>
          <strong>
            {uploading
              ? "Uploading files"
              : failed > 0
                ? "Upload completed with errors"
                : "Upload completed"}
          </strong>

          <span>
            {finished} of{" "}
            {uploads.length} finished
          </span>
        </div>

        {!uploading && (
          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>

      <div className="upload-progress-list">
        {uploads.map(
          (upload) => (
            <div
              className="upload-progress-item"
              key={upload.id}
            >
              <div className="upload-progress-info">
                <span
                  className="upload-progress-name"
                  title={
                    upload.name
                  }
                >
                  {upload.name}
                </span>

                <span
                  className={`upload-status ${upload.status}`}
                >
                  {upload.status ===
                  "completed"
                    ? "Done"
                    : upload.status ===
                        "failed"
                      ? "Failed"
                      : upload.status ===
                          "pending"
                        ? "Waiting"
                        : `${upload.progress}%`}
                </span>
              </div>

              <div className="upload-progress-bar">
                <div
                  className={`upload-progress-value ${upload.status}`}
                  style={{
                    width:
                      upload.status ===
                      "failed"
                        ? "100%"
                        : `${upload.progress}%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default UploadProgress;