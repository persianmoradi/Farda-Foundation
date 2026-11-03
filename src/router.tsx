import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // Jump straight back to a restored position; html's smooth scrolling would otherwise animate
    // through the whole page on every back navigation.
    scrollRestorationBehavior: "instant",
    defaultViewTransition: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
