module.exports = {
  apps: [
    {
      name: "stockpikr",
      script: "./index.ts",
      cwd: "/home/duclepham/source"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "duclepham",
      host: ["172.200.217.33"],
      ref: "origin/main",
      repo: "git@github.com:Ring-A-Bell/StockPikr.git",
      path: "/home/duclepham",
      "pre-deploy": "cp ~/.env /home/duclepham/source/.env && yarn"
    }
  }
};
