import { defineConfig } from 'vite'
import styleImport, { VantResolve } from 'vite-plugin-style-import';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default {
  plugins: [
    vue(),
    styleImport({
      resolves: [VantResolve()],
    }),
  ],
  // 开发环境配置跨域
  server: {
    cors: true,
    // 自身端口
    port: '3000',
    proxy: {
      '/api': {
        target: 'http://localhost:3001/',
        changeOrigin: true,
        // 不可以省略rewrite
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
};
