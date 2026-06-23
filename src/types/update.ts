export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  changelog: string;
  downloadUrl: string;
  assetId: number | null;
  assetSize: number;
  assetName: string;
}

export interface DownloadProgress {
  bytesDownloaded: number;
  totalBytes: number;
  percent: number;
}
