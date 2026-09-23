export type UserRole = "student" | "admin" | "instructor";

export type Formation = {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  cover_image?: string | null;
  thumbnail_image?: string | null;
  level?: string | null;
  duration?: string | null;
  status?: "draft" | "published" | null;
};