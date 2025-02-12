module.exports = {
  apps: [
    {
      name: "stockpikr-backend",
      script: "./index.ts",
      interpreter: "/home/azureuser/.npm-global/bin/tsx", // Use locally installed tsx
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 5000,
      }
    }
  ],

  deploy: {
    production: {
      key: "~/.ssh/stockpikr_id_rsa",
      user: "azureuser",
      host: ["40.78.98.127"],
      ref: "origin/main",
      repo: "git@github.com:mnzarn/Stockpikr-Back-End.git",
      path: "/home/azureuser/Stockpikr-Back-End",
      
      "pre-setup": "rm -rf /home/azureuser/Stockpikr-Back-End/source && npm install -g tsx pm2 yarn",


      "post-deploy": "export PATH=$PATH:$(npm bin -g) && cd /home/azureuser/Stockpikr-Back-End && git pull && yarn install && npx tsc && pm2 startOrRestart ecosystem.config.cjs --env production"

    }
  }
};
