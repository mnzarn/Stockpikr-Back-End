module.exports = {
  apps: [
    {
      name: "stockpikr",
      script: "./index.ts",
      cwd: "~/stockpikr/source"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "duclepham",
      host: ["172.200.217.33"],
      ref: "origin/cicd/pipeline",
      repo: "git@github.com-stockpikr:Ring-A-Bell/StockPikr.git",
      path: "~/stockpikr",
      "pre-deploy": "cp ~/.env ~/stockpikr/source/.env && yarn"
    }
  }
};
