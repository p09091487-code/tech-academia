import GenericCrud from "./GenericCrud";
export default function AdminCategories() {
  return <GenericCrud
    table="formation_categories" title="Catégories" order="position"
    columns={["label", "slug", "description"]}
    fields={[
      { name: "label", label: "Nom" }, { name: "slug", label: "Slug (url)" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "icon", label: "Icône (nom lucide, ex: bot, code)" },
      { name: "position", label: "Ordre d'affichage", type: "number" },
    ]}
    emptyValues={{ label: "", slug: "", description: "", icon: "", gradient: "", position: 0 }}
  />;
}
