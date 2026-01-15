#!/bin/bash

# GitHubへのプッシュスクリプト
# 使い方: ./push-to-github.sh <repository-url>

if [ -z "$1" ]; then
  echo "Usage: ./push-to-github.sh <repository-url>"
  echo "Example: ./push-to-github.sh https://github.com/koyo-suzuki/stockyard-manager.git"
  exit 1
fi

REPO_URL=$1

echo "Adding remote repository: $REPO_URL"
git remote add origin "$REPO_URL"

echo "Renaming branch to main"
git branch -M main

echo "Pushing to GitHub"
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "Repository: $REPO_URL"
