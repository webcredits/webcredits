#!/bin/bash

npm --no-git-tag-version version patch

git add -u
git commit -m "$1"
git push origin master

git checkout gh-pages
git merge master
git push origin gh-pages

git checkout master

npm publish

