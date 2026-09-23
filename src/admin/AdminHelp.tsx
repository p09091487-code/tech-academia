import GenericCrud from "./GenericCrud";
export default function AdminHelp() {
  return <GenericCrud
    table="help_articles" title="Centre d'aide" order="position" publishField="published"
    columns={["title", "category", "published"]}
    fields={[
      { name: "title", label: "Titre" }, { name: "slug", label: "Slug (url)" },
      { name: "content", label: "Contenu", type: "textarea" }, { name: "category", label: "Catégorie" },
      { name: "position", label: "Ordre", type: "number" }, { name: "published", label: "Publié", type: "checkbox" },
    ]}
    emptyValues={{ title: "", slug: "", content: "", category: "", position: 0, published: true }}
  />;
}
