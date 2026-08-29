function Sidebar({
  buckets,
  bucketId,
  onBucketChange,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          M
        </div>

        <div>
          <h2>Media Manager</h2>
          <span>AWS S3 Library</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">
          BUCKETS
        </p>

        <div className="bucket-list">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              type="button"
              className={`bucket-item ${
                bucketId === bucket.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onBucketChange(bucket.id)
              }
            >
              <span className="bucket-icon">
                ☁
              </span>

              <span>
                {bucket.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            A
          </div>

          <div>
            <strong>
              Administrator
            </strong>

            <span>
              Media access
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;