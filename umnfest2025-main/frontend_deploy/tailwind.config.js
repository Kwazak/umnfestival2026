/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.jsx",
        "./resources/**/*.js",
    ],
    theme: {
        extend: {
            fontFamily: {
                museum: ["LTMuseum", "sans-serif"],
                timed: ["Timed", "serif"],
            },
        },
    },
    plugins: [],
};
