import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/demo.tsx"),
    route("/simple", "routes/demo-simple.tsx"),
] satisfies RouteConfig;
