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