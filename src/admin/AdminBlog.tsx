import GenericCrud from "./GenericCrud";
export default function AdminBlog() {
  return <GenericCrud
    table="blog_posts" title="Blog"
    columns={["title", "category", "status"]}
    fields={[
      { name: "title", label: "Titre" }, { name: "slug", label: "Slug (url)" },
      { name: "excerpt", label: "Extrait", type: "textarea" }, { name: "content", label: "Contenu", type: "textarea" },
      { name: "cover_image", label: "Image de couverture", type: "image" }, { name: "category", label: "Catégorie" },
      { name: "status", label: "Statut", type: "select", options: [{ value: "draft", label: "Brouillon" }, { value: "published", label: "Publié" }] },
    ]}
    emptyValues={{ title: "", slug: "", excerpt: "", content: "", cover_image: "", category: "", status: "draft" }}
  />;
}
