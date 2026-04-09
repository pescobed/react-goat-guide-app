// import { type RouteConfig, index } from "@react-router/dev/routes";

// export default [index("routes/home.tsx")] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("about", "routes/about.tsx"),

  route("resource/:resourceId", "routes/resourceDetail.tsx"),

  route("tags/:tagId", "routes/tagDetail.tsx"),

  route("department/:departmentId", "routes/departmentDetail.tsx"),

  route("location/:locationName", "routes/locationDetail.tsx"),
] satisfies RouteConfig;