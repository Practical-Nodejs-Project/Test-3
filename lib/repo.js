const _ = require("lodash");
const fs = require("fs");
const simpleGit = require("simple-git");
const CLI = require("clui");
const Spinner = CLI.Spinner;

const inquirer = require("./inquirer");
const gh = require("./github");

const git = simpleGit();

module.exports = {
  createRemoteRepo: async () => {
    const github = gh.getInstance();
    const answers = await inquirer.askRepoDetails();

    const data = {
      org: answers.org,
      name: answers.name,
      description: answers.description,
      private: answers.visibility === "private",
    };

    const status = new Spinner("Creating remote repository...");
    status.start();

    try {
      const response = await github.rest.repos.createInOrg({
        ...data,
      });
      return response.data.clone_url;
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  },
  createGitignore: async () => {
    const filelist = _.without(fs.readdirSync("."), ".git", ".gitignore");

    if (filelist.length) {
      const answers = await inquirer.askIgnoreFiles(filelist);
      if (answers.ignore.length) {
        fs.writeFileSync(".gitignore", answers.ignore.join("\n"));
      } else {
        touch(".gitignore");
      }
    } else {
      touch(".gitignore");
    }
  },
  setupRepo: async (url) => {
    const status = new Spinner(
      "Initializing local repository and pushing to remote..."
    );
    status.start();

    try {
      await git
        .init()
        .add(".gitignore")
        .add("./*")
        .commit("Initial commit")
        .addRemote("origin", url)
        .push("origin", "master");
      return true;
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  },
};
