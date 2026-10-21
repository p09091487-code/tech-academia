import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => {
    const { data: q } = await supabase.from("quizzes").select("*").eq("id", quizId).maybeSingle();
    setQuiz(q);
    const { data: qs } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("position");
    setQuestions(qs ?? []);
    const ids = (qs ?? []).map((x: any) => x.id);
    if (ids.length) {
      const { data: as } = await supabase.rpc("get_quiz_answers", { p_quiz_id: quizId });
      const grouped: Record<string, any[]> = {};
      for (const a of as ?? []) { grouped[a.question_id] = grouped[a.question_id] || []; grouped[a.question_id].push(a); }
      setAnswers(grouped);
    }
    setLoading(false);
  })(); }, [quizId]);

  async function submit() {
    setError(null);
    if (!user) { setError("Connecte-toi pour valider le quiz."); return; }
    // Grading is done server-side (submit_quiz) so results cannot be forged from the browser.
    const { data, error: rpcError } = await supabase.rpc("submit_quiz", { p_quiz_id: quizId, p_answers: selected });
    if (rpcError || !data) { setError("Impossible d'enregistrer ton résultat. Réessaie dans un instant."); return; }
    setResult({ score: data.score, total: data.total, passed: data.passed });
  }

  if (loading) return <PublicLayout><div className="admin-empty">Chargement…</div></PublicLayout>;
  if (!quiz) return <PublicLayout><section className="page"><h1>Quiz introuvable</h1></section></PublicLayout>;

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">{quiz.kind === "module" ? "QUIZ DU MODULE" : "ÉVALUATION FINALE"}</span>
        <h1>{quiz.title}</h1>
        {result ? (
          <div className="buy-box" style={{ maxWidth: 480 }}>
            <p style={{ fontSize: 22, fontWeight: 700 }}>{result.passed ? "✅ Réussi" : "❌ Non validé"}</p>
            <p>Score : {result.score} / {result.total} — {Math.round((result.score / result.total) * 100)}%</p>
            <Link className="btn btn-outline" to="/dashboard">Retour au dashboard</Link>
          </div>
        ) : (
          <>
            {questions.map((q, i) => (
              <div key={q.id} className="admin-section">
                <b>{i + 1}. {q.question}</b>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {(answers[q.id] ?? []).map((a) => (
                    <label key={a.id} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
                      <input type="radio" name={q.id} checked={selected[q.id] === a.id} onChange={() => setSelected({ ...selected, [q.id]: a.id })} />
                      {a.answer}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {questions.length === 0 ? <p>Ce quiz n'a pas encore de questions.</p> : (
              <>{error && <p style={{ color: "#fca5a5" }}>{error}</p>}<button className="btn btn-primary btn-lg" onClick={submit}>Valider mes réponses</button></>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
