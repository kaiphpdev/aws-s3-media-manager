import express from "express";

import {
  buckets,
  getBucket,
} from "../config/buckets.js";

import {
  listAllMedia,
  createPreviewUrl,
  createUploadUrl,
  createFolder,
  deleteFile,
  moveFile,
} from "../services/s3.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Get Buckets
|--------------------------------------------------------------------------
*/

router.get(
  "/buckets",
  async (req, res) => {
    const result =
      Object.values(
        buckets
      ).map((item) => ({
        id: item.id,
        label: item.label,
      }));

    return res.json({
      success: true,
      buckets: result,
    });
  }
);

/*
|--------------------------------------------------------------------------
| List Files + Pagination
|--------------------------------------------------------------------------
|
| Example:
|
| GET /api/media/files/womancart?page=1&limit=50
|
| GET /api/media/files/womancart?page=2&limit=50&prefix=products/
|
|--------------------------------------------------------------------------
*/

router.get(
  "/files/:bucketId",
  async (req, res) => {
    try {
      const bucketConfig =
        getBucket(
          req.params.bucketId
        );

      if (!bucketConfig) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Bucket not found",
          });
      }

      const prefix =
        req.query.prefix ||
        "";

      const search =
        (
          req.query.search ||
          ""
        )
          .trim()
          .toLowerCase();

      let page =
        Number(
          req.query.page
        ) || 1;

      let limit =
        Number(
          req.query.limit
        ) || 50;

      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      */

      if (page < 1) {
        page = 1;
      }

      limit =
        Math.min(
          Math.max(
            limit,
            10
          ),
          100
        );

      /*
      |--------------------------------------------------------------------------
      | Get immediate S3 contents
      |--------------------------------------------------------------------------
      */

      const data =
        await listAllMedia({
          bucket:
            bucketConfig.bucket,

          region:
            bucketConfig.region,

          prefix,
        });

      /*
      |--------------------------------------------------------------------------
      | Map folders
      |--------------------------------------------------------------------------
      */

      let folders =
        (
          data.CommonPrefixes ||
          []
        ).map((item) => ({
          type:
            "folder",

          key:
            item.Prefix,

          name:
            item.Prefix
              .replace(
                prefix,
                ""
              )
              .replace(
                /\/$/,
                ""
              ),
        }));

      /*
      |--------------------------------------------------------------------------
      | Map files
      |--------------------------------------------------------------------------
      */

      let files =
        (
          data.Contents ||
          []
        )
          /*
          |--------------------------------------------------------------------------
          | Remove current folder marker
          |--------------------------------------------------------------------------
          */

          .filter(
            (item) =>
              item.Key !==
              prefix
          )

          /*
          |--------------------------------------------------------------------------
          | Remove zero-byte folder objects
          |--------------------------------------------------------------------------
          */

          .filter(
            (item) =>
              !item.Key.endsWith(
                "/"
              )
          )

          .map(
            (item) => ({
              type:
                "file",

              key:
                item.Key,

              name:
                item.Key
                  .split("/")
                  .pop(),

              size:
                item.Size ||
                0,

              lastModified:
                item.LastModified,

              etag:
                item.ETag,
            })
          );

      /*
      |--------------------------------------------------------------------------
      | Search
      |--------------------------------------------------------------------------
      */

      if (search) {
        folders =
          folders.filter(
            (folder) =>
              folder.name
                .toLowerCase()
                .includes(
                  search
                )
          );

        files =
          files.filter(
            (file) =>
              file.name
                .toLowerCase()
                .includes(
                  search
                )
          );
      }

      /*
      |--------------------------------------------------------------------------
      | Sort folders alphabetically
      |--------------------------------------------------------------------------
      */

      folders.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              numeric: true,
              sensitivity:
                "base",
            }
          )
      );

      /*
      |--------------------------------------------------------------------------
      | Sort files alphabetically
      |--------------------------------------------------------------------------
      */

      files.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              numeric: true,
              sensitivity:
                "base",
            }
          )
      );

      /*
      |--------------------------------------------------------------------------
      | FOLDERS FIRST
      |--------------------------------------------------------------------------
      */

      const allItems = [
        ...folders,
        ...files,
      ];

      /*
      |--------------------------------------------------------------------------
      | Pagination
      |--------------------------------------------------------------------------
      */

      const totalItems =
        allItems.length;

      const totalPages =
        Math.max(
          1,
          Math.ceil(
            totalItems /
              limit
          )
        );

      /*
      |--------------------------------------------------------------------------
      | Prevent invalid page
      |--------------------------------------------------------------------------
      */

      if (
        page >
        totalPages
      ) {
        page =
          totalPages;
      }

      const startIndex =
        (page - 1) *
        limit;

      const endIndex =
        startIndex +
        limit;

      const pageItems =
        allItems.slice(
          startIndex,
          endIndex
        );

      /*
      |--------------------------------------------------------------------------
      | Split page items for frontend
      |--------------------------------------------------------------------------
      */

      const paginatedFolders =
        pageItems.filter(
          (item) =>
            item.type ===
            "folder"
        );

      const paginatedFiles =
        pageItems.filter(
          (item) =>
            item.type ===
            "file"
        );

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.json({
        success: true,

        prefix,

        search,

        folders:
          paginatedFolders,

        files:
          paginatedFiles,

        counts: {
          folders:
            folders.length,

          files:
            files.length,

          total:
            totalItems,
        },

        pagination: {
          page,

          limit,

          totalItems,

          totalPages,

          hasPreviousPage:
            page > 1,

          hasNextPage:
            page <
            totalPages,

          previousPage:
            page > 1
              ? page - 1
              : null,

          nextPage:
            page <
            totalPages
              ? page + 1
              : null,

          from:
            totalItems ===
            0
              ? 0
              : startIndex +
                1,

          to:
            Math.min(
              endIndex,
              totalItems
            ),
        },
      });
    } catch (error) {
      console.error(
        "LIST MEDIA ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load media",

          error:
            error.message,
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Preview URL
|--------------------------------------------------------------------------
*/

router.post(
  "/preview-url",
  async (req, res) => {
    try {
      const {
        bucketId,
        key,
      } = req.body;

      if (
        !bucketId ||
        !key
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "bucketId and key are required",
          });
      }

      const bucketConfig =
        getBucket(
          bucketId
        );

      if (
        !bucketConfig
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Bucket not found",
          });
      }

      const url =
        await createPreviewUrl({
          bucket:
            bucketConfig.bucket,

          region:
            bucketConfig.region,

          key,
        });

      return res.json({
        success: true,

        url,

        expiresIn:
          3600,
      });
    } catch (error) {
      console.error(
        "PREVIEW ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to create preview URL",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Upload URL
|--------------------------------------------------------------------------
*/

router.post(
  "/upload-url",
  async (req, res) => {
    try {
      const {
        bucketId,
        prefix = "",
        fileName,
        contentType,
      } = req.body;

      if (
        !bucketId ||
        !fileName
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "bucketId and fileName are required",
          });
      }

      const bucketConfig =
        getBucket(
          bucketId
        );

      if (
        !bucketConfig
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Bucket not found",
          });
      }

      const safeFileName =
        fileName
          .replace(
            /\s+/g,
            "-"
          )
          .replace(
            /[^a-zA-Z0-9._-]/g,
            ""
          );

      const normalizedPrefix =
        prefix &&
        !prefix.endsWith(
          "/"
        )
          ? `${prefix}/`
          : prefix;

      const key =
        `${normalizedPrefix}${Date.now()}-${safeFileName}`;

      const uploadUrl =
        await createUploadUrl({
          bucket:
            bucketConfig.bucket,

          region:
            bucketConfig.region,

          key,

          contentType:
            contentType ||
            "application/octet-stream",
        });

      return res.json({
        success: true,

        uploadUrl,

        key,
      });
    } catch (error) {
      console.error(
        "UPLOAD URL ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to generate upload URL",

          error:
            error.message,
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Create Folder
|--------------------------------------------------------------------------
*/

router.post(
  "/folder",
  async (req, res) => {
    try {
      const {
        bucketId,
        prefix = "",
        folderName,
      } = req.body;

      if (
        !bucketId ||
        !folderName?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "bucketId and folderName are required",
          });
      }

      const bucketConfig =
        getBucket(
          bucketId
        );

      if (
        !bucketConfig
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Bucket not found",
          });
      }

      /*
      |--------------------------------------------------------------------------
      | Clean folder name
      |--------------------------------------------------------------------------
      */

      const safeFolderName =
        folderName
          .trim()
          .replace(
            /[^a-zA-Z0-9 _-]/g,
            ""
          )
          .replace(
            /\s+/g,
            "-"
          );

      if (
        !safeFolderName
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid folder name",
          });
      }

      const normalizedPrefix =
        prefix &&
        !prefix.endsWith(
          "/"
        )
          ? `${prefix}/`
          : prefix;

      const key =
        `${normalizedPrefix}${safeFolderName}/`;

      await createFolder({
        bucket:
          bucketConfig.bucket,

        region:
          bucketConfig.region,

        key,
      });

      /*
      |--------------------------------------------------------------------------
      | Very important
      |--------------------------------------------------------------------------
      |
      | Return folder to React as well.
      |
      */

      return res.json({
        success: true,

        message:
          "Folder created successfully",

        folder: {
          type:
            "folder",

          key,

          name:
            safeFolderName,
        },
      });
    } catch (error) {
      console.error(
        "CREATE FOLDER ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to create folder",

          error:
            error.message,
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

router.delete(
  "/file",
  async (req, res) => {
    try {
      const {
        bucketId,
        key,
      } = req.body;

      if (
        !bucketId ||
        !key
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "bucketId and key are required",
          });
      }

      const bucketConfig =
        getBucket(
          bucketId
        );

      if (
        !bucketConfig
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Bucket not found",
          });
      }

      await deleteFile({
        bucket:
          bucketConfig.bucket,

        region:
          bucketConfig.region,

        key,
      });

      return res.json({
        success: true,

        message:
          "File deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to delete file",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Move / Rename
|--------------------------------------------------------------------------
*/

router.post(
  "/move",
  async (req, res) => {
    try {
      const {
        bucketId,
        sourceKey,
        destinationKey,
      } = req.body;

      if (
        !bucketId ||
        !sourceKey ||
        !destinationKey
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "bucketId, sourceKey and destinationKey are required",
          });
      }

      const bucketConfig =
        getBucket(
          bucketId
        );

      if (
        !bucketConfig
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Bucket not found",
          });
      }

      await moveFile({
        bucket:
          bucketConfig.bucket,

        region:
          bucketConfig.region,

        sourceKey,

        destinationKey,
      });

      return res.json({
        success: true,

        message:
          "File moved successfully",
      });
    } catch (error) {
      console.error(
        "MOVE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to move file",
        });
    }
  }
);

export default router;