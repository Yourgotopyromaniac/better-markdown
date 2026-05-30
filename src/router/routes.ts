export const Routes = {
  home: "/",
  cheatsheet: "/cheatsheet",
  about: "/about",
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];
