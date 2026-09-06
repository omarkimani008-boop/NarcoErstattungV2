import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

const getRedirectUri = () => `${window.location.origin}${window.location.pathname}`;

const DiscordGate = ({ children }: { children: React.ReactNode }) => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("nc_unlocked") === "1");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code || unlocked) return;

    window.history.replaceState({}, "", window.location.pathname);
    setChecking(true);

    supabase.functions
      .invoke("discord-auth", { body: { code, redirectUri: getRedirectUri() } })
      .then(({ data, error: fnError }) => {
        if (!fnError && data?.ok) {
          sessionStorage.setItem("nc_unlocked", "1");
          setUnlocked(true);
        } else {
          setError("Dieser Discord-Account ist nicht freigeschaltet.");
        }
      })
      .catch(() => setError("Anmeldung fehlgeschlagen."))
      .finally(() => setChecking(false));
  }, [unlocked]);

  const handleLogin = () => {
    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", DISCORD_CLIENT_ID);
    url.searchParams.set("redirect_uri", getRedirectUri());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify");
    window.location.href = url.toString();
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="liquid-card p-8 w-full max-w-sm text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-accent" />
          </div>
        </div>
        <h1 className="text-xl font-bold liquid-glow-text">Zugang erforderlich</h1>
        <p className="text-muted-foreground text-sm">
          Nur freigeschaltete Discord-Accounts erhalten Zugriff.
        </p>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={checking}
          className="w-full liquid-copy-btn py-3 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {checking ? "Prüfe..." : "Mit Discord anmelden"}
        </button>
      </div>
    </div>
  );
};

export default DiscordGate;
