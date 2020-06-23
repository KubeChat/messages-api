echo "$REGISTRY_PASS" | docker login -u "$REGISTRY_USER" --password-stdin
docker image push omarradwan213/kubechat-messages-api