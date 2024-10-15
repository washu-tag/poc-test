# POC code for testing

Mocks and POC code, use with care.

# To run:

1. Install k3s and helm
1. Add weaviate chart to repo
    ```
    helm repo add weaviate https://weaviate.github.io/weaviate-helm
    ```
1. Create namespaces
    ```
    kubectl create namespace explorer
    kubectl create namespace ctclip
    ```
1. Add secrets
    ```
    # Note: these can all be junk and the app will still come up, 
    # but they cannot be missing
    kubectl -n explorer create secret generic ai-keys \
        --from-literal=google='your key' \
        --from-literal=azure='your key' \
        --from-literal=azure-resource='resource' \
        --from-literal=azure-assistant='assistant id' \
        --from-literal=azure-assistant-mini='assistant id'
    ```
1. Set up local storage class
    ```
    cat>storageclass.yaml << EOF
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: weaviate
    provisioner: rancher.io/local-path
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    EOF
    kubectl apply -f storageclass.yaml 
    rm storageclass.yaml 
    ```
1. Install the charts
    ```
    cd helm/ctclip
    helm upgrade --install -n ctclip ctclip . \
        --set huggingface.token=<your token> \
        --set resources.requests.memory=24000Mi \
        --set resources.requests.cpu=2
    cd -
    cd helm/explorer
    helm dependency build
    helm upgrade --install -n explorer explorer . \
        --set resources.requests.memory=4000Mi \
        --set resources.requests.cpu=2
    cd -
    ```
1. Hit the app `http://localhost`
