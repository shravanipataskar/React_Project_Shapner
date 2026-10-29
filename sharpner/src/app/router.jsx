
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout.jsx';

import AboutPage from '../pages/public/AboutPage.jsx';
import CollaboratePage from '../pages/public/CollaboratePage.jsx';
import CreativeLabPage from '../pages/public/CreativeLabPage.jsx';
import GalleryPage from '../pages/public/GalleryPage.jsx';
import GiveAuditionPage from '../pages/public/GiveAuditionPage.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import JoinCommunityPage from '../pages/public/JoinCommunityPage.jsx';
import JoinDholPathakPage from '../pages/public/JoinDholPathakPage.jsx';
import LegalPage from '../pages/public/LegalPage.jsx';
import ChildAuditionForm from '../pages/public/ChildAuditionForm.jsx';
import ChildSafetyPolicy from '../pages/public/ChildSafetyPolicy.jsx';
import CommunityGuidelines from '../pages/public/CommunityGuidelines.jsx';
import CreativeIdeaSubmission from '../pages/public/CreativeIdeaSubmission.jsx';
import LoginPage from "../pages/public/LoginPage.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import TalentShow from "../pages/admin/TalentShow.jsx";
import TalentShowCreate from "../pages/admin/TalentShowCreate.jsx";
import TalentShowView from "../pages/admin/TalentShowView.jsx";
import TalentShowEdit from "../pages/admin/TalentShowEdit.jsx";
import CreativeIdeasAdmin from "../pages/admin/CreativeIdeasAdmin.jsx";
import CreativeIdeaCreateAdmin from "../pages/admin/CreativeIdeaCreateAdmin.jsx";
import CollaborationsAdmin from "../pages/admin/CollaborationsAdmin.jsx";
import CollaborationCreateAdmin from "../pages/admin/CollaborationCreateAdmin.jsx";
import TicketsAdmin from "../pages/admin/TicketsAdmin.jsx";
import TicketCreateAdmin from "../pages/admin/TicketCreateAdmin.jsx";
import UsersAdmin from "../pages/admin/UsersAdmin.jsx";
import UserCreatePage from "../pages/admin/UserCreatePage.jsx";
import VideoPage from "../pages/admin/VideoPage.jsx";
import AuditionsPage from "../pages/admin/AuditionsPage.jsx";
import AuditionDetailsPage from "../pages/admin/AuditionDetailsPage.jsx";
import EditAuditionPage from "../pages/admin/EditAuditionPage.jsx";
import DholPathakPage from "../pages/admin/DholPathakPage.jsx";
import DholPathakDetailsPage from "../pages/admin/DholPathakDetailsPage.jsx";
import EditDholPathakPage from "../pages/admin/EditDholPathakPage.jsx";
import CreateVideoPage from "../pages/admin/CreateVideoPage.jsx";
import CreateAuditionPage from "../pages/admin/CreateAuditionPage.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/login" element={<LoginPage />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
         <Route path="/admin/talent-show" element={<TalentShow />} />
         <Route path="/admin/talent-shows" element={<TalentShow />} />
         <Route path="/admin/talent-show/inactive" element={<TalentShow />} />
         <Route path="/admin/talent-shows/inactive" element={<TalentShow />} />
         <Route path="/admin/talent-show/create" element={<TalentShowCreate />} />
         <Route path="/admin/talent-shows/create" element={<TalentShowCreate />} />
         <Route path="/admin/talent-show/:id/edit" element={<TalentShowEdit />} />
         <Route path="/admin/talent-show/:id" element={<TalentShowView />} />
         <Route path="/admin/ideas" element={<CreativeIdeasAdmin />} />
         <Route path="/admin/ideas/inactive" element={<CreativeIdeasAdmin />} />
         <Route path="/admin/ideas/create" element={<CreativeIdeaCreateAdmin />} />
         <Route path="/admin/creative-ideas" element={<Navigate to="/admin/ideas" replace />} />
         <Route path="/admin/collaborations" element={<CollaborationsAdmin />} />
         <Route path="/admin/collaborations/inactive" element={<CollaborationsAdmin />} />
         <Route path="/admin/collaborations/create" element={<CollaborationCreateAdmin />} />
         <Route path="/admin/brand-deals" element={<CollaborationsAdmin />} />
         <Route path="/admin/tickets" element={<TicketsAdmin />} />
         <Route path="/admin/tickets/inactive" element={<TicketsAdmin />} />
         <Route path="/admin/tickets/create" element={<TicketCreateAdmin />} />
         <Route path="/admin/users" element={<UsersAdmin />} />
         <Route path="/admin/users/inactive" element={<UsersAdmin />} />
         <Route path="/admin/users/create" element={<UserCreatePage />} />
         <Route path="/admin/videos" element={<VideoPage />} />
         <Route path="/admin/videos/inactive" element={<VideoPage />} />
         <Route path="/admin/auditions" element={<AuditionsPage />}/>
         <Route path="/admin/auditions/inactive" element={<AuditionsPage />}/>
         <Route path="/admin/auditions/:id/edit" element={<EditAuditionPage />}/>
         <Route path="/admin/auditions/:id" element={<AuditionDetailsPage />}/>
         <Route path="/admin/dhol-pathak" element={<DholPathakPage />}/>
         <Route path="/admin/dhol-pathak/inactive" element={<DholPathakPage />}/>
         <Route path="/admin/dhol-pathak/:id/edit" element={<EditDholPathakPage />}/>
         <Route path="/admin/dhol-pathak/:id" element={<DholPathakDetailsPage />}/>
         <Route path="/videos/create" element={<CreateVideoPage />} />
         <Route path="/admin/auditions/create" element={<CreateAuditionPage />}/>

         <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/collaborate" element={<CollaboratePage />} />

          {/* Creative Idea Submission */}
          <Route
            path="/submit-idea"
            element={<CreativeIdeaSubmission />}
          />

          <Route path="/join-community" element={<JoinCommunityPage />} />
          <Route path="/give-audition" element={<ChildAuditionForm />} />
          <Route path="/join-dhol-pathak" element={<JoinDholPathakPage />} />
          <Route path="/creative-lab" element={<CreativeLabPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/legal" element={<LegalPage />} />

          {/* Policy pages */}
          <Route
            path="/child-safety-policy"
            element={<ChildSafetyPolicy />}
          />

          <Route
            path="/community-guidelines"
            element={<CommunityGuidelines />}
          />

          <Route path="/terms-conditions" element={<LegalPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
