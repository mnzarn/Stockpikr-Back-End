module.exports = {
  apps: [
    {
      name: "stockpikr",
      script: "./index.ts",
      intepreter: "tsx"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/stockpikr_id_rsa",
      user: "duclepham",
      host: ["172.200.217.33"],
      ref: "origin/cicd/pipeline",
      repo: "git@github.com-stockpikr:Ring-A-Bell/StockPikr.git",
      path: "/home/duclepham/stockpikr",
      "pre-setup": "npm install -g tsx && rm -rf ~/stockpikr",
      "post-setup": "cp ~/.env ~/stockpikr/source/.env",
      "post-deploy": "cd ~/stockpikr/source/ && yarn && pm2 startOrRestart ecosystem.config.cjs --env production"
    }
  }
};
