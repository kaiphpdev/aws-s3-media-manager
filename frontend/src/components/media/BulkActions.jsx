function BulkActions({
  selectedCount,
  totalFiles,
  onSelectAll,
  onClear,
  onDelete,
}) {
  if (
    !selectedCount
  ) {
    return null;
  }

  const allSelected =
    selectedCount ===
      totalFiles &&
    totalFiles > 0;

  return (
    <div className="bulk-actions">
      <div className="bulk-actions-left">
        <strong>
          {selectedCount}
        </strong>

        <span>
          {selectedCount === 1
            ? "file selected"
            : "files selected"}
        </span>
      </div>

      <div className="bulk-actions-right">
        {!allSelected && (
          <button
            type="button"
            className="bulk-button"
            onClick={
              onSelectAll
            }
          >
            Select all
          </button>
        )}

        <button
          type="button"
          className="bulk-button"
          onClick={
            onClear
          }
        >
          Clear
        </button>

        <button
          type="button"
          className="bulk-delete-button"
          onClick={
            onDelete
          }
        >
          Delete selected
        </button>
      </div>
    </div>
  );
}

export default BulkActions;