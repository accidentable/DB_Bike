import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const AdminRoute = () => {
  const { user, isLoggedIn } = useAuth();

  // First, check if user is logged in
  if (!isLoggedIn) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in, which is a nicer user experience.
    return <Navigate to="/login" replace />;
  }

  // If logged in, check if the user is an admin
  if (user?.role !== 'admin') {
    // If not an admin, redirect to home page
    return <Navigate to="/" replace />;
  }

  // If user is logged in and is an admin, render the child route content
  return <Outlet />;
};

export default AdminRoute;
