#!/bin/bash

# Login to AWS - can comment this out depending on setup
assume-role elsewhere

# Compile the application in production mode (to avoid live reload)
NODE_ENV=production npm run build

# Copy the public directory to S3
aws s3 cp --recursive --exclude .DS_Store public s3://apps.elsewhere.zone/

# Invalidate the CF distribution. Quite inefficient since we do a full invalidation, however there are only a few files.
aws cloudfront create-invalidation --distribution-id E4D7E3HZWMB1J --paths "/*"
