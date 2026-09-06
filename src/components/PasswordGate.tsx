import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("nc_unlocked") === "1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-password", {
        body: { password },
      });
      if (!fnError && data?.ok) {
        sessionStorage.setItem("nc_unlocked", "1");
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => setError(false), 1500);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 1500);
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="liquid-card p-8 w-full max-w-sm text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-accent" />
          </div>
        </div>
        <h1 className="text-xl font-bold liquid-glow-text">Zugang erforderlich</h1>
        <p className="text-muted-foreground text-sm">Bitte Passwort eingeben</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          className={`w-full liquid-input text-foreground pl-4 pr-4 py-3 text-base outline-none placeholder:text-muted-foreground ${error ? "border-destructive" : ""}`}
          autoFocus
        />
        {error && <p className="text-destructive text-xs">Falsches Passwort</p>}
        <button type="submit" disabled={loading} className="w-full liquid-copy-btn py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "Prüfe..." : "Entsperren"}
        </button>
      </form>
    </div>
  );
};

export default PasswordGate;
