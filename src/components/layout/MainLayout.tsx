import Header from "./Header";
import Footer from "./Footer";
interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="">{children}</div>
      <Footer />
    </>
  );
};
export default MainLayout;
