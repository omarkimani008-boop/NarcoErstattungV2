import { useState } from "react";
import { Plus, Trash2, Package, Pencil, X, Check, Copy } from "lucide-react";
import { useItemStore, Bundle, BundleLine } from "@/hooks/useItemStore";

const KEY_OPTIONS = [0, 1, 2, 3];

const emptyLine = (): BundleLine => ({ keyType: 1, resourceId: "", quantity: 1 });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const BundleEditor = () => {
  const { bundles, saveBundle, deleteBundle, buildLines } = useItemStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [lines, setLines] = useState<BundleLine[]>([emptyLine()]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reset = () => {
    setEditingId(null);
    setName("");
    setLines([emptyLine()]);
  };

  const startEdit = (b: Bundle) => {
    setEditingId(b.id);
    setName(b.name);
    setLines(b.lines.length ? b.lines.map((l) => ({ ...l })) : [emptyLine()]);
  };

  const updateLine = (idx: number, patch: Partial<BundleLine>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const handleSave = () => {
    const cleanLines = lines
      .filter((l) => l.resourceId.trim())
      .map((l) => ({
        keyType: l.keyType,
        resourceId: l.resourceId.trim(),
        quantity: Math.max(1, l.quantity || 1),
      }));
    if (!name.trim() || cleanLines.length === 0) return;
    const id = editingId ?? `bundle_${slugify(name) || Date.now()}`;
    saveBundle({ id, name: name.trim(), lines: cleanLines });
    reset();
  };

  const handleCopy = (b: Bundle) => {
    navigator.clipboard.writeText(buildLines(b.id, 1).join("\n"));
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const canSave = !!name.trim() && lines.some((l) => l.resourceId.trim());

  return (
    <div className="space-y-6 w-full">
      <div className="liquid-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <Package className="w-4 h-4" />
            {editingId ? "Bundle bearbeiten" : "Neues Bundle erstellen"}
          </h2>
          {editingId && (
            <button
              onClick={reset}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Abbrechen
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground text-xs mb-1 block">Bundle-Name</label>
            <input
              type="text"
              placeholder="z.B. Volle Aufsätze"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full liquid-input text-foreground px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs block">Zeilen</label>
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="liquid-panel-item flex flex-wrap items-center gap-2 p-2.5 rounded-xl"
              >
                <div className="flex gap-1">
                  {KEY_OPTIONS.map((k) => (
                    <button
                      key={k}
                      onClick={() => updateLine(idx, { keyType: k })}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-300 ${
                        line.keyType === k ? "liquid-tab-active" : "liquid-tab-inactive"
                      }`}
                    >
                      !key {k}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="ressourcen_id"
                  value={line.resourceId}
                  onChange={(e) => updateLine(idx, { resourceId: e.target.value })}
                  className="flex-1 min-w-[140px] liquid-input text-foreground px-3 py-2 text-xs font-mono outline-none placeholder:text-muted-foreground"
                />
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    updateLine(idx, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                  }
                  className="w-20 liquid-input text-foreground px-3 py-2 text-xs text-center outline-none"
                />
                <button
                  onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Zeile entfernen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setLines((prev) => [...prev, emptyLine()])}
              className="liquid-tab-inactive w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Zeile hinzufügen
            </button>
          </div>

          {canSave && (
            <div className="liquid-code-block p-3 rounded-xl">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                Vorschau
              </p>
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                {lines
                  .filter((l) => l.resourceId.trim())
                  .map(
                    (l) =>
                      `!key ${l.keyType} ${l.resourceId.trim()} ${Math.max(1, l.quantity || 1)} 1`
                  )
                  .join("\n")}
              </pre>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full liquid-copy-btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" /> {editingId ? "Änderungen speichern" : "Bundle speichern"}
          </button>
        </div>
      </div>

      {bundles.length > 0 && (
        <div>
          <p className="text-muted-foreground text-xs mb-3 px-1">
            {bundles.length} Bundle{bundles.length !== 1 ? "s" : ""} – erscheinen automatisch in
            Schnellkopie &amp; Mehrfachauswahl
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {bundles.map((b) => (
              <div key={b.id} className="liquid-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium text-sm truncate flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-accent" />
                      {b.name}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-mono truncate">{b.id}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(b)}
                      className="text-muted-foreground hover:text-accent transition-colors"
                      title="Kopieren"
                    >
                      {copiedId === b.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(b)}
                      className="text-muted-foreground hover:text-accent transition-colors"
                      title="Bearbeiten"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBundle(b.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <pre className="mt-2 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {b.lines
                    .map((l) => `!key ${l.keyType} ${l.resourceId} ${l.quantity} 1`)
                    .join("\n")}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleEditor;
