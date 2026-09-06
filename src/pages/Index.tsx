import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Copy,
  Check,
  Plus,
  Minus,
  Trash2,
  ClipboardList,
  Zap,
  X,
  Settings2,
  Eye,
  Calculator,
  Pencil,
} from "lucide-react";
import { useVisitorCount } from "@/hooks/useVisitorCount";
import CustomItemManager from "@/components/CustomItemManager";
import MoneyCalculator from "@/components/MoneyCalculator";
import EditItemDialog from "@/components/EditItemDialog";
import {
  ItemStoreProvider,
  useItemStore,
  CustomItem,
} from "@/hooks/useItemStore";

interface SelectedItem {
  id: string;
  name: string;
  quantity: number;
}

const IndexInner = () => {
  const {
    displayItems,
    deleteItem,
    updateItem,
    getItemForEdit,
    customItems,
    isBundle,
    buildLines,
  } = useItemStore();


  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"quick" | "multi" | "calc" | "custom">(
    "quick"
  );
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return displayItems;
    const q = search.toLowerCase();
    return displayItems.filter(
      (i) => i.id.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
    );
  }, [search, displayItems]);

  const handleCopy = useCallback(
    (id: string) => {
      const text = isBundle(id) ? buildLines(id, 1).join("\n\n") : id;
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    },
    [isBundle, buildLines]
  );



  const addItem = useCallback((id: string, name: string) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev;
      return [...prev, { id, name, quantity: 1 }];
    });
  }, []);

  const removeSelected = useCallback((id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    );
  }, []);

  const setQuantity = useCallback((id: string, val: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, val) } : i))
    );
  }, []);

  const buildCommands = () =>
    selectedItems.flatMap((i) => buildLines(i.id, i.quantity)).join("\n");



  const copyAll = () => {
    navigator.clipboard.writeText(buildCommands());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const isSelected = (id: string) => selectedItems.some((i) => i.id === id);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      deleteItem(id, name);
      removeSelected(id);
    },
    [deleteItem, removeSelected]
  );

  const visitorCount = useVisitorCount();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl md:text-4xl font-bold liquid-glow-text mb-1 tracking-tight">
          Narco City Rückerstattungsverwaltung
        </h1>
        <p className="text-muted-foreground text-sm">
          Ressourcen-Namen schnell finden und verwalten
        </p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-2 px-4 mb-5 flex-wrap">
        <button
          onClick={() => setActiveTab("quick")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
            activeTab === "quick" ? "liquid-tab-active" : "liquid-tab-inactive"
          }`}
        >
          <Zap className="w-4 h-4" />
          Schnellkopie
        </button>
        <button
          onClick={() => setActiveTab("multi")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
            activeTab === "multi" ? "liquid-tab-active" : "liquid-tab-inactive"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Mehrfachauswahl
          {selectedItems.length > 0 && (
            <span className="ml-1 bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full">
              {selectedItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("calc")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
            activeTab === "calc" ? "liquid-tab-active" : "liquid-tab-inactive"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Rechner
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
            activeTab === "custom" ? "liquid-tab-active" : "liquid-tab-inactive"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Eigene Ressourcen
          {customItems.length > 0 && (
            <span className="ml-1 bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full">
              {customItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 px-4 md:px-8 max-w-[1600px] mx-auto w-full pb-8">
        {activeTab === "custom" ? (
          <div className="flex-1 min-w-0">
            <CustomItemManager />
          </div>
        ) : activeTab === "calc" ? (
          <MoneyCalculator />
        ) : (
          <>
            {/* Left: Item list */}
            <div
              className={`flex-1 min-w-0 ${
                activeTab === "multi" && panelOpen ? "max-w-[calc(100%-380px)]" : ""
              }`}
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Suche nach ID oder Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full liquid-input text-foreground pl-12 pr-4 py-3.5 text-base outline-none placeholder:text-muted-foreground"
                />
              </div>

              <p className="text-muted-foreground text-xs mb-3 px-1">
                {filtered.length} von {displayItems.length} Einträgen
              </p>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      activeTab === "quick"
                        ? handleCopy(item.id)
                        : addItem(item.id, item.name)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        activeTab === "quick"
                          ? handleCopy(item.id)
                          : addItem(item.id, item.name);
                      }
                    }}
                    className={`liquid-card liquid-card-hover flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer group ${
                      copiedId === item.id ? "copied-flash" : ""
                    } ${
                      activeTab === "multi" && isSelected(item.id)
                        ? "liquid-card-selected"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs truncate font-mono">
                        {item.id}
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
                          handleDelete(item.id, item.name);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-muted-foreground group-hover:text-accent transition-colors">
                        {activeTab === "quick" ? (
                          copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )
                        ) : isSelected(item.id) ? (
                          <Check className="w-4 h-4 text-accent" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </span>
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

            {/* Right: Command panel (multi mode) */}
            {activeTab === "multi" && panelOpen && (
              <div className="w-[360px] flex-shrink-0 hidden md:block">
                <div className="liquid-card p-4 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-foreground font-semibold text-sm">
                      Ausgewählte Ressourcen
                    </h2>
                    <button
                      onClick={() => setPanelOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedItems.length === 0 ? (
                    <p className="text-muted-foreground text-xs text-center py-8">
                      Klicke auf Items um sie hinzuzufügen
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar mb-4">
                        {selectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="liquid-panel-item flex items-center gap-2 p-2.5 rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-xs font-medium truncate">
                                {item.name}
                              </p>
                              <p className="text-muted-foreground text-[10px] font-mono truncate">
                                {item.id}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
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
                                    setQuantity(item.id, 1);
                                    return;
                                  }
                                  const n = parseInt(v, 10);
                                  if (!isNaN(n)) setQuantity(item.id, n);
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-16 text-center bg-transparent text-foreground text-xs outline-none liquid-qty-input"
                                min={1}
                              />
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="liquid-qty-btn"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeSelected(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Command preview */}
                      <div className="liquid-code-block p-3 rounded-xl mb-3">
                        <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                          Vorschau
                        </p>
                        <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                          {buildCommands()}
                        </pre>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={copyAll}
                          className="flex-1 liquid-copy-btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                        >
                          {copiedAll ? (
                            <>
                              <Check className="w-4 h-4" /> Kopiert!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Alles kopieren
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedItems([])}
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
          </>
        )}

        {/* Floating panel toggle for multi mode when panel is closed */}
        {activeTab === "multi" && !panelOpen && selectedItems.length > 0 && (
          <button
            onClick={() => setPanelOpen(true)}
            className="fixed bottom-6 right-6 liquid-fab flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium z-50"
          >
            <ClipboardList className="w-4 h-4" />
            {selectedItems.length} ausgewählt
          </button>
        )}

        {/* Mobile bottom sheet for multi mode */}
        {activeTab === "multi" && selectedItems.length > 0 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 liquid-card rounded-t-3xl p-4 z-50 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-foreground text-sm font-semibold">
                {selectedItems.length} ausgewählt
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyAll}
                  className="liquid-copy-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                >
                  {copiedAll ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedAll ? "Kopiert!" : "Kopieren"}
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="liquid-clear-btn px-3 py-2 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
              {buildCommands()}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 space-y-2">
        {visitorCount !== null && (
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>{visitorCount} Besucher</span>
          </div>
        )}
        <p className="text-muted-foreground text-xs">
          Erstellt von{" "}
          <span className="liquid-glow-text font-medium">NC Marjanovic</span>
        </p>
      </footer>

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

const Index = () => (
  <ItemStoreProvider>
    <IndexInner />
  </ItemStoreProvider>
);

export default Index;
