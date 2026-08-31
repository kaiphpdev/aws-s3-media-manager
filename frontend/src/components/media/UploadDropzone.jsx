import { useRef, useState } from "react";

function UploadDropzone({
  uploading,
  onFilesSelected,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(true);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      return;
    }

    setDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);

    const files = Array.from(
      event.dataTransfer.files
    );

    if (files.length) {
      onFilesSelected(files);
    }
  }

  function handleInputChange(event) {
    const files = Array.from(
      event.target.files
    );

    if (files.length) {
      onFilesSelected(files);
    }

    event.target.value = "";
  }

  return (
    <div
      className={`upload-dropzone ${
        dragging ? "dragging" : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() =>
        inputRef.current?.click()
      }
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={handleInputChange}
      />

      <div className="upload-dropzone-icon">
        ↑
      </div>

      <div className="upload-dropzone-content">
        <strong>
          {uploading
            ? "Uploading files..."
            : "Drop files here"}
        </strong>

        <span>
          or click to browse
        </span>
      </div>
    </div>
  );
}

export default UploadDropzone;