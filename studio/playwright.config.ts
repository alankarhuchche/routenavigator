import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
 testDir:'./e2e', timeout:30000, workers:2,
 use:{...devices['Desktop Chrome'],channel:'chrome',baseURL:'http://127.0.0.1:5179',viewport:{width:1440,height:1000},headless:true,screenshot:'only-on-failure',acceptDownloads:true},
})
