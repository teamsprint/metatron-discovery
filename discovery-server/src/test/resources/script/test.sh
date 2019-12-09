#!/usr/bin/env bash

set -x

./prep.sh -d /tmp/a.csv -s hdfs://localhost:9000/user/hive/s.csv --datasource-id thisisdatasourceid -i "2013-07/2014-06" --download
