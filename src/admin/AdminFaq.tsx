import GenericCrud from "./GenericCrud";
export default function AdminFaq() {
  return <GenericCrud
    table="faqs" title="FAQ" order="position" publishField="published"
    columns={["question", "category", "published"]}
    fields={[
      { name: "question", label: "Question" }, { name: "answer", label: "Réponse", type: "textarea" },
      { name: "category", label: "Catégorie" }, { name: "position", label: "Ordre", type: "number" },
      { name: "published", label: "Publiée", type: "checkbox" },
    ]}
    emptyValues={{ question: "", answer: "", category: "", position: 0, published: true }}
  />;
}
