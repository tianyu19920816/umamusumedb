#!/bin/bash

echo "🚀 Starting UmamusumeDB development server..."
echo "📦 Installing dependencies if needed..."
npm install

echo "🔧 Building the project..."
npx astro build

echo "🌐 Starting preview server on port 3000..."
npx astro preview --port 3000 --host 0.0.0.0