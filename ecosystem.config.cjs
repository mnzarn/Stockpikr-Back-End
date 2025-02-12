module.exports = {
  apps: [
    {
      name: "stockpikr-backend",
      script: "./src/index.ts",
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
      
      "pre-setup": "mkdir -p ~/.npm-global && npm config set prefix '~/.npm-global' && npm install tsx --prefix ~/.npm-global",
      "post-setup": "cp ~/.env /home/azureuser/Stockpikr-Back-End/.env",

      "post-deploy":
        "cd /home/azureuser/Stockpikr-Back-End && git pull && yarn install && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
};
