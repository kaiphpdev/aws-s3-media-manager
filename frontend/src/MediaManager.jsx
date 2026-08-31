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
import PreviewModal from "./components/media/PreviewModal";
import UploadDropzone from "./components/media/UploadDropzone";
import UploadProgress from "./components/media/UploadProgress";
import BulkActions from "./components/media/BulkActions";
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
    uploads,

    search,
    searchInput,

    limit,
    pagination,
    counts,

    previewFile,
    previewUrl,
    previewLoading,
    hasPreviousPreview,
    hasNextPreview,

    setSearchInput,
    setPage,

    submitSearch,
    clearSearch,
    changeLimit,

    handleUpload,
    uploadFiles,
    clearUploads,

    createFolder,

    openFile,
    closePreview,
    previewPrevious,
    previewNext,

    copyUrl,
    deleteFile,

    openFolder,
    goBack,
    goToRoot,
    changeBucket,

    

    selectedFiles,
    isFileSelected,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    deleteSelectedFiles,
    changePage,
    
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

  const isEmpty =
    !loading &&
    folders.length === 0 &&
    files.length === 0;

  function logout() {
    localStorage.removeItem(
      "media_manager_token"
    );

    onLogout();
  }

  async function onUpload(
    event
  ) {
    await handleUpload(
      event
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

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
          <UploadDropzone
            uploading={
              uploading
            }
            onFilesSelected={
              uploadFiles
            }
          />

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

              <BulkActions
                selectedCount={
                  selectedFiles.length
                }
                totalFiles={
                  files.length
                }
                onSelectAll={
                  selectAllFiles
                }
                onClear={
                  clearSelection
                }
                onDelete={
                  deleteSelectedFiles
                }
              />

              <MediaGrid
                folders={folders}
                files={files}
                selectedFiles={
                  selectedFiles
                }
                onOpenFolder={
                  openFolder
                }
                onOpenFile={
                  openFile
                }
                onCopyUrl={
                  copyUrl
                }
                onDeleteFile={
                  deleteFile
                }
                onToggleFileSelection={
                  toggleFileSelection
                }
              />

              <Pagination
                pagination={
                  pagination
                }
                onPageChange={
                  changePage
                }
              />
            </>
          )}
        </section>
      </main>

      <UploadProgress
        uploads={uploads}
        uploading={uploading}
        onClose={
          clearUploads
        }
      />

      <PreviewModal
        file={previewFile}
        previewUrl={
          previewUrl
        }
        loading={
          previewLoading
        }
        onClose={
          closePreview
        }
        onPrevious={
          previewPrevious
        }
        onNext={
          previewNext
        }
        hasPrevious={
          hasPreviousPreview
        }
        hasNext={
          hasNextPreview
        }
      />
    </div>
  );
}

export default MediaManager;