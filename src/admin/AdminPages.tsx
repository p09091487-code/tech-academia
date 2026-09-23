import GenericCrud from "./GenericCrud";
export default function AdminPages() {
  return <GenericCrud
    table="site_pages" title="Pages institutionnelles"
    columns={["slug", "title"]}
    fields={[
      { name: "slug", label: "Slug (a-propos, contact, conditions, confidentialite, mentions-legales)" },
      { name: "title", label: "Titre" }, { name: "content", label: "Contenu", type: "textarea" },
      { name: "seo_title", label: "Titre SEO" }, { name: "seo_description", label: "Description SEO", type: "textarea" },
    ]}
    emptyValues={{ slug: "", title: "", content: "", seo_title: "", seo_description: "" }}
  />;
}
