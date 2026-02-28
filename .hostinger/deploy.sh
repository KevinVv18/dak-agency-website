#!/bin/bash
# Hostinger deployment script
# Builds main site (Vite) + blog (Astro) and deploys combined output
npm install
npm run build
cp -r dist/* /home/u567580447/public_html/
