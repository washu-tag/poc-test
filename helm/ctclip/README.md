CT-CLIP app helm chart
======================

Deploy mostly as normal. One wrinkle is that this app currently needs to download the CT-CLIP model file from HuggingFace at runtime.
For this to be successful you need to provide a HuggingFace Access Token that can read the CT-RATE dataset.

1. Log into HuggingFace (create an account if you don't have one already.)
2. Get access to the [CT-RATE files](https://huggingface.co/datasets/ibrahimhamamci/CT-RATE/tree/main). I think you have to agree to some terms or something, I don't really remember.
3. Make a [HuggingFace Access Token](https://huggingface.co/settings/tokens) that has Read access to Public Gated Repos.
4. Use that token when deploying this helm chart.
```
helm upgrade --install -n <a namespace> ctclip . \
    --set huggingface.token=<your token>
```

If deploying on AWS, it may make sense to specify a memory reservation:
```
helm upgrade --install -n <a namespace> ctclip . \
    --set huggingface.token=<your token> \
    --set resources.requests.memory=24000Mi
```

Another wrinkle is that this pod will need to land on a node with sufficient disk space to handle the pretrained model, and sufficient memory and CPU to run inference. Ensure that there exists a node that meets these needs and add the label `workload-type=model-inference`. You can do this on Docker Desktop with:
```
kubectl get nodes --show-labels
kubectl label nodes docker-desktop workload-type=model-inference
kubectl get nodes --show-labels
```

To set up an appropriate node group in AWS, use the web console.

_This is not the best way to handle any of this. I should have built the image with the model file included, but I had problems with that approach and this one works._


