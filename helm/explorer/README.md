# Scout Data Explorer Helm Chart

## Local instructions
Set up Docker Desktop and enable Kubernetes

Ensure you are using local context (not needed until you set up the AWS context)
```
kubectl config use-context docker-desktop
```

Set up local storage class
```
cat>storageclass.yaml << EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: weaviate
provisioner: docker.io/hostpath
reclaimPolicy: Delete
volumeBindingMode: Immediate
EOF
kubectl apply -f storageclass.yaml 
rm storageclass.yaml 
```

Set up secrets
```
kubectl -n explorer create secret generic ai-keys \
    --from-literal=google='your key' \
    --from-literal=azure='your key' \
    --from-literal=azure-resource='resource' \
    --from-literal=azure-assistant='assistant id' \
    --from-literal=azure-assistant-mini='assistant id'
```

Deploy
```
helm upgrade --install --create-namespace -n explorer explorer .
```

## AWS instructions
Set up the cluster. I used their [getting started instructions](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) along with [setting up EFS](https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html) (Weaviate needed storage). I was not particularly careful about being repeatable, so we should go through and document carefully next time. Be sure to set up two Node Groups, one with a basic instance type like t3.medium and one with the label "workload-type=model-inference" and a beefier instance type. See the [CT-CLIP helm README](https://github.com/larkspur-ai/ctclip-helm/blob/main/README.md) for more.

Ensure you are using AWS context
```
kubectl config use-context arn:aws:eks:us-west-1:658201001042:cluster/scout
```

Set up AWS storage class
```
cat>storageclass.yaml << EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: weaviate
provisioner: efs.csi.aws.com
parameters:
  fileSystemId: fs-03697c9e935cc1099
  provisioningMode: efs-ap
  directoryPerms: "700"
EOF
kubectl apply -f storageclass.yaml 
rm storageclass.yaml 
```

Set up secrets
```
kubectl -n explorer create secret generic ai-keys \
    --from-literal=google='KEY' \
    --from-literal=openai='KEY'
```

Deploy (set the team IP addressees to a TEAM_IPS variable, if you like)
```
export TEAM_IPS=x.x.x.x/32,y.y.y.y/32
helm upgrade --install --create-namespace -n explorer explorer . \
    --set "service.loadBalancerSourceRanges={$TEAM_IPS}"
```

## Helpful commands
```
kubectl config current-context
kubectl get nodes 
kubectl -n explorer get events
kubectl -n explorer get all
kubectl -n explorer logs -f <pod name>

aws eks describe-cluster --name scout
```
