import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollTopButton from '../components/ScrollTopButton';
import Loader from '../components/Loader';

export default function PublicLayout() {
  return (
    <div className="page-wraper">
      <Loader />
      <Header />
      <div className="page-content">
        <Outlet />
      </div>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}
