import type { CoreCatAssetValidationReport } from "../assets/coreCatAssetValidator";
import { shouldShowCoreCatAssetPanel } from "../assets/coreCatAssetValidator";

interface CoreCatAssetPanelProps {
  report: CoreCatAssetValidationReport;
}

export function CoreCatAssetPanel({ report }: CoreCatAssetPanelProps) {
  if (!shouldShowCoreCatAssetPanel(import.meta.env.DEV)) {
    return null;
  }

  return (
    <section className="corecat-asset-panel" aria-label="CoreCat asset checker">
      <header>
        <strong>Assets</strong>
        <span
          className={
            report.allRequiredSatisfied ? "is-formal" : "is-placeholder"
          }
        >
          {report.formalCount}/{report.items.length} loaded
        </span>
      </header>
      <dl>
        <div>
          <dt>formal</dt>
          <dd>{report.formalCount}</dd>
        </div>
        <div>
          <dt>fallback</dt>
          <dd>{report.placeholderCount}</dd>
        </div>
        <div>
          <dt>missing</dt>
          <dd>{report.missingRequired.length}</dd>
        </div>
      </dl>
      <ol>
        {report.items.map((item) => (
          <li key={item.asset.id} className={`is-${item.source}`}>
            <span>{item.asset.id}</span>
            <small>{item.asset.anchorNode}</small>
            <small>
              {item.asset.pivotX},{item.asset.pivotY}
            </small>
            <small>{item.source}</small>
            <small title={item.resolvedPath}>{item.resolvedPath}</small>
            <small>{item.issues.join("; ") || "ok"}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
