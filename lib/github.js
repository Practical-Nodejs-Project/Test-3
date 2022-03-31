import { Octokit } from "octokit";
const Configstore = require("configstore");
const pkg = require("../package.json");
const _ = require("lodash");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const chalk = require("chalk");

const inquirer = require("./inquirer");

const conf = new Configstore(pkg.name);

let octokit = new Octokit();

module.exports = {
  getInstance: () => {
    return octokit;
  },

  getStoredGithubToken: () => {
    return conf.get("github.access_token");
  },

  setGithubAuth: (token) => {
    octokit = new Octokit({
      auth: token,
    });
  },

  setGithubCredentials: async () => {
    const credentials = await inquirer.askGithubCredentials();

    const status = new Spinner("Authenticating you, please wait...");
    status.start();

    try {
      octokit = new Octokit({
        auth: credentials.token,
      });
      await octokit.rest.users.getAuthenticated();
      conf.set("github.access_token", credentials.token);
    } catch (error) {
      console.log(chalk.red("\nInvalid access token !"));
      process.exit(0);
    } finally {
      status.stop();
    }

    return credentials.token;
  },
};
