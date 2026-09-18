import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public Routes
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

  // Admin Login (Kept outside layout so unauthenticated users can access it)
  route("admin-login", "routes/adminLogin.tsx"),

  // PROTECTED ADMIN ROUTES (Wrapped by AdminLayout)
  layout("routes/adminLayout.tsx", [
    route("admin", "routes/adminSelect.tsx"),
    route("admin/add-resource", "routes/adminEdit.tsx", { id: "admin-add" }),
    route("admin/edit/:id", "routes/adminEdit.tsx", { id: "admin-edit" }),
    route("admin/departments", "routes/adminDepartments.tsx"), 
    route("admin/tags", "routes/adminTags.tsx"),
    route("admin/locations", "routes/adminLocations.tsx"),
    route("admin/suggestions", "routes/adminSuggestions.tsx"),
  ]),
] satisfies RouteConfig;