module.exports = {
  apps: [
    {
      name: "stockpikr",
      script: "./index.ts",
      cwd: "/home/duclepham/stockpikr/source"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "duclepham",
      host: ["172.200.217.33"],
      ref: "origin/cicd/pipeline",
      repo: "git@github.com-stockpikr:Ring-A-Bell/StockPikr.git",
      path: "/home/duclepham/stockpikr",
      "pre-deploy": "cp ~/.env /home/duclepham/source/.env && yarn"
    }
  }
};
