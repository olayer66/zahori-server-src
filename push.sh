#!/bin/bash
set DOCKER_BUILDKIT=1
docker tag zahoriaut/zahori-server:0.1.0 zahoriaut/zahori-server:0.1.0
docker push zahoriaut/zahori-server:0.1.0
