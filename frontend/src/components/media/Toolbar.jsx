function Toolbar({
  pathParts,
  search,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  onGoToRoot,
  onCreateFolder,
}) {
  return (
    <div className="toolbar-card">
      <div className="breadcrumb">
        <button
          type="button"
          className="breadcrumb-home"
          onClick={onGoToRoot}
        >
          Home
        </button>

        {pathParts.map(
          (part, index) => (
            <div
              className="breadcrumb-part"
              key={`${part}-${index}`}
            >
              <span>/</span>
              <span>{part}</span>
            </div>
          )
        )}
      </div>

      <div className="toolbar-actions">
        <form
          className="search-box"
          onSubmit={onSearchSubmit}
        >
          <span>🔍</span>

          <input
            value={searchInput}
            onChange={(event) =>
              onSearchInputChange(
                event.target.value
              )
            }
            placeholder="Search files and folders..."
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={onClearSearch}
            >
              ×
            </button>
          )}
        </form>

        <button
          type="button"
          className="secondary-button"
          onClick={onCreateFolder}
        >
          + New folder
        </button>
      </div>
    </div>
  );
}

export default Toolbar;