import { supabase } from "../lib/supabase";

export async function listAll<T = any>(table: string, opts?: { order?: string; ascending?: boolean }) {
  let q = supabase.from(table).select("*");
  if (opts?.order) q = q.order(opts.order, { ascending: opts.ascending ?? true });
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function getOne<T = any>(table: string, match: Record<string, any>) {
  const { data, error } = await supabase.from(table).select("*").match(match).maybeSingle();
  if (error) throw error;
  return data as T | null;
}

export async function insertRow<T = any>(table: string, values: Record<string, any>) {
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data as T;
}

export async function updateRow<T = any>(table: string, id: string, values: Record<string, any>) {
  const { data, error } = await supabase.from(table).update(values).eq("id", id).select().single();
  if (error) throw error;
  return data as T;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
