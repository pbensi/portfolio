export type Route = {
    path: string;
    tag: string;
    loader: () => Promise<any>;
};

const Loaders = {
    Home: async () => await import("../views/home/home.view"),
    About: async () => await import("../views/about/about.view"),
    NotFound: async () => await import("../views/not-found/not-found")
};

export const routes: Route[] = [
    { path: "", tag: "app-about-view", loader: Loaders.About },
    { path: "home", tag: "app-home-view", loader: Loaders.Home },
    { path: "about", tag: "app-about-view", loader: Loaders.About },
    { path: "project", tag: "app-not-found", loader: Loaders.NotFound },
    { path: "not-found", tag: "app-not-found", loader: Loaders.NotFound }
];
