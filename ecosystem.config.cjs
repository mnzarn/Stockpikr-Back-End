module.exports = {
  apps: [
    {
      name: "stockpikr-backend",
      script: "./index.ts",  // Ensure this is the correct entry file
      interpreter: "ts-node", // ts-node is required to run TypeScript directly
      exec_mode: "fork", // Run in single-instance mode (use "cluster" for multi-instance)
      instances: 1, // Adjust if needed
      autorestart: true, // Restart on failure
      watch: false, // Set to true if you want auto-restart on file changes
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Ensure this is the correct port
      }
    }
  ],

  deploy: {
    production: {
      key: "~/.ssh/stockpikr_id_rsa", // Use your SSH key
      user: "azureuser", // Update with your Azure VM username
      host: ["40.78.98.127"], // Your Azure VM public IP
      ref: "origin/main", // Deploy from main branch
      repo: "git@github.com:mnzarn/Stockpikr-Back-End.git", // Your actual GitHub repo
      path: "/home/azureuser/stockpikr-backend", // Deployment directory

      "pre-setup": "npm install -g tsx pm2 && rm -rf ~/stockpikr-backend",
      "post-setup": "cp ~/.env ~/stockpikr-backend/source/.env",

      "post-deploy":
        "cd ~/stockpikr-backend/source && yarn install && pm2 startOrRestart ecosystem.config.cjs --env production"
    }
  }
};
