module.exports = {
  apps: [
    {
      name: "stockpikr",
      script: "./dist/index.js",
      cwd: "~/stockpikr/source"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "root",
      host: ["172.200.217.33"],
      ref: "origin/main",
      repo: "git@github.com:Ring-A-Bell/StockPikr.git",
      path: "~/stockpikr",
      "post-setup": "cp ~/.env ~/stockpikr/source/.env",
      "pre-deploy": "yarn && yarn build"
    }
  }
};
