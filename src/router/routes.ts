export const Routes = {
  home: "/",
  cheatsheet: "/cheatsheet",
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];
