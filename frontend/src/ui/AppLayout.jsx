import Header from './Header';
import Footer from './Footer';
import CartOverview from '../features/cart/CartOverview';
import { Outlet, useNavigation } from 'react-router-dom';
import Loader from './Loader';

function AppLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  //console.log(navigation)

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto]">
      {isLoading && <Loader />}

      <Header />
      <div className="overflow-y-auto overflow-x-hidden">
        <main className="mx-auto w-full max-w-6xl">
          <Outlet />
        </main>
        <Footer />
      </div>

      <CartOverview />
    </div>
  );
}

export default AppLayout;
