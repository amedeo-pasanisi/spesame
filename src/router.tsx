import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import ErrorPage from "./pages/ErrorPage";
import Index from "./pages/Index";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
      }
    ],
  },
]);

export default router;
