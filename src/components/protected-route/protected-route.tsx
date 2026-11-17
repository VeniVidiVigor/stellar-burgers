import { selectIsAuthChecked, selectUser } from '@selectors/user-selectors';
import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { TProtectedRouteProps } from './type';
import type { Location } from 'react-router-dom';

export const ProtectedRoute = ({
  children,
  onlyUnAuth,
}: TProtectedRouteProps): React.JSX.Element => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && user) {
    const from = (location.state as { from?: Location } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
