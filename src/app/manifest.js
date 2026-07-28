export default function manifest() {
  return {
    name: "Kairos",
    short_name: "Kairos",
    description: "Cook what you already have.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090a",
    theme_color: "#08090a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
