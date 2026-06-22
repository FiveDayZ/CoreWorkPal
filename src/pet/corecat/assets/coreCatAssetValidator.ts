import type {
  CoreCatAssetId,
  CoreCatAssetMeta,
} from "./coreCatAssetManifest";

export type CoreCatAssetSource = "formal" | "placeholder";
export type CoreCatAssetRenderMode = CoreCatAssetSource;

export interface CoreCatAssetValidationItem {
  asset: CoreCatAssetMeta;
  exists: boolean;
  issues: string[];
  resolvedPath: string;
  source: CoreCatAssetSource;
}

export interface CoreCatAssetValidationReport {
  allRequiredSatisfied: boolean;
  availablePaths: string[];
  formalCount: number;
  items: CoreCatAssetValidationItem[];
  missingRequired: CoreCatAssetValidationItem[];
  placeholderCount: number;
}

export function normalizeCoreCatAssetPath(path: string) {
  return path
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^\.\//, "")
    .replace(/^src\/pet\/corecat\/assets\//, "");
}

export function getCoreCatAssetCandidatePaths(path: string) {
  const normalizedPath = normalizeCoreCatAssetPath(path);
  const extensionSwap =
    normalizedPath.endsWith(".png")
      ? normalizedPath.replace(/\.png$/, ".svg")
      : normalizedPath.endsWith(".svg")
        ? normalizedPath.replace(/\.svg$/, ".png")
        : null;

  return extensionSwap ? [normalizedPath, extensionSwap] : [normalizedPath];
}

export function validateCoreCatAssets(
  manifest: CoreCatAssetMeta[],
  availablePaths: string[],
): CoreCatAssetValidationReport {
  const normalizedAvailablePaths = availablePaths.map(normalizeCoreCatAssetPath);
  const availablePathSet = new Set(normalizedAvailablePaths);
  const items = manifest.map((asset) =>
    validateCoreCatAsset(asset, availablePathSet),
  );
  const missingRequired = items.filter(
    (item) => item.asset.required && !item.exists,
  );

  return {
    allRequiredSatisfied: missingRequired.length === 0,
    availablePaths: normalizedAvailablePaths,
    formalCount: items.filter((item) => item.source === "formal").length,
    items,
    missingRequired,
    placeholderCount: items.filter((item) => item.source === "placeholder").length,
  };
}

export function getCoreCatAssetValidationItem(
  report: CoreCatAssetValidationReport,
  id: CoreCatAssetId,
) {
  return report.items.find((item) => item.asset.id === id) ?? null;
}

export function resolveCoreCatAssetRenderMode(
  _assetId: CoreCatAssetId,
  assetUrl: string | null | undefined,
): CoreCatAssetRenderMode {
  return assetUrl ? "formal" : "placeholder";
}

export function shouldShowCoreCatAssetPanel(isDev: boolean) {
  return isDev;
}

function validateCoreCatAsset(
  asset: CoreCatAssetMeta,
  availablePathSet: Set<string>,
): CoreCatAssetValidationItem {
  const candidatePaths = getCoreCatAssetCandidatePaths(asset.path);
  const resolvedAssetPath =
    candidatePaths.find((candidatePath) => availablePathSet.has(candidatePath)) ??
    null;
  const exists = resolvedAssetPath != null;
  const issues: string[] = [];

  if (asset.required && !exists) {
    issues.push("missing required asset");
  }

  if (!asset.fallbackPath.trim()) {
    issues.push("empty fallback");
  }

  if (asset.width <= 0 || asset.height <= 0) {
    issues.push("invalid size");
  }

  if (
    asset.pivotX < 0 ||
    asset.pivotY < 0 ||
    asset.pivotX > asset.width ||
    asset.pivotY > asset.height
  ) {
    issues.push("pivot outside asset bounds");
  }

  return {
    asset,
    exists,
    issues,
    resolvedPath: resolvedAssetPath ?? asset.fallbackPath,
    source: exists ? "formal" : "placeholder",
  };
}
