import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/config";
import Cookies from 'js-cookie';

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/form",
    component: () => import("@/layouts/main-layout/MainLayout.vue"),
    children: [
      {
        path: "/form",
        name: "form",
        component: () => import("@/views/FormOrder.vue"),
        meta: {
          pageTitle: "Form",
          breadcrumbs: ["Form"],
        },
      },
    ],
  },
  {
    path: "/",
    redirect: "/menu",
    component: () => import("@/layouts/main-layout/MainLayout.vue"),
    meta: {
      middleware: "auth",
    },
    children: [
      {
        path: "/menu",
        name: "menu",
        
        component: () => import("@/views/Menu.vue"),
        meta: {
          pageTitle: "Menu",
          breadcrumbs: ["Menu"],
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const configStore = useConfigStore();

  // current page view title
  document.title = `${to.meta.pageTitle} - ${import.meta.env.VITE_APP_NAME}`;

  // reset config to initial state
  configStore.resetLayoutConfig();

  // verify auth token before each page change
  authStore.verifyAuth();

  // before page access check if page requires authentication
  if (to.meta.middleware == "auth") {
    const token = Cookies.get('token');
    if (token) {
      next();
    } else {
      next({ name: "form" });
    }
  } else {
    next();
  }

  // Scroll page to top on every route change
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

export default router;
