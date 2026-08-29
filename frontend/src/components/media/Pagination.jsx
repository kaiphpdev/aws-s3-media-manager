import {
  getVisiblePages,
} from "../../utils/media";

function Pagination({
  pagination,
  onPageChange,
}) {
  const visiblePages =
    getVisiblePages(pagination);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <strong>
          {pagination.from}
        </strong>

        {" - "}

        <strong>
          {pagination.to}
        </strong>

        {" of "}

        <strong>
          {pagination.totalItems}
        </strong>

        {" items"}

        <span className="pagination-page-info">
          Page{" "}
          <strong>
            {pagination.page}
          </strong>{" "}
          of{" "}
          <strong>
            {pagination.totalPages}
          </strong>
        </span>
      </div>

      <div className="pagination-buttons">
        <button
          type="button"
          className="pagination-button"
          disabled={
            !pagination.hasPreviousPage
          }
          onClick={() =>
            onPageChange(
              pagination.page - 1
            )
          }
        >
          ←
        </button>

        {visiblePages[0] > 1 && (
          <>
            <button
              type="button"
              className="page-number-button"
              onClick={() =>
                onPageChange(1)
              }
            >
              1
            </button>

            {visiblePages[0] > 2 && (
              <span className="pagination-dots">
                ...
              </span>
            )}
          </>
        )}

        {visiblePages.map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`page-number-button ${
                pageNumber ===
                pagination.page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onPageChange(
                  pageNumber
                )
              }
            >
              {pageNumber}
            </button>
          )
        )}

        {visiblePages[
          visiblePages.length - 1
        ] <
          pagination.totalPages && (
          <>
            {visiblePages[
              visiblePages.length - 1
            ] <
              pagination.totalPages -
                1 && (
              <span className="pagination-dots">
                ...
              </span>
            )}

            <button
              type="button"
              className="page-number-button"
              onClick={() =>
                onPageChange(
                  pagination.totalPages
                )
              }
            >
              {
                pagination.totalPages
              }
            </button>
          </>
        )}

        <button
          type="button"
          className="pagination-button"
          disabled={
            !pagination.hasNextPage
          }
          onClick={() =>
            onPageChange(
              pagination.page + 1
            )
          }
        >
          →
        </button>
      </div>
    </div>
  );
}

export default Pagination;