import { FIVE_MEGA_BYTE, ZERO_POINT_TWO_MEGA_BYTE } from "./constants";

const bytesSizes = ["Bytes", "KB", "MB", "GB", "TB"];

export const bytesToSize = (bytes: number) => {
  if (bytes === 0) {
    return {
      size: bytes,
      formattedSize: "0 Bytes",
    };
  }

  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

  if (i === 0)
    return {
      size: bytes,
      formattedSize: `${bytes} ${bytesSizes[i]}`,
    };

  const size = bytes / 1024 ** i;

  const formattedSize = `${size.toFixed(1)} ${bytesSizes[i]}`;

  return {
    size: bytes,
    formattedSize,
  };
};

export const createBatches = (
  items: unknown[],
  onBatch?: (batch: unknown[]) => void,
  limitSize = FIVE_MEGA_BYTE,
) => {
  const safeLimitSize = () => {
    if (limitSize > ZERO_POINT_TWO_MEGA_BYTE) {
      return limitSize - ZERO_POINT_TWO_MEGA_BYTE;
    }
    return limitSize;
  };

  const safeSize = safeLimitSize();
  const batches = [];
  let batch: unknown[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const batchSize = Buffer.byteLength(JSON.stringify(batch));

    const { size: calculatedSize } = bytesToSize(batchSize);

    if (calculatedSize >= safeSize) {
      const lastItem = batch.pop();

      onBatch?.(batch);

      batches.push(batch);

      batch = lastItem ? [lastItem, item] : [item];
    } else {
      batch.push(item);

      if (i === items.length - 1) {
        onBatch?.(batch);
        batches.push(batch);
      }
    }
  }

  return batches;
};
