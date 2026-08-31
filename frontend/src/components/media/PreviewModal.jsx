import { useEffect } from "react";

function PreviewModal({
  file,
  previewUrl,
  loading,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "ArrowLeft" &&
        hasPrevious
      ) {
        onPrevious();
      }

      if (
        event.key === "ArrowRight" &&
        hasNext
      ) {
        onNext();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    onClose,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
  ]);

  if (!file) {
    return null;
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  const isImage = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "svg",
    "avif",
  ].includes(extension);

  const isVideo = [
    "mp4",
    "mov",
    "webm",
  ].includes(extension);

  const isPdf =
    extension === "pdf";

  return (
    <div
      className="preview-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="preview-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="preview-modal-header">
          <div>
            <h3>{file.name}</h3>

            <p>{file.key}</p>
          </div>

          <button
            type="button"
            className="preview-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="preview-modal-body">
          <button
            type="button"
            className="preview-nav-button preview-nav-left"
            disabled={!hasPrevious}
            onClick={onPrevious}
          >
            ←
          </button>

          <div className="preview-content">
            {loading ? (
              <div className="preview-modal-loading">
                <div className="loader" />
                <p>Loading preview...</p>
              </div>
            ) : isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt={file.name}
                className="preview-modal-image"
              />
            ) : isVideo && previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="preview-modal-video"
              />
            ) : isPdf && previewUrl ? (
              <iframe
                src={previewUrl}
                title={file.name}
                className="preview-modal-pdf"
              />
            ) : previewUrl ? (
              <div className="preview-unsupported">
                <div className="preview-unsupported-icon">
                  📄
                </div>

                <h3>
                  Preview not available
                </h3>

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open file
                </a>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="preview-nav-button preview-nav-right"
            disabled={!hasNext}
            onClick={onNext}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;