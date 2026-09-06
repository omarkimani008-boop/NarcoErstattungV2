import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { items as builtInItems } from "@/data/items";
import { calculatorItems, CalcItem } from "@/data/calculatorItems";
import { supabase } from "@/integrations/supabase/client";

export interface CustomItem {
  id: string;
  name: string;
  keyType: number;
  price?: number;
  category?: string;
}

export interface ItemOverride {
  name?: string;
  keyType?: number;
  price?: number;
  category?: string;
}

export interface TrashEntry {
  kind: "custom" | "builtin";
  id: string;
  name: string;
  snapshot?: CustomItem;
}

export interface BundleLine {
  keyType: number;
  resourceId: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  lines: BundleLine[];
}

export interface DisplayItem {
  id: string;
  name: string;
  isBundle?: boolean;
}

const CUSTOM_KEY = "nc-custom-items";
const OVERRIDES_KEY = "nc-item-overrides";
const HIDDEN_KEY = "nc-hidden-ids";
const TRASH_KEY = "nc-trash";
const BUNDLES_KEY = "nc-bundles";

const ZERO_KEY_IDS = new Set(["burrito", "burrito_a", "carrot_car"]);

const STATIC_BUNDLES: Record<string, string[]> = {
  volle_aufsaetze: ["suppressor", "flashlight", "scope", "clip_extended", "grip"],
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface ItemStoreValue {
  loading: boolean;
  customItems: CustomItem[];
  overrides: Record<string, ItemOverride>;
  trash: TrashEntry[];
  bundles: Bundle[];
  displayItems: DisplayItem[];
  calcItems: CalcItem[];
  isCustom: (id: string) => boolean;
  isBundle: (id: string) => boolean;
  isOverridden: (id: string) => boolean;
  getKeyNum: (id: string) => number;
  buildLines: (id: string, quantity: number) => string[];
  getItemForEdit: (id: string) => CustomItem | null;
  addCustomItem: (item: CustomItem) => void;
  updateItem: (
    id: string,
    patch: { name?: string; keyType?: number; price?: number; category?: string }
  ) => void;
  resetOverride: (id: string) => void;
  deleteItem: (id: string, displayName: string) => void;
  restoreFromTrash: (entry: TrashEntry) => void;
  removeFromTrash: (id: string) => void;
  clearTrash: () => void;
  saveBundle: (bundle: Bundle) => void;
  deleteBundle: (id: string) => void;
  refresh: () => void;
}

const ItemStoreContext = createContext<ItemStoreValue | null>(null);

async function fetchState() {
  const { data, error } = await supabase.from("app_state").select("key,value");
  if (error) throw error;
  const map: Record<string, unknown> = {};
  (data ?? []).forEach((row: { key: string; value: unknown }) => {
    map[row.key] = row.value;
  });
  return map;
}

async function persist(key: string, value: unknown) {
  await supabase
    .from("app_state")
    .upsert({ key, value: value as never }, { onConflict: "key" });
}

export const ItemStoreProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ItemOverride>>({});
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [trash, setTrash] = useState<TrashEntry[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const ready = useRef(false);

  const loadAll = useCallback(async () => {
    try {
      const state = await fetchState();
      const isEmpty = Object.keys(state).length === 0;

      if (isEmpty) {
        // one-time migration of locally stored data into the shared database
        const localCustom = loadLocal<CustomItem[]>(CUSTOM_KEY, []);
        const localOverrides = loadLocal<Record<string, ItemOverride>>(OVERRIDES_KEY, {});
        const localHidden = loadLocal<string[]>(HIDDEN_KEY, []);
        const localTrash = loadLocal<TrashEntry[]>(TRASH_KEY, []);
        const localBundles = loadLocal<Bundle[]>(BUNDLES_KEY, []);
        setCustomItems(localCustom);
        setOverrides(localOverrides);
        setHiddenIds(localHidden);
        setTrash(localTrash);
        setBundles(localBundles);
        await Promise.all([
          persist(CUSTOM_KEY, localCustom),
          persist(OVERRIDES_KEY, localOverrides),
          persist(HIDDEN_KEY, localHidden),
          persist(TRASH_KEY, localTrash),
          persist(BUNDLES_KEY, localBundles),
        ]);
      } else {
        setCustomItems((state[CUSTOM_KEY] as CustomItem[]) ?? []);
        setOverrides((state[OVERRIDES_KEY] as Record<string, ItemOverride>) ?? {});
        setHiddenIds((state[HIDDEN_KEY] as string[]) ?? []);
        setTrash((state[TRASH_KEY] as TrashEntry[]) ?? []);
        setBundles((state[BUNDLES_KEY] as Bundle[]) ?? []);
      }
    } catch {
      // fall back to local data if the database is unreachable
      setCustomItems(loadLocal<CustomItem[]>(CUSTOM_KEY, []));
      setOverrides(loadLocal<Record<string, ItemOverride>>(OVERRIDES_KEY, {}));
      setHiddenIds(loadLocal<string[]>(HIDDEN_KEY, []));
      setTrash(loadLocal<TrashEntry[]>(TRASH_KEY, []));
      setBundles(loadLocal<Bundle[]>(BUNDLES_KEY, []));
    } finally {
      ready.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // sync every change back to the shared database (and keep a local cache)
  useEffect(() => {
    if (!ready.current) return;
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customItems));
    persist(CUSTOM_KEY, customItems);
  }, [customItems]);
  useEffect(() => {
    if (!ready.current) return;
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    persist(OVERRIDES_KEY, overrides);
  }, [overrides]);
  useEffect(() => {
    if (!ready.current) return;
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hiddenIds));
    persist(HIDDEN_KEY, hiddenIds);
  }, [hiddenIds]);
  useEffect(() => {
    if (!ready.current) return;
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
    persist(TRASH_KEY, trash);
  }, [trash]);
  useEffect(() => {
    if (!ready.current) return;
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
    persist(BUNDLES_KEY, bundles);
  }, [bundles]);

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);
  const customMap = useMemo(
    () => new Map(customItems.map((c) => [c.id, c])),
    [customItems]
  );
  const bundleMap = useMemo(() => new Map(bundles.map((b) => [b.id, b])), [bundles]);

  const displayItems = useMemo<DisplayItem[]>(() => {
    const built = builtInItems
      .filter((i) => !hiddenSet.has(i.id))
      .map((i) => ({ id: i.id, name: overrides[i.id]?.name ?? i.name }));
    const custom = customItems
      .filter((c) => !hiddenSet.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
    const bundleItems = bundles
      .filter((b) => !hiddenSet.has(b.id))
      .map((b) => ({ id: b.id, name: b.name, isBundle: true }));
    return [...bundleItems, ...built, ...custom];
  }, [hiddenSet, overrides, customItems, bundles]);

  const calcItems = useMemo<CalcItem[]>(() => {
    const built = calculatorItems
      .filter((i) => !hiddenSet.has(i.id))
      .map((i) => {
        const o = overrides[i.id];
        return {
          ...i,
          name: o?.name ?? i.name,
          price: o?.price ?? i.price,
          category: o?.category ?? i.category,
        };
      });
    const customCalc: CalcItem[] = customItems
      .filter((c) => !hiddenSet.has(c.id) && typeof c.price === "number")
      .map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price as number,
        category: c.category?.trim() || "Eigene",
      }));
    return [...built, ...customCalc];
  }, [hiddenSet, overrides, customItems]);

  const isCustom = useCallback((id: string) => customMap.has(id), [customMap]);
  const isBundle = useCallback(
    (id: string) => bundleMap.has(id) || !!STATIC_BUNDLES[id],
    [bundleMap]
  );
  const isOverridden = useCallback((id: string) => !!overrides[id], [overrides]);

  const getKeyNum = useCallback(
    (id: string): number => {
      const c = customMap.get(id);
      if (c) return c.keyType;
      const o = overrides[id];
      if (o?.keyType !== undefined) return o.keyType;
      if (ZERO_KEY_IDS.has(id)) return 0;
      return 1;
    },
    [customMap, overrides]
  );

  const buildLines = useCallback(
    (id: string, quantity: number): string[] => {
      const b = bundleMap.get(id);
      if (b) {
        return b.lines.map(
          (l) => `!key ${l.keyType} ${l.resourceId} ${l.quantity * quantity} 1`
        );
      }
      const staticBundle = STATIC_BUNDLES[id];
      if (staticBundle) {
        return staticBundle.map(
          (bid) => `!key ${getKeyNum(bid)} ${bid} ${quantity} 1`
        );
      }
      return [`!key ${getKeyNum(id)} ${id} ${quantity} 1`];
    },
    [bundleMap, getKeyNum]
  );

  const getItemForEdit = useCallback(
    (id: string): CustomItem | null => {
      const c = customMap.get(id);
      if (c) return c;
      const built = builtInItems.find((i) => i.id === id);
      const calc = calculatorItems.find((i) => i.id === id);
      if (!built && !calc) return null;
      const o = overrides[id] ?? {};
      return {
        id,
        name: o.name ?? built?.name ?? calc?.name ?? id,
        keyType: o.keyType ?? (ZERO_KEY_IDS.has(id) ? 0 : 1),
        price: o.price ?? calc?.price,
        category: o.category ?? calc?.category,
      };
    },
    [customMap, overrides]
  );

  const addCustomItem = useCallback((item: CustomItem) => {
    setCustomItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev : [...prev, item]
    );
    setHiddenIds((prev) => prev.filter((id) => id !== item.id));
  }, []);

  const updateItem = useCallback<ItemStoreValue["updateItem"]>(
    (id, patch) => {
      if (bundleMap.has(id)) {
        if (patch.name !== undefined) {
          setBundles((prev) =>
            prev.map((b) => (b.id === id ? { ...b, name: patch.name as string } : b))
          );
        }
        return;
      }
      if (customMap.has(id)) {
        setCustomItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...(patch.name !== undefined ? { name: patch.name } : {}),
                  ...(patch.keyType !== undefined ? { keyType: patch.keyType } : {}),
                  ...("price" in patch ? { price: patch.price } : {}),
                  ...("category" in patch ? { category: patch.category } : {}),
                }
              : i
          )
        );
      } else {
        setOverrides((prev) => {
          const cur = prev[id] ?? {};
          const next: ItemOverride = { ...cur };
          if (patch.name !== undefined) next.name = patch.name;
          if (patch.keyType !== undefined) next.keyType = patch.keyType;
          if ("price" in patch) next.price = patch.price;
          if ("category" in patch) next.category = patch.category;
          return { ...prev, [id]: next };
        });
      }
    },
    [customMap, bundleMap]
  );

  const resetOverride = useCallback((id: string) => {
    setOverrides((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const deleteItem = useCallback<ItemStoreValue["deleteItem"]>(
    (id, displayName) => {
      if (bundleMap.has(id)) {
        setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setTrash((prev) =>
          [
            { kind: "builtin" as const, id, name: displayName },
            ...prev.filter((t) => t.id !== id),
          ].slice(0, 100)
        );
        return;
      }
      if (customMap.has(id)) {
        const snap = customMap.get(id)!;
        setTrash((prev) =>
          [
            { kind: "custom" as const, id, name: snap.name, snapshot: snap },
            ...prev.filter((t) => t.id !== id),
          ].slice(0, 100)
        );
        setCustomItems((prev) => prev.filter((c) => c.id !== id));
      } else {
        setTrash((prev) =>
          [
            { kind: "builtin" as const, id, name: displayName },
            ...prev.filter((t) => t.id !== id),
          ].slice(0, 100)
        );
        setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
    },
    [customMap, bundleMap]
  );

  const restoreFromTrash = useCallback<ItemStoreValue["restoreFromTrash"]>((entry) => {
    if (entry.kind === "custom" && entry.snapshot) {
      setCustomItems((prev) =>
        prev.some((i) => i.id === entry.id) ? prev : [...prev, entry.snapshot!]
      );
    }
    setHiddenIds((prev) => prev.filter((id) => id !== entry.id));
    setTrash((prev) => prev.filter((t) => t.id !== entry.id));
  }, []);

  const removeFromTrash = useCallback(
    (id: string) => setTrash((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const clearTrash = useCallback(() => setTrash([]), []);

  const saveBundle = useCallback((bundle: Bundle) => {
    setBundles((prev) => {
      const exists = prev.some((b) => b.id === bundle.id);
      return exists ? prev.map((b) => (b.id === bundle.id ? bundle : b)) : [...prev, bundle];
    });
    setHiddenIds((prev) => prev.filter((id) => id !== bundle.id));
  }, []);

  const deleteBundle = useCallback((id: string) => {
    setBundles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const value: ItemStoreValue = {
    loading,
    customItems,
    overrides,
    trash,
    bundles,
    displayItems,
    calcItems,
    isCustom,
    isBundle,
    isOverridden,
    getKeyNum,
    buildLines,
    getItemForEdit,
    addCustomItem,
    updateItem,
    resetOverride,
    deleteItem,
    restoreFromTrash,
    removeFromTrash,
    clearTrash,
    saveBundle,
    deleteBundle,
    refresh: loadAll,
  };

  return (
    <ItemStoreContext.Provider value={value}>{children}</ItemStoreContext.Provider>
  );
};

export const useItemStore = (): ItemStoreValue => {
  const ctx = useContext(ItemStoreContext);
  if (!ctx) throw new Error("useItemStore must be used within ItemStoreProvider");
  return ctx;
};
