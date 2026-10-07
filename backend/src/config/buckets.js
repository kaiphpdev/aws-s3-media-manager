export const buckets = JSON.parse(process.env.AWS_BUCKETS);

export function getBucket(bucketId) {
  const match = Object.entries(buckets).find(
    ([key, value]) => value === bucketId
  );

  if (!match) return null;

  return {
    id: match[0],
    bucket: match[1],
    region: process.env.AWS_REGION,
  };
}