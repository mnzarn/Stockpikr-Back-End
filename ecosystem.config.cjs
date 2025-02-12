module.exports = {
  apps: [
    {
      name: "stockpikr-backend",
      script: "/home/azureuser/Stockpikr-Back-End/dist/index.js", // Full path
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 5000, // Use your env variables
      }
    }
  ],

  deploy: {
    production: {
      key: "~/.ssh/stockpikr_id_rsa",
      user: "azureuser",
      host: ["40.78.98.127"], // Ensure this is your VM IP
      ref: "origin/main",
      repo: "git@github.com:mnzarn/Stockpikr-Back-End.git",
      path: "/home/azureuser/Stockpikr-Back-End",

      "pre-setup": "npm install -g tsx pm2", // No rm -rf
      "post-setup": "cp ~/.env /home/azureuser/Stockpikr-Back-End/.env",

      "post-deploy":
        "cd /home/azureuser/Stockpikr-Back-End && git pull && yarn install && npx tsc && pm2 restart stockpikr-backend || pm2 start /home/azureuser/Stockpikr-Back-End/dist/index.js --name stockpikr-backend"
    }
  }
};
