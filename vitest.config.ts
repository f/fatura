import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["tests/unit/**/*.test.ts"],
        exclude: ["tests/integration/**"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/types/**", "src/index.ts"],
            reporter: ["text", "lcov"],
            thresholds: {
                lines: 80,
                functions: 80,
            },
        },
    },
});
