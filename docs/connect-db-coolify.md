# Connect DB in Coolify

```bash
mongosh "mongodb://root:dnwr9jdERGncuzHxuQ3KSdWQD1NP4blRaYaQkZnk9EwOJMPOZIPPZZCYM2cEPCZL@kg0kgcgg08k0soog4o0kkkkw:27017/test?authSource=admin&directConnection=true"

mongodump \
--uri="mongodb://root:dnwr9jdERGncuzHxuQ3KSdWQD1NP4blRaYaQkZnk9EwOJMPOZIPPZZCYM2cEPCZL@kg0kgcgg08k0soog4o0kkkkw:27017/test?authSource=admin&directConnection=true" \
--archive=/tmp/test.archive.gz \
--gzip

docker cp <mongo_container_name>:/tmp/test.archive.gz ./test.archive.gz
```
