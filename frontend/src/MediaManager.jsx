import {
  useRef,
} from "react";

import Sidebar from "./components/media/Sidebar";
import Topbar from "./components/media/Topbar";
import Toolbar from "./components/media/Toolbar";
import LibraryHeader from "./components/media/LibraryHeader";
import MediaGrid from "./components/media/MediaGrid";
import Pagination from "./components/media/Pagination";
import EmptyState from "./components/media/EmptyState";

import useMediaManager from "./hooks/useMediaManager";

function MediaManager({
  onLogout,
}) {
  const fileInputRef =
    useRef(null);

  const {
    buckets,
    bucketId,
    prefix,
    folders,
    files,
    loading,
    uploading,
    search,
    searchInput,
    limit,
    pagination,
    counts,
    setSearchInput,
    setPage,
    submitSearch,
    clearSearch,
    changeLimit,
    handleUpload,
    createFolder,
    openFile,
    copyUrl,
    deleteFile,
    openFolder,
    goBack,
    goToRoot,
    changeBucket,
  } = useMediaManager();

  const currentBucket =
    buckets.find(
      (bucket) =>
        bucket.id ===
        bucketId
    );

  const pathParts =
    prefix
      .split("/")
      .filter(Boolean);

  function logout() {
    localStorage.removeItem(
      "media_manager_token"
    );

    onLogout();
  }

  function onUpload(event) {
    handleUpload(event);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  const isEmpty =
    !loading &&
    folders.length === 0 &&
    files.length === 0;

  return (
    <div className="media-app">
      <Sidebar
        buckets={buckets}
        bucketId={bucketId}
        onBucketChange={
          changeBucket
        }
        onLogout={logout}
      />

      <main className="main-content">
        <Topbar
          currentBucket={
            currentBucket
          }
          uploading={
            uploading
          }
          fileInputRef={
            fileInputRef
          }
          onUpload={
            onUpload
          }
        />

        <section className="content-area">
          <Toolbar
            pathParts={
              pathParts
            }
            search={search}
            searchInput={
              searchInput
            }
            onSearchInputChange={
              setSearchInput
            }
            onSearchSubmit={
              submitSearch
            }
            onClearSearch={
              clearSearch
            }
            onGoToRoot={
              goToRoot
            }
            onCreateFolder={
              createFolder
            }
          />

          <LibraryHeader
            counts={counts}
            prefix={prefix}
            limit={limit}
            onLimitChange={
              changeLimit
            }
            onGoBack={
              goBack
            }
          />

          {loading ||
          isEmpty ? (
            <EmptyState
              loading={loading}
              search={search}
              onClearSearch={
                clearSearch
              }
            />
          ) : (
            <>
              <MediaGrid
                folders={folders}
                files={files}
                onOpenFolder={openFolder}
                onPreviewFile={openFile}
                onCopyUrl={copyUrl}
                onDeleteFile={deleteFile}
              />

              <Pagination
                pagination={
                  pagination
                }
                onPageChange={
                  setPage
                }
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default MediaManager;