import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const AdminRoute = () => {
  const { user, isLoggedIn } = useAuth();
  
  // 토큰 확인 (localStorage에서)
  const hasAdminToken = !!localStorage.getItem('authToken');

  // 첫 번째 조건: 로그인되지 않았으면서 토큰도 없음
  if (!isLoggedIn && !hasAdminToken) {
    return <Navigate to="/login" replace />;
  }

  // 두 번째 조건: 로그인은 했는데 관리자 권한이 없고, 토큰도 없음
  if (isLoggedIn && user?.role !== 'admin' && !hasAdminToken) {
    return <Navigate to="/" replace />;
  }

  // 토큰이 있거나 로그인해서 관리자이면 OK
  if (hasAdminToken || (isLoggedIn && user?.role === 'admin')) {
    return <Outlet />;
  }

  // 그 외의 경우는 홈으로
  return <Navigate to="/" replace />;
};

export default AdminRoute;
