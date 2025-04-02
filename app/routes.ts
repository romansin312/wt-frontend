import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("pages/home.tsx"),
    route("/room/:roomId", "pages/room.tsx")
] satisfies RouteConfig;
