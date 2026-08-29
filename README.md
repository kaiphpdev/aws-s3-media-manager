# AWS S3 Media Manager

A web-based media manager for managing files and folders across multiple AWS S3 buckets from a single interface.

It provides a simple React dashboard for browsing buckets, navigating folders, uploading files, creating folders, previewing private files, copying temporary URLs, deleting files, searching, and pagination.

## Features

* Multiple AWS S3 bucket support
* Browse files and folders
* Folder-first sorting
* Folder navigation with breadcrumbs
* Create new folders
* Upload multiple files
* Private S3 bucket support
* Presigned URLs for uploads
* Generate preview URLs only when requested
* Copy temporary file URLs
* Delete files
* Search files and folders
* Pagination with total page count
* 20 / 50 / 100 items per page
* Responsive React UI
* JWT-based authentication
* AWS credentials remain on the backend

## Tech Stack

### Frontend

* React
* Vite
* Axios
* CSS

### Backend

* Node.js
* Express.js
* AWS SDK v3
* JWT
* CORS
* dotenv

### Storage

* Amazon S3

## Project Structure

```text
aws-s3-media-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── buckets.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── media/
│   │   │       ├── EmptyState.jsx
│   │   │       ├── FileCard.jsx
│   │   │       ├── FolderCard.jsx
│   │   │       ├── LibraryHeader.jsx
│   │   │       ├── MediaGrid.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Toolbar.jsx
│   │   │       └── Topbar.jsx
│   │   ├── hooks/
│   │   │   └── useMediaManager.js
│   │   ├── utils/
│   │   │   └── media.js
│   │   ├── api.js
│   │   └── MediaManager.jsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Architecture

```text
React Frontend
      |
      | REST API
      v
Node.js / Express Backend
      |
      | AWS SDK v3
      v
Amazon S3
      |
      +-- Bucket 1
      +-- Bucket 2
      +-- Bucket 3
```

AWS credentials are stored only on the backend and are never exposed to the React application.

## Bucket Configuration

S3 buckets are configured in:

```text
backend/src/config/buckets.js
```

Example:

```javascript
export const buckets = {
  bucketOne: {
    id: "bucketOne",
    label: "Media Bucket 1",
    bucket: "your-first-bucket-name",
    region: "ap-south-1",
  },

  bucketTwo: {
    id: "bucketTwo",
    label: "Media Bucket 2",
    bucket: "your-second-bucket-name",
    region: "ap-south-1",
  },

  bucketThree: {
    id: "bucketThree",
    label: "Media Bucket 3",
    bucket: "your-third-bucket-name",
    region: "ap-south-1",
  },
};

export function getBucket(bucketId) {
  return buckets[bucketId] || null;
}
```

To add another S3 bucket:

```javascript
bucketFour: {
  id: "bucketFour",
  label: "Media Bucket 4",
  bucket: "your-fourth-bucket-name",
  region: "ap-south-1",
},
```

After changing the bucket configuration, restart the backend.

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd aws-s3-media-manager
```

### Backend Setup

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure your local `.env` file and start the backend:

```bash
npm run dev
```

The backend will normally run at:

```text
http://localhost:5000
```

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

## Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

AWS_REGION=ap-south-1

AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY

JWT_SECRET=YOUR_SECURE_RANDOM_JWT_SECRET

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=CHANGE_ME

FRONTEND_URL=http://localhost:5173
```

Do not store S3 bucket names in the environment file if your application uses `buckets.js`.

Bucket configuration belongs in:

```text
backend/src/config/buckets.js
```

## Frontend Environment Variables

Create:

```text
frontend/.env
```

If you are using a Vite proxy:

```env
VITE_API_URL=/api
```

Otherwise:

```env
VITE_API_URL=http://localhost:5000/api
```

## AWS IAM Permissions

The AWS user or role used by the backend needs access to every bucket configured in:

```text
backend/src/config/buckets.js
```

Typical required S3 permissions are:

```text
s3:ListBucket
s3:GetBucketLocation
s3:GetObject
s3:PutObject
s3:DeleteObject
```

Example IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::your-first-bucket-name",
        "arn:aws:s3:::your-second-bucket-name"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-first-bucket-name/*",
        "arn:aws:s3:::your-second-bucket-name/*"
      ]
    }
  ]
}
```

Use the principle of least privilege and grant access only to the buckets required by the application.

## S3 CORS Configuration

Direct browser uploads using presigned URLs require CORS configuration on each S3 bucket.

Example for local development:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:5173"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

For production, replace:

```text
http://localhost:5173
```

with your actual frontend domain.

## Upload Flow

Files are uploaded directly from the browser to S3 using a temporary presigned URL.

```text
React
   |
   | Request upload URL
   v
Backend
   |
   | Generate presigned PUT URL
   v
React
   |
   | Upload file directly
   v
Amazon S3
```

This prevents AWS credentials from being exposed to the browser.

## Preview Flow

Preview URLs are generated only when a user requests a preview.

```text
Media Library Loads
        |
        | No preview requests
        v
User clicks Preview
        |
        v
POST /api/media/preview-url
        |
        v
Backend generates presigned URL
        |
        v
File opens
```

This reduces unnecessary backend requests and presigned URL generation.

## Pagination

The Media Manager supports page-based pagination.

Example:

```text
1 - 50 of 376 items

Page 1 of 8

←  1  2  3  4  5  ...  8  →
```

Available page sizes:

```text
20 per page
50 per page
100 per page
```

Folders are displayed before files.

Example:

```text
Folder A
Folder B
Folder C

image-01.jpg
image-02.jpg
video-01.mp4
```

## Adding a New Bucket

Open:

```text
backend/src/config/buckets.js
```

Add the bucket:

```javascript
newBucket: {
  id: "newBucket",
  label: "New Media Bucket",
  bucket: "your-new-bucket-name",
  region: "ap-south-1",
},
```

Make sure the AWS IAM user or role also has access to:

```text
arn:aws:s3:::your-new-bucket-name
arn:aws:s3:::your-new-bucket-name/*
```

Restart the backend:

```bash
npm run dev
```

The new bucket should then appear in the Media Manager.

## Security

Never commit sensitive information to the repository.

Do not commit:

* `.env` files
* AWS access keys
* AWS secret access keys
* JWT secrets
* Admin passwords
* Private keys
* Production credentials

AWS credentials should only be configured on the backend and must never be exposed to the frontend.

The `backend/src/config/buckets.js` file should contain only bucket configuration and must not contain AWS credentials.

Use `.env.example` files to document required environment variables without including real values.

If credentials were accidentally committed previously, rotate or revoke them before making the repository public.

## Production Recommendations

Before deploying to production:

1. Use HTTPS.
2. Use a strong JWT secret.
3. Use secure authentication.
4. Restrict IAM permissions to only the required S3 buckets.
5. Keep S3 buckets private unless public access is intentionally required.
6. Configure S3 CORS for the production frontend domain.
7. Configure backend CORS for the production frontend domain.
8. Never expose AWS credentials to the frontend.
9. Prefer IAM roles instead of permanent AWS access keys when hosting the backend on AWS.
