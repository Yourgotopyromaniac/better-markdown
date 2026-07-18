import React, { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";

import { ErrorBoundary } from "@/lib/errorBoundary";
import { MarkSpinner } from "@/components/ui/mark-spinner";
import { RouteBuilder } from "./routeBuilder";

const MainRouter: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {RouteBuilder.map(({ Element, path, caseSensitive, Layout }) => {
            const page = Layout ? (
              <Layout>
                <Element />
              </Layout>
            ) : (
              <Element />
            );

            return (
              <Route
                key={path}
                path={path}
                caseSensitive={caseSensitive}
                element={<ErrorBoundary key={path}>{page}</ErrorBoundary>}
              />
            );
          })}
        </Routes>
      </Suspense>
    </>
  );
};

export { MainRouter };

const RouteFallback: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <MarkSpinner className="size-10 text-primary" />
  </div>
);

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
