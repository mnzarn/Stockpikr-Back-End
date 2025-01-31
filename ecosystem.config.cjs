module.exports = {
  apps: [
    {
      name: "stockpikr",
      script: "./index.ts",
      interpreter: "tsx"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/stockpikr_id_rsa",
      user: "sammyzayadi1",
      host: ["73.193.81.238"],
      ref: "origin/main",
      repo: "git@github.com:mnzarn/Stockpikr-Back-End.git",
      path: "C:/Users/ajani/Stockpikr-Back-End",
      "pre-setup": "npm install -g tsx && rm -rf ~/stockpikr",
      "post-setup": "cp ~/.env ~/stockpikr/source/.env",
      "post-deploy": "cd ~/stockpikr/source/ && yarn && pm2 startOrRestart ecosystem.config.cjs --env production"
    }
  }
};
