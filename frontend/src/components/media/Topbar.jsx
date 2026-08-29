function Topbar({
  currentBucket,
  uploading,
  fileInputRef,
  onUpload,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>
          {currentBucket?.label ||
            "Media Library"}
        </h1>

        <p>
          Manage your S3 media files
        </p>
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : "↑ Upload files"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={onUpload}
      />
    </header>
  );
}

export default Topbar;