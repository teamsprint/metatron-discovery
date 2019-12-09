#!/usr/bin/env bash

set -x

./prep.sh -d /tmp/a.csv -s $HOME/data/s5k_1.csv --datasource-id thisisdatasourceid -i "2013-07/2014-06" --download -c 6
