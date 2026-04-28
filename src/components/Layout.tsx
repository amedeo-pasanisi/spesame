import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background safe-bottom">
      <Outlet />
    </div>
  );
};

export default Layout;
