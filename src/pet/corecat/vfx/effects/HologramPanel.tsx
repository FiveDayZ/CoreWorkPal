const codeLines = ["scan bus", "patch mem", "sync temp", "ok"];

export function HologramPanel() {
  return (
    <div className="corecat-hologram-panel" aria-hidden="true">
      <span className="corecat-hologram-grid" />
      <div className="corecat-hologram-code">
        {codeLines.concat(codeLines).map((line, index) => (
          <span key={`${line}-${index}`}>{line}</span>
        ))}
      </div>
    </div>
  );
}
