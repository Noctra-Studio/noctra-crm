#!/bin/bash

# Script to cleanup duplicated files created by sync conflicts (e.g. iCloud)
# These files typically end with " 2" or " 2.extension"

echo "Listing files to be deleted..."
find . -name "* 2" -o -name "* 2.*" -not -path "./.git/*"

echo ""
echo "Deleting duplicates in .git/ ..."
find .git -name "* 2" -o -name "* 2.*" -exec rm -rf {} +

echo "Deleting duplicates in project (excluding .git and node_modules for speed, we will clear those separately) ..."
find . -name "* 2" -o -name "* 2.*" -not -path "./.git/*" -not -path "./node_modules/*" -exec rm -rf {} +

echo "Clearing node_modules, .next, and package-lock.json to ensure a clean state..."
rm -rf node_modules .next package-lock.json

echo "Cleanup complete. Please run 'npm install' to restore dependencies."
