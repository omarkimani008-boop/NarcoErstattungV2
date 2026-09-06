import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomItem } from "@/hooks/useItemStore";
import { Check, X } from "lucide-react";

interface Props {
  open: boolean;
  item: CustomItem | null;
  onClose: () => void;
  onSave: (patch: {
    name: string;
    keyType: number;
    price?: number;
    category?: string;
  }) => void;
}

const KEY_OPTIONS = [
  { value: 0, label: "!key 0" },
  { value: 1, label: "!key 1" },
  { value: 2, label: "!key 2" },
  { value: 3, label: "!key 3" },
];

const EditItemDialog = ({ open, item, onClose, onSave }: Props) => {
  const [name, setName] = useState("");
  const [keyType, setKeyType] = useState(1);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setKeyType(item.keyType);
      setPrice(item.price?.toString() ?? "");
      setCategory(item.category ?? "");
    }
  }, [item]);

  if (!item) return null;

  const save = () => {
    const p = price.trim() ? parseInt(price, 10) : undefined;
    onSave({
      name: name.trim() || item.name,
      keyType,
      price: p !== undefined && !isNaN(p) ? p : undefined,
      category: category.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ressource bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground text-xs mb-1 block">ID</label>
            <input
              type="text"
              value={item.id}
              disabled
              className="w-full liquid-input text-muted-foreground px-3 py-2 text-sm outline-none font-mono opacity-60"
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs mb-1 block">
              Anzeigename
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full liquid-input text-foreground px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs mb-1 block">Key-Typ</label>
            <div className="flex gap-2">
              {KEY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setKeyType(opt.value)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                    keyType === opt.value ? "liquid-tab-active" : "liquid-tab-inactive"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-muted-foreground text-xs mb-1 block">
                Preis (Rechner)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="optional"
                className="w-full liquid-input text-foreground px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs mb-1 block">
                Kategorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="optional"
                className="w-full liquid-input text-foreground px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="liquid-clear-btn px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <X className="w-3.5 h-3.5" /> Abbrechen
          </button>
          <button
            onClick={save}
            className="liquid-copy-btn px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Speichern
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
