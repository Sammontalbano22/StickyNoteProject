#!/bin/bash

# Step 1: Ensure you're in a git repo
if [ ! -d .git ]; then
  echo "❌ Not a Git repository. Run this in your project folder."
  exit 1
fi

# Step 2: Ask for feature name
read -p "📛 Enter your feature branch name (e.g. feature/add-login): " branch

# Step 3: Checkout main and pull latest
echo "🔄 Switching to main and pulling latest..."
git checkout main
git pull origin main

# Step 4: Create new branch
echo "🌱 Creating and switching to new branch: $branch"
git checkout -b $branch

# Step 5: Add and commit changes
read -p "📝 Enter commit message: " commit_msg
git add .
git commit -m "$commit_msg"

# Step 6: Push feature branch to GitHub
echo "🚀 Pushing $branch to GitHub..."
git push -u origin $branch

# Step 7: Offer to open pull request
read -p "🌐 Open Pull Request in browser? (y/n): " open_pr
if [[ "$open_pr" == "y" || "$open_pr" == "Y" ]]; then
  open "https://github.com/Sammontalbano22/StickyNoteProject/pull/new/$branch"
fi

echo "✅ All done! Your feature branch is live and ready for a PR."
