import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, updateRow } from "../services/db";

interface Quiz { id: string; title: string; pass_percent: number; published: boolean; formation_slug: string | null; }
interface Question { id: string; quiz_id: string; question: string; points: number; explanation: string; }
interface Answer { id: string; question_id: string; answer: string; is_correct: boolean; }

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);
  const [openQuiz, setOpenQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [newQuestion, setNewQuestion] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
    setQuizzes((data ?? []) as Quiz[]);
    const { data: f } = await supabase.from("formations").select("slug, title");
    setFormations(f ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function loadQuestions(quizId: string) {
    const { data: qs } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("position");
    setQuestions((qs ?? []) as Question[]);
    const ids = (qs ?? []).map((q: any) => q.id);
    if (ids.length) {
      const { data: as } = await supabase.from("quiz_answers").select("*").in("question_id", ids).order("position");
      const grouped: Record<string, Answer[]> = {};
      for (const a of (as ?? []) as Answer[]) { grouped[a.question_id] = grouped[a.question_id] || []; grouped[a.question_id].push(a); }
      setAnswers(grouped);
    } else setAnswers({});
  }

  async function saveQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuiz) return;
    try {
      if (editingQuiz.id) await updateRow("quizzes", editingQuiz.id, editingQuiz);
      else await insertRow("quizzes", editingQuiz);
      setEditingQuiz(null); load();
    } catch (err: any) { alert("Erreur : " + err.message); }
  }
  async function deleteQuiz(q: Quiz) {
    if (!confirm(`Supprimer le quiz "${q.title}" ?`)) return;
    await deleteRow("quizzes", q.id); load();
  }
  async function togglePublish(q: Quiz) {
    await updateRow("quizzes", q.id, { published: !q.published }); load();
  }

  async function addQuestion() {
    if (!newQuestion.trim() || !openQuiz) return;
    await insertRow("quiz_questions", { quiz_id: openQuiz.id, question: newQuestion, position: questions.length });
    setNewQuestion(""); loadQuestions(openQuiz.id);
  }
  async function deleteQuestion(q: Question) {
    await deleteRow("quiz_questions", q.id);
    if (openQuiz) loadQuestions(openQuiz.id);
  }
  async function addAnswer(questionId: string) {
    const text = prompt("Texte de la réponse :");
    if (!text) return;
    const correct = confirm("C'est la bonne réponse ?");
    await insertRow("quiz_answers", { question_id: questionId, answer: text, is_correct: correct, position: (answers[questionId]?.length ?? 0) });
    if (openQuiz) loadQuestions(openQuiz.id);
  }
  async function deleteAnswer(a: Answer) {
    await deleteRow("quiz_answers", a.id);
    if (openQuiz) loadQuestions(openQuiz.id);
  }

  if (openQuiz) {
    return (
      <div>
        <div className="admin-toolbar">
          <h1>Quiz — {openQuiz.title}</h1>
          <button className="btn btn-ghost" onClick={() => setOpenQuiz(null)}>← Retour aux quiz</button>
        </div>
        {questions.map((q, i) => (
          <div className="admin-section" key={q.id}>
            <div className="admin-toolbar" style={{ marginBottom: 8 }}>
              <b>Q{i + 1}. {q.question}</b>
              <button className="btn btn-ghost" onClick={() => deleteQuestion(q)}>Supprimer la question</button>
            </div>
            <ul style={{ paddingLeft: 18 }}>
              {(answers[q.id] ?? []).map((a) => (
                <li key={a.id} style={{ marginBottom: 4 }}>
                  {a.answer} {a.is_correct && <span className="admin-badge on">correcte</span>}{" "}
                  <button className="btn btn-ghost" style={{ padding: "2px 8px" }} onClick={() => deleteAnswer(a)}>×</button>
                </li>
              ))}
            </ul>
            <button className="btn btn-outline" onClick={() => addAnswer(q.id)}>+ Ajouter une réponse</button>
          </div>
        ))}
        <div className="admin-section" style={{ display: "flex", gap: 8 }}>
          <input placeholder="Nouvelle question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} style={{ flex: 1, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <button className="btn btn-primary" onClick={addQuestion}>+ Ajouter la question</button>
        </div>
      </div>
    );
  }

  if (editingQuiz) {
    return (
      <div>
        <div className="admin-toolbar"><h1>{editingQuiz.id ? "Modifier le quiz" : "Nouveau quiz"}</h1><button className="btn btn-ghost" onClick={() => setEditingQuiz(null)}>← Annuler</button></div>
        <form className="admin-form" onSubmit={saveQuiz}>
          <label>Titre<input required value={editingQuiz.title || ""} onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })} /></label>
          <label>Formation liée
            <select value={editingQuiz.formation_slug || ""} onChange={(e) => setEditingQuiz({ ...editingQuiz, formation_slug: e.target.value })}>
              <option value="">— Aucune —</option>
              {formations.map((f) => <option key={f.slug} value={f.slug}>{f.title}</option>)}
            </select>
          </label>
          <label>Seuil de réussite (%)<input type="number" min={0} max={100} value={editingQuiz.pass_percent ?? 70} onChange={(e) => setEditingQuiz({ ...editingQuiz, pass_percent: Number(e.target.value) })} /></label>
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar"><h1>Quiz</h1><button className="btn btn-primary" onClick={() => setEditingQuiz({ title: "", pass_percent: 70, formation_slug: "" })}>+ Nouveau quiz</button></div>
      {loading ? <div className="admin-empty">Chargement…</div> : quizzes.length === 0 ? (
        <div className="admin-empty">Aucun quiz pour l'instant.</div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Titre</th><th>Formation</th><th>Seuil</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id}>
                <td>{q.title}</td><td>{q.formation_slug || "—"}</td><td>{q.pass_percent}%</td>
                <td><span className={`admin-badge ${q.published ? "on" : "off"}`}>{q.published ? "Publié" : "Brouillon"}</span></td>
                <td className="admin-actions">
                  <button className="btn btn-outline" onClick={() => { setOpenQuiz(q); loadQuestions(q.id); }}>Questions</button>
                  <button className="btn btn-outline" onClick={() => setEditingQuiz(q)}>Modifier</button>
                  <button className="btn btn-outline" onClick={() => togglePublish(q)}>{q.published ? "Dépublier" : "Publier"}</button>
                  <button className="btn btn-ghost" onClick={() => deleteQuiz(q)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
