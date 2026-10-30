import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/authContext.js";
import {
  hasAdminAccess,
  hasSuperAdminAccess,
} from "../../utils/userTypes.js";

const statisticSections = [
{
title: "👥 Users",
columns: 3,
cards: [
{ label: "TOTAL USERS", value: "3" },
{ label: "ACTIVE USERS", value: "2" },
{ label: "INACTIVE USERS", value: "1" },
],
},
{
title: "🎬 Videos & Shorts",
columns: 3,
cards: [
{ label: "TOTAL VIDEOS", value: "4" },
{ label: "TOTAL SHORTS", value: "4" },
{ label: "ACTIVE CONTENT", value: "6" },
],
},
{
title: "📝 Submissions",
columns: 4,
cards: [
{ label: "CHILD AUDITIONS", value: "42" },
{ label: "DHOL PATHAK", value: "3072" },
{ label: "TALENT SHOWS", value: "7" },
{ label: "CREATIVE IDEAS", value: "20" },
{ label: "BRAND DEALS", value: "29" },
],
},
];

export default function Dashboard() {
  const { user } = useAuth();
  const canAccessAdminFeatures = hasAdminAccess(user);
  const isSuperAdmin = hasSuperAdminAccess(user);

  return (
    <AdminLayout pageClass="dashboard-page">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>
            <span>📊</span>
            {canAccessAdminFeatures ? "Admin Dashboard" : "Dashboard"}
          </h1>
        </header>

        {statisticSections
          .filter((section) => isSuperAdmin || !section.title.includes("Users"))
          .map((section) => (
            <section className="dashboard-section" key={section.title}>
              <div className="dashboard-section-heading">
                <h2>{section.title}</h2>
              </div>

              <div
                className={`dashboard-stat-grid ${
                  section.columns === 3 ? 'dashboard-grid-3' : 'dashboard-grid-4'
                }`}
              >
                {section.cards.map((card) => (
                  <article className="dashboard-stat-card" key={card.label}>
                    <h3>{card.label}</h3>
                    <p>{card.value}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}

        {canAccessAdminFeatures && (
          <section className="dashboard-section dashboard-quick-section">
            <div className="dashboard-section-heading">
              <h2>⚡ Quick Actions</h2>
            </div>

            <div className="dashboard-quick-actions">
              <Link
                to="/admin/videos"
                className="dashboard-action dashboard-action-blue"
              >
                🎬 Manage Videos
              </Link>

              <Link
                to="/videos/create"
                className="dashboard-action dashboard-action-gray"
              >
                ➕ Add New Video
              </Link>

              {isSuperAdmin && (
                <Link
                  to="/admin/videos/inactive"
                  className="dashboard-action dashboard-action-yellow"
                >
                  ▣ Inactive Content
                </Link>
              )}
            </div>
          </section>
        )}
      </main>
    </AdminLayout>
  )
}
