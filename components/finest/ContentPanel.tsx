"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SettingRow = {
  key: string;
  value: string;
};

const defaultKeys: SettingRow[] = [
  { key: "hero_title", value: "Find Your Perfect Home Away From Home" },
  { key: "hero_subtitle", value: "Experience the beauty of Malaysian hospitality with our handpicked collection." },
  { key: "about_tagline", value: "Your home away from home in the heart of Malaysia." },
  { key: "cta_button", value: "Reserve Your Stay" },
];

export function ContentPanel() {
  const [settings, setSettings] = useState<SettingRow[]>(defaultKeys);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setLoading(true);
      setError(null);

      const { data, error: selectError } = await supabase
        .from("site_settings")
        .select("key,value")
        .order("key", { ascending: true });

      if (selectError) {
        console.warn("site_settings not available yet:", selectError.message);
        setError(
          "The site_settings table is not available yet. Use the SQL snippet in SUPABASE_SETUP.md to create it when you are ready."
        );
      } else if (data && data.length > 0 && isMounted) {
        const merged = defaultKeys.map((def) => {
          const existing = data.find((row) => row.key === def.key);
          return { key: def.key, value: existing?.value ?? def.value };
        });
        setSettings(merged);
      }

      if (isMounted) setLoading(false);
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((current) => current.map((row) => (row.key === key ? { ...row, value } : row)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const { error: upsertError } = await supabase.from("site_settings").upsert(
      settings.map((row) => ({
        key: row.key,
        value: row.value,
      })),
      { onConflict: "key" }
    );

    if (upsertError) {
      setError(`Could not save settings: ${upsertError.message}`);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--text-strong)]">Website Wording</h2>
      <p className="text-xs text-[var(--text-muted)]">
        Adjust the key phrases used on your homepage. When the <code>site_settings</code> table exists in Supabase, the
        public site can be updated to read from these values instead of hard‑coded text.
      </p>

      {loading && <p className="text-xs text-[var(--text-muted)]">Checking for existing settings…</p>}
      {error && <p className="text-xs text-amber-500">{error}</p>}

      <div className="mt-2 grid gap-3 md:grid-cols-2">
        {settings.map((row) => (
          <label key={row.key} className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{row.key.replace(/_/g, ' ')}</span>
            <textarea
              rows={3}
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={row.value}
              onChange={(e) => handleChange(row.key, e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save wording"}
        </button>
        <p className="text-[10px] text-[var(--text-muted)]">
          To wire this in fully, update your homepage components to read from <code>site_settings</code>.
        </p>
      </div>
    </div>
  );
}

