// @ts-nocheck
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AdminRoutes from './routes/AdminRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AdminRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
