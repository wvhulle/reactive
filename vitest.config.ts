import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [viteTsconfigPaths()],
    test: {
        coverage: {
            provider: 'istanbul', // or 'c8'
            reporter: ['text', 'json', 'html', 'lcov']
        },
        hookTimeout: 10000,

        testTimeout: 10000
    }
})
