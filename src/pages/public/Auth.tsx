import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">TECH ACADEMIA</span>
        <h1>Connexion</h1>
        {error && <div className="auth-error">{error}</div>}
        <label>Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Mot de passe
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        <div className="auth-links">
          <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          <Link to="/inscription">Créer un compte</Link>
        </div>
      </form>
    </section>
  );
}

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setBusy(true);
    const { error } = await signUp(email, password, fullName);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">TECH ACADEMIA</span>
        <h1>Créer un compte</h1>
        {error && <div className="auth-error">{error}</div>}
        <label>Nom complet
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Mot de passe
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
          {busy ? "Création…" : "Créer mon compte"}
        </button>
        <div className="auth-links">
          <Link to="/connexion">J'ai déjà un compte</Link>
        </div>
      </form>
    </section>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await resetPassword(email);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">TECH ACADEMIA</span>
        <h1>Mot de passe oublié</h1>
        {error && <div className="auth-error">{error}</div>}
        {sent ? (
          <p>Un email de réinitialisation a été envoyé si ce compte existe.</p>
        ) : (
          <>
            <label>Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
              {busy ? "Envoi…" : "Envoyer le lien"}
            </button>
          </>
        )}
        <div className="auth-links">
          <Link to="/connexion">Retour à la connexion</Link>
        </div>
      </form>
    </section>
  );
}
