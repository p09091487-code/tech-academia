import GenericCrud from "./GenericCrud";
export default function AdminTestimonials() {
  return <GenericCrud
    table="testimonials" title="Témoignages" order="position" publishField="published"
    columns={["author_name", "author_role", "published"]}
    fields={[
      { name: "author_name", label: "Nom de la personne" }, { name: "author_role", label: "Rôle / formation suivie" },
      { name: "avatar_url", label: "Photo", type: "image" }, { name: "quote", label: "Témoignage", type: "textarea" },
      { name: "position", label: "Ordre", type: "number" }, { name: "published", label: "Publié", type: "checkbox" },
    ]}
    emptyValues={{ author_name: "", author_role: "", avatar_url: "", quote: "", position: 0, published: true }}
  />;
}
