type LogMeta = Record<string, unknown> | Error | undefined;

function formatMeta(meta?: LogMeta) {
  if (!meta) {
    return "";
  }

  if (meta instanceof Error) {
    return `\n${meta.stack ?? meta.message}`;
  }

  return ` ${JSON.stringify(meta)}`;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(`[INFO] ${message}${formatMeta(meta)}`);
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  error(message: string, meta?: LogMeta) {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  }
};
