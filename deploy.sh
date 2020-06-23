aws eks --region eu-central-1 update-kubeconfig --name Kubechat
kubectl rollout restart deployment messages-api