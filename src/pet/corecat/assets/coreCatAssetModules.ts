import {
  coreCatAssetManifest,
  coreCatAssetMetaById,
  type CoreCatAssetId,
} from "./coreCatAssetManifest";
import {
  getCoreCatAssetCandidatePaths,
  normalizeCoreCatAssetPath,
  validateCoreCatAssets,
} from "./coreCatAssetValidator";

const assetModules = import.meta.glob("./corecat_skeleton/**/*.{png,svg}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const runtimeAssetUrlsByPath = Object.fromEntries(
  Object.entries(assetModules).map(([path, url]) => [
    normalizeCoreCatAssetPath(path),
    url,
  ]),
) as Record<string, string>;

export const coreCatRuntimeAssetReport = validateCoreCatAssets(
  coreCatAssetManifest,
  Object.keys(runtimeAssetUrlsByPath),
);

export function getCoreCatRuntimeAssetUrl(assetId: CoreCatAssetId) {
  const asset = coreCatAssetMetaById[assetId];
  const resolvedPath = getCoreCatAssetCandidatePaths(asset.path).find(
    (candidatePath) => runtimeAssetUrlsByPath[candidatePath],
  );

  return resolvedPath ? runtimeAssetUrlsByPath[resolvedPath] : null;
}
