import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./pages/public/Auth";
import Dashboard from "./pages/student/Dashboard";
import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";
import FormationDetail from "./pages/public/FormationDetail";
import { BlogList, BlogPostPage } from "./pages/public/Blog";
import FaqPage from "./pages/public/Faq";
import HelpPage from "./pages/public/Help";
import SitePage from "./pages/public/SitePage";
import CertificateVerify from "./pages/public/CertificateVerify";
import CourseView from "./pages/student/CourseView";
import QuizAttempt from "./pages/student/QuizAttempt";
import ProjectsPage from "./pages/student/ProjectsPage";
import Certificates from "./pages/student/Certificates";
import Favorites from "./pages/student/Favorites";
import InstructorsPage from "./pages/public/Instructors";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminFormations from "./admin/AdminFormations";
import AdminFormationContent from "./admin/AdminFormationContent";
import AdminCategories from "./admin/AdminCategories";
import AdminInstructors from "./admin/AdminInstructors";
import AdminTestimonials from "./admin/AdminTestimonials";
import AdminQuizzes from "./admin/AdminQuizzes";
import AdminProjects from "./admin/AdminProjects";
import AdminStudents from "./admin/AdminStudents";
import AdminCertificates from "./admin/AdminCertificates";
import AdminBlog from "./admin/AdminBlog";
import AdminFaq from "./admin/AdminFaq";
import AdminHelp from "./admin/AdminHelp";
import AdminPages from "./admin/AdminPages";
import AdminSettings from "./admin/AdminSettings";
import AdminNavigation from "./admin/AdminNavigation";
import AdminMedia from "./admin/AdminMedia";

function PublicAuthPage({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formations" element={<Catalog />} />
        <Route path="/formations/:slug" element={<FormationDetail />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/aide" element={<HelpPage />} />
        <Route path="/a-propos" element={<SitePage slug="a-propos" fallbackTitle="À propos de TECH ACADEMIA" />} />
        <Route path="/contact" element={<SitePage slug="contact" fallbackTitle="Contact" />} />
        <Route path="/conditions" element={<SitePage slug="conditions" fallbackTitle="Conditions d'utilisation" />} />
        <Route path="/confidentialite" element={<SitePage slug="confidentialite" fallbackTitle="Politique de confidentialité" />} />
        <Route path="/mentions-legales" element={<SitePage slug="mentions-legales" fallbackTitle="Mentions légales" />} />
        <Route path="/formateurs" element={<InstructorsPage />} />
        <Route path="/verification-certificat/:id" element={<CertificateVerify />} />
        <Route path="/certificats" element={<CertificateVerify />} />

        <Route path="/connexion" element={<PublicAuthPage><LoginPage /></PublicAuthPage>} />
        <Route path="/inscription" element={<PublicAuthPage><RegisterPage /></PublicAuthPage>} />
        <Route path="/mot-de-passe-oublie" element={<PublicAuthPage><ForgotPasswordPage /></PublicAuthPage>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cours/:slug" element={<CourseView />} />
          <Route path="/quiz/:quizId" element={<QuizAttempt />} />
          <Route path="/projets" element={<ProjectsPage />} />
          <Route path="/mes-certificats" element={<Certificates />} />
          <Route path="/mes-favoris" element={<Favorites />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/formations" element={<AdminLayout><AdminFormations /></AdminLayout>} />
          <Route path="/admin/formations/:id" element={<AdminLayout><AdminFormationContent /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
          <Route path="/admin/instructors" element={<AdminLayout><AdminInstructors /></AdminLayout>} />
          <Route path="/admin/testimonials" element={<AdminLayout><AdminTestimonials /></AdminLayout>} />
          <Route path="/admin/quizzes" element={<AdminLayout><AdminQuizzes /></AdminLayout>} />
          <Route path="/admin/projects" element={<AdminLayout><AdminProjects /></AdminLayout>} />
          <Route path="/admin/students" element={<AdminLayout><AdminStudents /></AdminLayout>} />
          <Route path="/admin/certificates" element={<AdminLayout><AdminCertificates /></AdminLayout>} />
          <Route path="/admin/blog" element={<AdminLayout><AdminBlog /></AdminLayout>} />
          <Route path="/admin/faq" element={<AdminLayout><AdminFaq /></AdminLayout>} />
          <Route path="/admin/help" element={<AdminLayout><AdminHelp /></AdminLayout>} />
          <Route path="/admin/pages" element={<AdminLayout><AdminPages /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          <Route path="/admin/navigation" element={<AdminLayout><AdminNavigation /></AdminLayout>} />
          <Route path="/admin/media" element={<AdminLayout><AdminMedia /></AdminLayout>} />
        </Route>

        <Route path="*" element={<SitePage slug="__404" fallbackTitle="Page introuvable" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
