import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";

import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

/*
|--------------------------------------------------------------------------
| S3 Clients
|--------------------------------------------------------------------------
*/

const clients = new Map();

export function getS3Client(region) {
  if (!clients.has(region)) {
    clients.set(
      region,
      new S3Client({
        region,
      })
    );
  }

  return clients.get(region);
}

/*
|--------------------------------------------------------------------------
| Get ALL immediate files/folders for current prefix
|--------------------------------------------------------------------------
|
| Example:
|
| Prefix = ""
|
| products/
| banners/
| image.jpg
|
| We DO NOT recursively show:
|
| products/jewellery/ring.jpg
|
| until user opens products/ and jewellery/.
|
|--------------------------------------------------------------------------
*/

export async function listAllMedia({
  bucket,
  region,
  prefix = "",
}) {
  const s3 = getS3Client(region);

  let continuationToken;

  const allContents = [];
  const allPrefixes = [];

  do {
    const command =
      new ListObjectsV2Command({
        Bucket: bucket,

        Prefix: prefix,

        /*
        |--------------------------------------------------------------------------
        | Important
        |--------------------------------------------------------------------------
        |
        | Delimiter makes S3 behave like folders.
        |
        */

        Delimiter: "/",

        MaxKeys: 1000,

        ContinuationToken:
          continuationToken ||
          undefined,
      });

    const response =
      await s3.send(command);

    if (
      response.Contents
        ?.length
    ) {
      allContents.push(
        ...response.Contents
      );
    }

    if (
      response.CommonPrefixes
        ?.length
    ) {
      allPrefixes.push(
        ...response.CommonPrefixes
      );
    }

    continuationToken =
      response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
  } while (continuationToken);

  /*
  |--------------------------------------------------------------------------
  | Deduplicate folders
  |--------------------------------------------------------------------------
  */

  const uniquePrefixes =
    Array.from(
      new Map(
        allPrefixes.map(
          (item) => [
            item.Prefix,
            item,
          ]
        )
      ).values()
    );

  return {
    Contents: allContents,
    CommonPrefixes:
      uniquePrefixes,
  };
}

/*
|--------------------------------------------------------------------------
| Preview URL
|--------------------------------------------------------------------------
*/

export async function createPreviewUrl({
  bucket,
  region,
  key,
}) {
  const s3 =
    getS3Client(region);

  const command =
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

  return getSignedUrl(
    s3,
    command,
    {
      expiresIn: 3600,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Upload URL
|--------------------------------------------------------------------------
*/

export async function createUploadUrl({
  bucket,
  region,
  key,
  contentType,
}) {
  const s3 =
    getS3Client(region);

  const command =
    new PutObjectCommand({
      Bucket: bucket,

      Key: key,

      ContentType:
        contentType ||
        "application/octet-stream",
    });

  return getSignedUrl(
    s3,
    command,
    {
      expiresIn: 900,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Create Folder
|--------------------------------------------------------------------------
|
| S3 does not actually have folders.
|
| We create a zero-byte object ending with "/".
|
|--------------------------------------------------------------------------
*/

export async function createFolder({
  bucket,
  region,
  key,
}) {
  const s3 =
    getS3Client(region);

  const folderKey =
    key.endsWith("/")
      ? key
      : `${key}/`;

  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,

      Key: folderKey,

      Body: "",
    })
  );
}

/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

export async function deleteFile({
  bucket,
  region,
  key,
}) {
  const s3 =
    getS3Client(region);

  return s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/*
|--------------------------------------------------------------------------
| Rename / Move
|--------------------------------------------------------------------------
*/

export async function moveFile({
  bucket,
  region,
  sourceKey,
  destinationKey,
}) {
  const s3 =
    getS3Client(region);

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,

      CopySource:
        encodeURIComponent(
          `${bucket}/${sourceKey}`
        ),

      Key:
        destinationKey,
    })
  );

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: sourceKey,
    })
  );

  return true;
}