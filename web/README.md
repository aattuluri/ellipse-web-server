# web
**The information contained herein, including code, documentations, media files, comments, methods, know-how, and intellecutual property, is confidential and proprietary information of Reality Labs, Inc. Do not distribute.**

# Local Setup
1. Install and start redis version 3.0.7
2. Install and start mongodb version 3.2.0
3. Install node v4.X.X. You can have several versions of node at
the same time by using [nvm](https://github.com/creationix/nvm).
4. Run the following:

```sh
git clone git@github.com:agentavery/web
cd web
npm install
npm run dev
```
The last command will start `nodemon` which will start the server at <http://localhost:3001>.
It will also watch for any changes in source files and restart the server
when you make changes.

# Git Workflow

```sh
# Rebase your local master.
git checkout master
git pull --rebase

# Create a feature branch.
git checkout -b my-feature

# Do your edits, then commit the changes.
git commit -m "Add MyFeature"

# Push your feature branch.
git push -u origin my-feature

# Create pull request from your feature branch. If you are using Hub:
git pull-request

# Make sure your code is reviewed by at least one engineer.
# Apply review feedback and update the pull request.
git commit -m "Apply review feedback"
git push

# If there is a merge conflict and GitHub can't rebase your pull request
# on its own, do it manually:
git fetch origin
git rebase origin/master
# Resolve any conflicts. Then update the pull request.
git push -f

# Finally, merge the pull request from the UI.
# This will squash your commits into a single commit.
# You can go back to master and pull the changes.
git checkout master
git pull --rebase
```
