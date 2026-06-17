import { supabase } from "@/integrations/supabase/client";
import type { DbfUpload } from "./store";

export async function saveUploadToCloud(upload: DbfUpload) {
  const { error } = await supabase
    .from("dbf_uploads")
    .insert({
      id: upload.id,
      file_name: upload.fileName,
      competencia: upload.competencia,
      record_count: upload.recordCount,
      uploaded_at: upload.uploadedAt,
      production: upload.production,
    });

  if (error) throw error;
}

export async function deleteUploadFromCloud(id: string) {
  const { error } = await supabase
    .from("dbf_uploads")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function loadUploadsFromCloud(): Promise<DbfUpload[]> {
  const { data, error } = await supabase.from("dbf_uploads").select("*");
  if (error) throw error;

  return data.map((row: any) => ({
    id: row.id,
    fileName: row.file_name,
    competencia: row.competencia,
    recordCount: row.record_count,
    uploadedAt: row.uploaded_at,
    production: row.production,
  }));
}