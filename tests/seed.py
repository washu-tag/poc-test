import weaviate
import weaviate.classes.config as wc

properties = [
    wc.Property(name="subject", data_type=wc.DataType.TEXT, description="The DICOM subject label."),
    wc.Property(name="study", data_type=wc.DataType.TEXT, description="The DICOM study label."),
]

client = weaviate.connect_to_local(port=8080)
if not client.is_ready():
    print("Weaviate is not up!")
    exit()

try:
    name = "CTRATE"
    if client.collections.exists(name):
        client.collections.delete(name)

    client.collections.create(
        name=name,
        properties=properties,
    )
finally:
    client.close()