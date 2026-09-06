import { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Settings2,
  Pencil,
  X,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { useItemStore, CustomItem } from "@/hooks/useItemStore";
import EditItemDialog from "./EditItemDialog";
import BundleEditor from "./BundleEditor";


const KEY_OPTIONS = [
  { value: 0, label: "!key 0" },
  { value: 1, label: "!key 1" },
  { value: 2, label: "!key 2" },
  { value: 3, label: "!key 3" },
];

const CustomItemManager = () => {
  const {
    customItems,
    overrides,
    trash,
    addCustomItem,
    updateItem,
    resetOverride,
    deleteItem,
    restoreFromTrash,
    removeFromTrash,
    clearTrash,
    getItemForEdit,
  } = useItemStore();

  const [resourceName, setResourceName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [keyType, setKeyType] = useState(1);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);

  const handleAdd = () => {
    if (!resourceName.trim() || !displayName.trim()) return;
    const priceNum = price.trim() ? parseInt(price, 10) : undefined;
    addCustomItem({
      id: resourceName.trim(),
      name: displayName.trim(),
      keyType,
      price: priceNum !== undefined && !isNaN(priceNum) ? priceNum : undefined,
      category: category.trim() || undefined,
    });
    setResourceName("");
    setDisplayName("");
    setKeyType(1);
    setPrice("");
    setCategory("");
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const overrideEntries = Object.entries(overrides);

  return (
    <div className="space-y-6 w-full">
      <BundleEditor />

      {/* Add form */}

      <div className="liquid-card p-5">
        <h2 className="text-foreground font-semibold text-sm mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Neue Ressource hinzufügen
        </h2>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground text-xs mb-1 block">
                Ressourcen-Name (ID)
              </label>
              <input
                type="text"
                placeholder="z.B. diamond_ring"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="w-full liquid-input text-foreground px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs mb-1 block">
                Anzeigename
              </label>
              <input
                type="text"
                placeholder="z.B. Diamant Ring"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full liquid-input text-foreground px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-xs mb-1 block">Key-Typ</label>
            <div className="flex gap-2">
              {KEY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setKeyType(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                    keyType === opt.value ? "liquid-tab-active" : "liquid-tab-inactive"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground text-xs mb-1 block">
                Preis (optional, für Rechner)
              </label>
              <input
                type="number"
                placeholder="z.B. 5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full liquid-input text-foreground px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs mb-1 block">
                Kategorie (optional, für Rechner)
              </label>
              <input
                type="text"
                placeholder="z.B. Laden"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full liquid-input text-foreground px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!resourceName.trim() || !displayName.trim()}
            className="w-full liquid-copy-btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Hinzufügen
          </button>
        </div>
      </div>

      {/* Custom items list */}
      {customItems.length > 0 && (
        <div>
          <p className="text-muted-foreground text-xs mb-3 px-1">
            {customItems.length} eigene Ressource
            {customItems.length !== 1 ? "n" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {customItems.map((item) => (
              <div
                key={item.id}
                className="liquid-card liquid-card-hover flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium text-sm truncate">{item.name}</p>
                  <p className="text-muted-foreground text-xs truncate font-mono">{item.id}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-accent/70 font-mono">
                      !key {item.keyType}
                    </span>
                    {item.price !== undefined && (
                      <span className="text-[10px] text-accent/70 font-mono">
                        {item.price.toLocaleString("de-CH")}$
                      </span>
                    )}
                    {item.category && (
                      <span className="text-[10px] text-muted-foreground/70">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item.id)}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    title="ID kopieren"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingItem(getItemForEdit(item.id))}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    title="Bearbeiten"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id, item.name)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overridden built-ins */}
      {overrideEntries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-muted-foreground text-xs">
              Geänderte Standard-Ressourcen ({overrideEntries.length})
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {overrideEntries.map(([id, o]) => (
              <div
                key={id}
                className="liquid-card flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium text-sm truncate">
                    {o.name ?? id}
                  </p>
                  <p className="text-muted-foreground text-xs truncate font-mono">{id}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {o.keyType !== undefined && (
                      <span className="text-[10px] text-accent/70 font-mono">
                        !key {o.keyType}
                      </span>
                    )}
                    {o.price !== undefined && (
                      <span className="text-[10px] text-accent/70 font-mono">
                        {o.price.toLocaleString("de-CH")}$
                      </span>
                    )}
                    {o.category && (
                      <span className="text-[10px] text-muted-foreground/70">
                        {o.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingItem(getItemForEdit(id))}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    title="Bearbeiten"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => resetOverride(id)}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    title="Auf Original zurücksetzen"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customItems.length === 0 && overrideEntries.length === 0 && trash.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Noch keine eigenen oder geänderten Ressourcen.
        </div>
      )}

      {/* Trash */}
      {trash.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-muted-foreground text-xs">
              Papierkorb ({trash.length}) – mit einem Klick wiederherstellen
            </p>
            <button
              onClick={clearTrash}
              className="text-muted-foreground hover:text-destructive transition-colors text-xs"
            >
              Leeren
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {trash.map((entry) => (
              <div
                key={entry.id}
                className="liquid-card flex items-center justify-between gap-3 px-4 py-3 opacity-70"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium text-sm truncate">{entry.name}</p>
                  <p className="text-muted-foreground text-xs truncate font-mono">{entry.id}</p>
                  <span className="text-[10px] text-muted-foreground/70">
                    {entry.kind === "custom" ? "Eigene Ressource" : "Standard-Ressource"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => restoreFromTrash(entry)}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    title="Wiederherstellen"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromTrash(entry.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Endgültig entfernen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EditItemDialog
        open={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(patch) => {
          if (editingItem) updateItem(editingItem.id, patch);
        }}
      />
    </div>
  );
};

export default CustomItemManager;
