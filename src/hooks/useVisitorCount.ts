import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "nc-visited";

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const increment = async () => {
      const already = sessionStorage.getItem(SESSION_KEY);

      if (!already) {
        // Increment count
        const { data } = await supabase
          .from("visitor_count")
          .select("count")
          .eq("id", 1)
          .single();

        const current = data?.count ?? 0;

        await supabase
          .from("visitor_count")
          .update({ count: current + 1 })
          .eq("id", 1);

        sessionStorage.setItem(SESSION_KEY, "1");
        setCount(current + 1);
      } else {
        // Just read
        const { data } = await supabase
          .from("visitor_count")
          .select("count")
          .eq("id", 1)
          .single();

        setCount(data?.count ?? 0);
      }
    };

    increment();
  }, []);

  return count;
}
