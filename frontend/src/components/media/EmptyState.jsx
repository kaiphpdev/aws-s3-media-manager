function EmptyState({
  loading,
  search,
  onClearSearch,
}) {
  if (loading) {
    return (
      <div className="empty-state">
        <div className="loader" />

        <h3>
          Loading media
        </h3>

        <p>
          Fetching files from S3...
        </p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-icon">
        📂
      </div>

      <h3>
        {search
          ? "No results found"
          : "This folder is empty"}
      </h3>

      <p>
        {search
          ? `No results for "${search}".`
          : "Upload files or create a new folder."}
      </p>

      {search && (
        <button
          type="button"
          className="secondary-button"
          onClick={onClearSearch}
        >
          Clear search
        </button>
      )}
    </div>
  );
}

export default EmptyState;