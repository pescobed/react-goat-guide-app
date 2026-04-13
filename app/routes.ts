// import { type RouteConfig, index } from "@react-router/dev/routes";

// export default [index("routes/home.tsx")] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("about", "routes/about.tsx"),

  route("resources", "routes/resourceIndex.tsx"),

  route("resource/:resourceId", "routes/resourceDetail.tsx"),

  route("tags", "routes/tagIndex.tsx"),  

  route("tags/:tagId", "routes/tagDetail.tsx"),

  route("department/:departmentId", "routes/departmentDetail.tsx"),

  route("departments", "routes/departmentIndex.tsx"),

  route("location/:locationName", "routes/locationResources.tsx"),

  route("locations", "routes/locationIndex.tsx"),

  // ADMIN ROUTES
  route("admin/edit-select", "routes/adminSelect.tsx"),
  route("admin/edit/:id", "routes/adminEdit.tsx"),
  route("admin-login", "routes/adminLogin.tsx"),

] satisfies RouteConfig;