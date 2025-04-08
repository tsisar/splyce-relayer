#!/bin/bash

# Name of the Docker image
IMAGE_NAME="intothefathom/splyce.solana.wormhole.relayer"
TAG=$(cat VERSION)

# Function to print header
function print_header() {
    echo "============================================================================"
    echo $1
    echo "============================================================================"
}

# 1. Create Docker image for amd64
print_header "Building Docker image ${IMAGE_NAME}:${TAG} for amd64"
docker build --platform=linux/amd64 -t ${IMAGE_NAME}:${TAG} .

# Check if the image build was successful
if [ $? -ne 0 ]; then
    echo "Docker image build failed!"
    exit 1
fi

# Tag the image as latest
docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest