// import { type RouteConfig, index } from "@react-router/dev/routes";

// export default [index("routes/home.tsx")] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("about", "routes/about.tsx"),

  route("resources", "routes/resourceIndex.tsx"),

  route("resource/:resourceId", "routes/resourceDetail.tsx"),

  route("suggest", "routes/suggest.tsx"),

  route("tags", "routes/tagIndex.tsx"),  

  route("tags/:tagId", "routes/tagDetail.tsx"),

  route("department/:departmentId", "routes/departmentDetail.tsx"),

  route("departments", "routes/departmentIndex.tsx"),

  route("location/:locationName", "routes/locationDetail.tsx"),

  route("locations", "routes/locationIndex.tsx"),

  // ADMIN ROUTES
  route("admin", "routes/adminSelect.tsx"),
  route("admin-login", "routes/adminLogin.tsx"),

  route("admin/edit/:id", "routes/adminEdit.tsx", { id: "admin-edit" }),
  route("admin/add-resource", "routes/adminEdit.tsx", { id: "admin-add" }),

  route("admin/departments", "routes/adminDepartments.tsx"), 
  route("admin/tags", "routes/adminTags.tsx"),
  route("admin/locations", "routes/adminLocations.tsx"),

] satisfies RouteConfig;