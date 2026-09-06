import { useMemo, useState } from "react";
import { CalcItem } from "@/data/calculatorItems";
import {
  Search,
  Plus,
  Minus,
  Check,
  Copy,
  Trash2,
  X,
  Calculator,
  Pencil,
} from "lucide-react";
import { useItemStore } from "@/hooks/useItemStore";
import EditItemDialog from "./EditItemDialog";
import type { CustomItem } from "@/hooks/useItemStore";

interface SelectedCalcItem extends CalcItem {
  quantity: number;
}

const formatMoney = (n: number) => n.toLocaleString("de-CH") + "$";

const MoneyCalculator = () => {
  const { calcItems, deleteItem, updateItem, getItemForEdit } = useItemStore();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedCalcItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);

  // Keep selected prices in sync if user edits an item's price
  const selectedSynced = useMemo(() => {
    return selected
      .map((s) => {
        const fresh = calcItems.find((c) => c.id === s.id);
        if (!fresh) return null;
        return { ...fresh, quantity: s.quantity };
      })
      .filter(Boolean) as SelectedCalcItem[];
  }, [selected, calcItems]);

  const filtered = useMemo(() => {
    if (!search.trim()) return calcItems;
    const q = search.toLowerCase();
    return calcItems.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [search, calcItems]);

  const grouped = useMemo(() => {
    const map = new Map<string, CalcItem[]>();
    filtered.forEach((i) => {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category)!.push(i);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const total = useMemo(
    () => selectedSynced.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [selectedSynced]
  );

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const addItem = (item: CalcItem) => {
    setSelected((prev) =>
      prev.some((s) => s.id === item.id) ? prev : [...prev, { ...item, quantity: 1 }]
    );
  };

  const removeItem = (id: string) =>
    setSelected((prev) => prev.filter((s) => s.id !== id));

  const setQty = (id: string, qty: number) =>
    setSelected((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: Math.max(1, qty) } : s))
    );

  const updateQty = (id: string, delta: number) =>
    setSelected((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s
      )
    );

  const command = `!key 2 money ${total} 1`;

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex gap-4 w-full">
      {/* Item list */}
      <div className={`flex-1 min-w-0 ${panelOpen ? "max-w-[calc(100%-380px)]" : ""}`}>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Gegenstand suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full liquid-input text-foreground pl-12 pr-4 py-3.5 text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-6">
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
                {cat}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => addItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") addItem(item);
                    }}
                    className={`liquid-card liquid-card-hover flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer group ${
                      isSelected(item.id) ? "liquid-card-selected" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-accent text-xs font-mono">
                        {formatMoney(item.price)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(getItemForEdit(item.id));
                        }}
                        className="text-muted-foreground hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                        title="Bearbeiten"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id, item.name);
                          removeItem(item.id);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-muted-foreground group-hover:text-accent transition-colors">
                        {isSelected(item.id) ? (
                          <Check className="w-4 h-4 text-accent" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Keine Einträge gefunden.
          </div>
        )}
      </div>

      {/* Summary panel */}
      {panelOpen && (
        <div className="w-[360px] flex-shrink-0 hidden md:block">
          <div className="liquid-card p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Rechner
              </h2>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedSynced.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-8">
                Wähle Gegenstände um die Summe zu berechnen
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar mb-4">
                  {selectedSynced.map((item) => (
                    <div
                      key={item.id}
                      className="liquid-panel-item flex items-center gap-2 p-2.5 rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-xs font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-accent text-[10px] font-mono">
                          {formatMoney(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="liquid-qty-btn"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              setQty(item.id, 1);
                              return;
                            }
                            const n = parseInt(v, 10);
                            if (!isNaN(n)) setQty(item.id, n);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-16 text-center bg-transparent text-foreground text-xs outline-none liquid-qty-input"
                          min={1}
                        />
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="liquid-qty-btn"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="liquid-code-block p-3 rounded-xl mb-3">
                  <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                    Summe
                  </p>
                  <p className="text-accent text-xl font-bold mb-2">
                    {formatMoney(total)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                    Befehl
                  </p>
                  <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                    {command}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copy}
                    className="flex-1 liquid-copy-btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Befehl kopieren
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelected([])}
                    className="liquid-clear-btn px-3 py-2.5 rounded-xl text-sm transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!panelOpen && selectedSynced.length > 0 && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-6 right-6 liquid-fab flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium z-50"
        >
          <Calculator className="w-4 h-4" />
          {formatMoney(total)}
        </button>
      )}

      {/* Mobile bottom bar */}
      {selectedSynced.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 liquid-card rounded-t-3xl p-4 z-50 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                Summe
              </p>
              <p className="text-accent text-base font-bold">{formatMoney(total)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="liquid-copy-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Kopiert!" : "Kopieren"}
              </button>
              <button
                onClick={() => setSelected([])}
                className="liquid-clear-btn px-3 py-2 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap">
            {command}
          </pre>
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

export default MoneyCalculator;
