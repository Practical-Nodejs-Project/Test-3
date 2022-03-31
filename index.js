const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const files = require("./lib/files");
const github = require("./lib/github");
const repo = require("./lib/repo");

clear();
console.log(
  chalk.yellow(figlet.textSync("Ginit", { horizontalLayout: "full" }))
);

if (files.directoryExists(".git")) {
  console.log(chalk.red("Already a git repository!"));
  process.exit();
}

const run = async () => {
  try {
    let token = github.getStoredGithubToken();
    if (!token) {
      token = await github.setGithubCredentials();
    }
    github.setGithubAuth(token);
    const remoteUrl = await repo.createRemoteRepo();
    await repo.createGitignore();
    await repo.setupRepo(remoteUrl);
  } catch (err) {
    if (err) {
      switch (err.code) {
        case 401:
          console.log(
            chalk.red(
              "Couldn't log you in. Please provide correct credentials/token."
            )
          );
          break;
        case 422:
          console.log(
            chalk.red(
              "There already exists a remote repository with the same name"
            )
          );
          break;
        default:
          console.log(err);
      }
    }
  }
};

run();
