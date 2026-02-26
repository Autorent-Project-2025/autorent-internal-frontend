import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    publicOnly?: boolean;
    requiresAuth?: boolean;
    requiresInternal?: boolean;
    mode?: "login" | "register";
    internalView?: boolean;
  }
}
