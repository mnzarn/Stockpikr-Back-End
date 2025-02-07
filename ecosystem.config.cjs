module.exports = {
  apps: [
    {
      name: "stockpikr-backend",
      script: "./index.ts",
      interpreter: "node", // Use node, not ts-node
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Ensure this is the correct port
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
      path: "/home/azureuser/stockpikr-backend",

      "pre-setup": "npm install -g tsx pm2 && rm -rf ~/stockpikr-backend",
      "post-setup": "cp ~/.env ~/stockpikr-backend/.env",

      "post-deploy": 
        "cd ~/stockpikr-backend && yarn install && npx tsc && pm2 start dist/index.js --name stockpikr-backend"
    }
  }
};
