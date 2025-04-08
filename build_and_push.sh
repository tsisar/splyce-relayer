#!/bin/bash

# Name of the Docker image
IMAGE_NAME="intothefathom/splyce.solana.wormhole.relayer"
TAG=$(cat VERSION)

# Function to print header
function print_header() {
    echo "======================================"
    echo $1
    echo "======================================"
}

# Check if docker buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "Docker buildx is not installed or available. Please install Docker buildx."
    exit 1
fi

# 1. Create and use a new buildx builder
print_header "Creating and using new buildx builder"
docker buildx create --use --name mybuilder

# 2. Inspect the builder to ensure it is working
docker buildx inspect mybuilder --bootstrap

# 3. Build Docker image for multiple platforms
print_header "Building Docker image ${IMAGE_NAME}:${TAG}-dev for multiple platforms"
docker buildx build --platform linux/amd64 -t ${IMAGE_NAME}:${TAG}-dev --push .

# Check if the image build was successful
if [ $? -ne 0 ]; then
    echo "Docker image build failed!"
    exit 1
fi

# Remove buildx builder
docker buildx rm mybuilder

# 4. Remove existing container (if any)
CONTAINER_ID=$(docker ps -aqf "name=${IMAGE_NAME}")

if [ ! -z "$CONTAINER_ID" ]; then
    print_header "Removing existing container ${IMAGE_NAME}"
    docker rm -f ${CONTAINER_ID}
fi

# 5. Push Docker container (already done during buildx build --push)
print_header "Docker container image ${IMAGE_NAME}:${TAG}-dev has been pushed to Docker Hub"