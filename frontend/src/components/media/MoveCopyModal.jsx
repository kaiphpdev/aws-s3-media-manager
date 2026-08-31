import {
  useEffect,
  useState,
} from "react";

import api from "../../api";

function MoveCopyModal({
  open,
  mode,
  bucketId,
  selectedCount,
  currentPrefix,
  loading,
  onClose,
  onSubmit,
}) {
  const [
    prefix,
    setPrefix,
  ] = useState("");

  const [
    folders,
    setFolders,
  ] = useState([]);

  const [
    foldersLoading,
    setFoldersLoading,
  ] = useState(false);

  const [
    overwrite,
    setOverwrite,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPrefix("");
    setOverwrite(false);
  }, [
    open,
    mode,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    loadFolders();
  }, [
    open,
    bucketId,
    prefix,
  ]);

  async function loadFolders() {
    try {
      setFoldersLoading(
        true
      );

      const response =
        await api.get(
          `/media/folders/${bucketId}`,
          {
            params: {
              prefix,
            },
          }
        );

      setFolders(
        response.data
          .folders || []
      );
    } catch (error) {
      console.error(
        "LOAD FOLDERS:",
        error
      );

      setFolders([]);
    } finally {
      setFoldersLoading(
        false
      );
    }
  }

  function openFolder(
    folder
  ) {
    setPrefix(
      folder.key
    );
  }

  function goBack() {
    if (!prefix) {
      return;
    }

    const parts =
      prefix
        .replace(/\/$/, "")
        .split("/");

    parts.pop();

    setPrefix(
      parts.length
        ? `${parts.join("/")}/`
        : ""
    );
  }

  function getFolderName() {
    if (!prefix) {
      return "Bucket root";
    }

    const parts =
      prefix
        .replace(/\/$/, "")
        .split("/");

    return (
      parts[
        parts.length - 1
      ] || "Bucket root"
    );
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="move-copy-backdrop"
      onClick={onClose}
    >
      <div
        className="move-copy-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="move-copy-header">
          <div>
            <h3>
              {mode === "move"
                ? "Move files"
                : "Copy files"}
            </h3>

            <p>
              {selectedCount}{" "}
              {selectedCount === 1
                ? "file"
                : "files"}{" "}
              selected
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="move-copy-current">
          <span>
            Destination
          </span>

          <strong>
            {getFolderName()}
          </strong>

          <small>
            /{prefix}
          </small>
        </div>

        <div className="move-copy-navigation">
          <button
            type="button"
            onClick={() =>
              setPrefix("")
            }
            disabled={!prefix}
          >
            Home
          </button>

          <button
            type="button"
            onClick={goBack}
            disabled={!prefix}
          >
            ← Back
          </button>
        </div>

        <div className="move-copy-folders">
          {foldersLoading ? (
            <div className="move-copy-loading">
              <div className="loader" />
              <span>
                Loading folders...
              </span>
            </div>
          ) : folders.length ? (
            folders.map(
              (folder) => (
                <button
                  type="button"
                  className="destination-folder"
                  key={
                    folder.key
                  }
                  onClick={() =>
                    openFolder(
                      folder
                    )
                  }
                >
                  <span>
                    📁
                  </span>

                  <strong>
                    {
                      folder.name
                    }
                  </strong>

                  <span>
                    →
                  </span>
                </button>
              )
            )
          ) : (
            <div className="move-copy-empty">
              No subfolders
            </div>
          )}
        </div>

        <label className="overwrite-option">
          <input
            type="checkbox"
            checked={overwrite}
            onChange={(event) =>
              setOverwrite(
                event.target
                  .checked
              )
            }
          />

          <span>
            Overwrite files with
            the same name
          </span>
        </label>

        {mode === "move" &&
          prefix ===
            currentPrefix && (
            <div className="destination-warning">
              This is the current
              folder. Choose another
              destination.
            </div>
          )}

        <div className="move-copy-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              loading ||
              (mode ===
                "move" &&
                prefix ===
                  currentPrefix)
            }
            onClick={() =>
              onSubmit({
                destinationPrefix:
                  prefix,
                overwrite,
              })
            }
          >
            {loading
              ? mode ===
                "move"
                ? "Moving..."
                : "Copying..."
              : mode ===
                  "move"
                ? `Move ${selectedCount}`
                : `Copy ${selectedCount}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoveCopyModal;