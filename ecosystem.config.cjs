module.exports = {
  apps: [
    {
      name: "stockpikr-backend",
      script: "./index.ts", // Use TypeScript entry file directly
      interpreter: "tsx", // Use `tsx` to run TypeScript directly without compiling
      exec_mode: "fork", // Run as a single instance (not clustered)
      instances: 1,
      autorestart: true,
      watch: false, // In production, you don’t need to watch for file changes
      env: {
        NODE_ENV: "production",  // Set environment variable for production
        PORT: process.env.PORT || 5000, // Use environment variable for port (default to 5000)
      }
    }
  ],

  deploy: {
    production: {
      key: "~/.ssh/stockpikr_id_rsa", // Path to your private key
      user: "azureuser", // SSH username
      host: ["40.78.98.127"], // Public IP of your Azure VM
      ref: "origin/main", // Branch to deploy from
      repo: "git@github.com:mnzarn/Stockpikr-Back-End.git", // GitHub repository
      path: "/home/azureuser/Stockpikr-Back-End", // Deployment path on the VM

      "pre-setup": "npm install -g tsx",  // Install `tsx` globally
      "post-setup": "cp ~/.env /home/azureuser/Stockpikr-Back-End/.env", // Copy environment variables to the server

      "post-deploy":
        "cd /home/azureuser/Stockpikr-Back-End && git pull && yarn install && npx tsc && pm2 startOrRestart ecosystem.config.js --env production" // Run `pm2` after setup to manage the app
    }
  }
};
