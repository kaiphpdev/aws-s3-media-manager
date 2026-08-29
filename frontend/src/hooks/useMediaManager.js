import {
  useEffect,
  useState,
} from "react";

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

  const [search, setSearch] =
    useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(50);

  const [
    pagination,
    setPagination,
  ] = useState(
    defaultPagination
  );

  const [counts, setCounts] =
    useState(defaultCounts);

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
        response.data
          .buckets || [];

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
        response.data
          .folders || []
      );

      setFiles(
        response.data
          .files || []
      );

      setPagination(
        response.data
          .pagination ||
          defaultPagination
      );

      setCounts(
        response.data
          .counts ||
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

  async function uploadFile(file) {
    const response =
      await api.post(
        "/media/upload-url",
        {
          bucketId,
          prefix,
          fileName:
            file.name,
          contentType:
            file.type ||
            "application/octet-stream",
        }
      );

    const uploadResponse =
      await fetch(
        response.data.uploadUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              file.type ||
              "application/octet-stream",
          },
          body: file,
        }
      );

    if (!uploadResponse.ok) {
      throw new Error(
        `Unable to upload ${file.name}`
      );
    }
  }

  async function handleUpload(
    event
  ) {
    const selectedFiles =
      Array.from(
        event.target.files
      );

    if (!selectedFiles.length) {
      return;
    }

    try {
      setUploading(true);

      for (
        const file of
        selectedFiles
      ) {
        await uploadFile(file);
      }

      if (page === 1) {
        await loadMedia();
      } else {
        setPage(1);
      }
    } catch (error) {
      alert(
        error.message ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
    }
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
          folderName,
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
      const response =
        await api.post(
          "/media/preview-url",
          {
            bucketId,
            key:
              file.key,
          }
        );

      window.open(
        response.data.url,
        "_blank"
      );
    } catch {
      alert(
        "Unable to open file"
      );
    }
  }

  async function copyUrl(file) {
    try {
      const response =
        await api.post(
          "/media/preview-url",
          {
            bucketId,
            key:
              file.key,
          }
        );

      await navigator
        .clipboard
        .writeText(
          response.data.url
        );

      alert("URL copied");
    } catch {
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
            key:
              file.key,
          },
        }
      );

      await loadMedia();
    } catch {
      alert(
        "Unable to delete file"
      );
    }
  }

  function openFolder(folder) {
    setPrefix(folder.key);
    setPage(1);
    setSearch("");
    setSearchInput("");
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

    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function goToRoot() {
    setPrefix("");
    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function changeBucket(
    newBucketId
  ) {
    setBucketId(
      newBucketId
    );

    setPrefix("");
    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  return {
    buckets,
    bucketId,
    prefix,
    folders,
    files,
    loading,
    uploading,
    search,
    searchInput,
    page,
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
  };
}