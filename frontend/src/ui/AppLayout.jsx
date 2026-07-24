import Header from './Header';
import Footer from './Footer';
import CartOverview from '../features/cart/CartOverview';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import Loader from './Loader';

function AppLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state === 'loading';
  const isFullWidthPage = ['/', '/menu', '/comunidad'].includes(location.pathname);
  //console.log(navigation)

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto]">
      {isLoading && <Loader />}

      <Header />
      <div className="overflow-y-auto overflow-x-hidden">
        <main className={isFullWidthPage ? 'w-full' : 'mx-auto w-full max-w-6xl'}>
          <Outlet />
        </main>
        <Footer />
      </div>

      <CartOverview />
    </div>
  );
}

export default AppLayout;
