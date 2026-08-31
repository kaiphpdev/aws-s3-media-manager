import {
  useEffect,
  useState,
} from "react";

import axios from "axios";
import api from "../api";

const defaultPagination = {
  page: 1,
  limit: 50,
  totalItems: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  previousPage: null,
  nextPage: null,
  from: 0,
  to: 0,
};

const defaultCounts = {
  folders: 0,
  files: 0,
  total: 0,
};

export default function useMediaManager() {
  const [buckets, setBuckets] =
    useState([]);

  const [bucketId, setBucketId] =
    useState("");

  const [prefix, setPrefix] =
    useState("");

  const [folders, setFolders] =
    useState([]);

  const [files, setFiles] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [uploads, setUploads] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(50);

  const [pagination, setPagination] =
    useState(defaultPagination);

  const [counts, setCounts] =
    useState(defaultCounts);

  const [previewFile, setPreviewFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  useEffect(() => {
    loadBuckets();
  }, []);

  useEffect(() => {
    if (bucketId) {
      loadMedia();
    }
  }, [
    bucketId,
    prefix,
    page,
    limit,
    search,
  ]);

  async function loadBuckets() {
    try {
      const response =
        await api.get(
          "/media/buckets"
        );

      const list =
        response.data.buckets ||
        [];

      setBuckets(list);

      if (list.length) {
        setBucketId(
          list[0].id
        );
      }
    } catch (error) {
      console.error(
        "LOAD BUCKETS:",
        error
      );
    }
  }

  async function loadMedia() {
    if (!bucketId) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.get(
          `/media/files/${bucketId}`,
          {
            params: {
              prefix,
              page,
              limit,
              search:
                search ||
                undefined,
            },
          }
        );

      setFolders(
        response.data.folders ||
          []
      );

      setFiles(
        response.data.files ||
          []
      );

      setPagination(
        response.data.pagination ||
          defaultPagination
      );

      setCounts(
        response.data.counts ||
          defaultCounts
      );

      if (
        response.data
          .pagination?.page &&
        response.data
          .pagination.page !==
          page
      ) {
        setPage(
          response.data
            .pagination.page
        );
      }
    } catch (error) {
      console.error(
        "LOAD MEDIA:",
        error
      );

      alert(
        error.response
          ?.data?.message ||
          "Unable to load media"
      );
    } finally {
      setLoading(false);
    }
  }

  function submitSearch(event) {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim()
    );
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function changeLimit(event) {
    setLimit(
      Number(
        event.target.value
      )
    );

    setPage(1);
  }

  function updateUpload(
    uploadId,
    values
  ) {
    setUploads(
      (current) =>
        current.map(
          (item) =>
            item.id === uploadId
              ? {
                  ...item,
                  ...values,
                }
              : item
        )
    );
  }

  async function uploadFile(
    file,
    uploadId
  ) {
    const response =
      await api.post(
        "/media/upload-url",
        {
          bucketId,
          prefix,
          fileName: file.name,
          contentType:
            file.type ||
            "application/octet-stream",
        }
      );

    await axios.put(
      response.data.uploadUrl,
      file,
      {
        headers: {
          "Content-Type":
            file.type ||
            "application/octet-stream",
        },

        onUploadProgress: (
          progressEvent
        ) => {
          const total =
            progressEvent.total ||
            file.size;

          const progress =
            total > 0
              ? Math.round(
                  (
                    progressEvent.loaded /
                    total
                  ) * 100
                )
              : 0;

          updateUpload(
            uploadId,
            {
              progress,
            }
          );
        },
      }
    );
  }

  async function uploadFiles(
    selectedFiles
  ) {
    const filesToUpload =
      Array.from(
        selectedFiles || []
      );

    if (!filesToUpload.length) {
      return;
    }

    if (!bucketId) {
      alert(
        "Please select a bucket"
      );

      return;
    }

    const batchId =
      Date.now();

    const newUploads =
      filesToUpload.map(
        (file, index) => ({
          id: `${batchId}-${index}-${file.name}`,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "pending",
          file,
        })
      );

    setUploads(newUploads);
    setUploading(true);

    for (
      const upload of
      newUploads
    ) {
      try {
        updateUpload(
          upload.id,
          {
            status:
              "uploading",
          }
        );

        await uploadFile(
          upload.file,
          upload.id
        );

        updateUpload(
          upload.id,
          {
            progress: 100,
            status:
              "completed",
          }
        );
      } catch (error) {
        console.error(
          "UPLOAD ERROR:",
          upload.name,
          error
        );

        updateUpload(
          upload.id,
          {
            status:
              "failed",
          }
        );
      }
    }

    setUploading(false);

    if (page !== 1) {
      setPage(1);
    } else {
      await loadMedia();
    }
  }

  async function handleUpload(
    event
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ||
          []
      );

    if (!selectedFiles.length) {
      return;
    }

    await uploadFiles(
      selectedFiles
    );

    event.target.value = "";
  }

  function clearUploads() {
    if (uploading) {
      return;
    }

    setUploads([]);
  }

  async function createFolder() {
    const folderName =
      window.prompt(
        "Enter folder name"
      );

    if (!folderName?.trim()) {
      return;
    }

    try {
      await api.post(
        "/media/folder",
        {
          bucketId,
          prefix,
          folderName:
            folderName.trim(),
        }
      );

      if (page !== 1) {
        setPage(1);
      } else {
        await loadMedia();
      }
    } catch (error) {
      alert(
        error.response
          ?.data?.message ||
          "Unable to create folder"
      );
    }
  }

  async function openFile(file) {
    try {
      setPreviewFile(file);
      setPreviewUrl("");
      setPreviewLoading(true);

      const response =
        await api.post(
          "/media/preview-url",
          {
            bucketId,
            key: file.key,
          }
        );

      setPreviewUrl(
        response.data.url
      );
    } catch (error) {
      console.error(
        "PREVIEW ERROR:",
        error
      );

      alert(
        "Unable to preview file"
      );

      setPreviewFile(null);
      setPreviewUrl("");
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewFile(null);
    setPreviewUrl("");
    setPreviewLoading(false);
  }

  function getPreviewIndex() {
    if (!previewFile) {
      return -1;
    }

    return files.findIndex(
      (file) =>
        file.key ===
        previewFile.key
    );
  }

  async function previewPrevious() {
    const currentIndex =
      getPreviewIndex();

    if (currentIndex <= 0) {
      return;
    }

    await openFile(
      files[
        currentIndex - 1
      ]
    );
  }

  async function previewNext() {
    const currentIndex =
      getPreviewIndex();

    if (
      currentIndex === -1 ||
      currentIndex >=
        files.length - 1
    ) {
      return;
    }

    await openFile(
      files[
        currentIndex + 1
      ]
    );
  }

  async function copyUrl(file) {
    try {
      const response =
        await api.post(
          "/media/preview-url",
          {
            bucketId,
            key: file.key,
          }
        );

      await navigator
        .clipboard
        .writeText(
          response.data.url
        );

      alert(
        "URL copied"
      );
    } catch (error) {
      console.error(
        "COPY URL:",
        error
      );

      alert(
        "Unable to copy URL"
      );
    }
  }

  async function deleteFile(file) {
    const confirmed =
      window.confirm(
        `Delete "${file.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        "/media/file",
        {
          data: {
            bucketId,
            key: file.key,
          },
        }
      );

      if (
        previewFile?.key ===
        file.key
      ) {
        closePreview();
      }

      await loadMedia();
    } catch (error) {
      console.error(
        "DELETE FILE:",
        error
      );

      alert(
        "Unable to delete file"
      );
    }
  }

  function openFolder(folder) {
    closePreview();

    setPrefix(
      folder.key
    );

    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function goBack() {
    if (!prefix) {
      return;
    }

    closePreview();

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

    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function goToRoot() {
    closePreview();

    setPrefix("");
    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function changeBucket(
    newBucketId
  ) {
    closePreview();

    setBucketId(
      newBucketId
    );

    setPrefix("");
    setPage(1);
    setSearch("");
    setSearchInput("");

    if (!uploading) {
      setUploads([]);
    }
  }

  const previewIndex =
    getPreviewIndex();

  const hasPreviousPreview =
    previewIndex > 0;

  const hasNextPreview =
    previewIndex !== -1 &&
    previewIndex <
      files.length - 1;

  return {
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

    page,
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

    loadMedia,
  };
}