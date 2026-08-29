function LibraryHeader({
  counts,
  prefix,
  limit,
  onLimitChange,
  onGoBack,
}) {
  return (
    <div className="library-header">
      <div>
        <h3>Files & folders</h3>

        <p>
          {counts.folders} folders •{" "}
          {counts.files} files •{" "}
          {counts.total} total
        </p>
      </div>

      <div className="library-header-actions">
        {prefix && (
          <button
            type="button"
            className="back-button"
            onClick={onGoBack}
          >
            ← Back
          </button>
        )}

        <select
          className="page-limit-select"
          value={limit}
          onChange={onLimitChange}
        >
          <option value="20">
            20 per page
          </option>

          <option value="50">
            50 per page
          </option>

          <option value="100">
            100 per page
          </option>
        </select>
      </div>
    </div>
  );
}

export default LibraryHeader;