import GenericCrud from "./GenericCrud";
export default function AdminInstructors() {
  return <GenericCrud
    table="instructors" title="Formateurs"
    columns={["full_name", "role_title", "bio"]}
    fields={[
      { name: "full_name", label: "Nom complet" }, { name: "role_title", label: "Titre / rôle" },
      { name: "bio", label: "Bio", type: "textarea" }, { name: "avatar_url", label: "Photo", type: "image" },
    ]}
    emptyValues={{ full_name: "", role_title: "", bio: "", avatar_url: "" }}
  />;
}
