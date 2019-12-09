#!/usr/bin/env bash

function help() {
  echo
  echo "Usage: prep.sh [options] <SRC_URL>"
  echo
  echo "  -h, --help             Print this message."
  echo "      --hostname         Metatron hostname."
  echo "      --port             Metatron port."
  echo "  -u, --username         Metatron user."
  echo "  -p, --password         Metatron password."
  echo "  -w, --wrangled-ds-id   W.DS ID to apply."
  echo "      --wrangled-ds-name W.DS name to apply. Use 1st W.DS if many DSs have this name."
  echo "  -s, --src-url          Source URL."
  echo "  -d, --dest-url         Destination URL."
  echo "      --dest-dir         Destination directory."
  echo "      --download         Download snapshot file. In this case, destination URL is used for downloading."
  echo "      --datasource-id    Destination Druid Datasource ID to ingest into."
  echo "      --datasource-name  Destination Druid Datasource name to ingest into."
  echo "  -i, --interval         Interval string for ingestion."
  echo "  -c, --colcnt           Manual column count. Set when max column count is likely to be more than 1st row."
  echo
  exit 0
}


### Get options

METATRON_HOSTNAME=localhost
METATRON_PORT=8180
METATRON_USERNAME=admin
METATRON_PASSWORD=admin

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
  -h|--help)
  help
  ;;
  --hostname)
  METATRON_HOSTNAME="$2"
  shift # past argument
  shift # past value
  ;;
  --port)
  METATRON_PORT="$2"
  shift # past argument
  shift # past value
  ;;
  -u|--username)
  METATRON_USERNAME="$2"
  shift # past argument
  shift # past value
  ;;
  -p|--password)
  METATRON_PASSWORD="$2"
  shift # past argument
  shift # past value
  ;;
  -w|--wrangled-ds-id)
  WDS_ID="$2"
  shift # past argument
  shift # past value
  ;;
  --wrangled-ds-name)
  WDS_NAME="$2"
  shift # past argument
  shift # past value
  ;;
  -s|--src-url)
  SRC_URL="$2"
  shift # past argument
  shift # past value
  ;;
  -d|--dest-url)
  DEST_URL="$2"
  shift # past argument
  shift # past value
  ;;
  --dest-dir)
  DEST_DIR="$2"
  shift # past argument
  shift # past value
  ;;
  --download)
  DOWNLOAD="TRUE"
  shift
  ;;
  --datasource-id)
  DATASOURCE_ID="$2"
  shift # past argument
  shift # past value
  ;;
  --datasource-name)
  DATASOURCE_NAME="$2"
  shift # past argument
  shift # past value
  ;;
  -i|--interval)
  INTERVAL="$2"
  shift # past argument
  shift # past value
  ;;
  -c|--colcnt)
  MANUAL_COLCNT="$2"
  shift # past argument
  shift # past value
  ;;
  --default)
  DEFAULT=YES
  shift # past argument
  ;;
  *)    # unknown option
  POSITIONAL+=("$1") # save it in an array for later
  shift # past argument
  ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters


### Set derived parameters
if [ -z ${SRC_URL} ]; then
  echo "SRC_URL is mandatory."
  exit -1
fi

if [ ! -z ${DEST_URL} ]; then
  DEST_DIR=""
else
  if [ -z ${DEST_DIR} ]; then
    DEST_DIR=$HOME/dataprep/snapshots
  fi
  DEST_URL=${DEST_DIR}/${SRC_URL##*/}
fi

[ ! -z ${DATASOURCE_ID} ] || DATASOURCE_NAME=""

### Show arguments

echo "METATRON_HOSTNAME = ${METATRON_HOSTNAME}"
echo "METATRON_PORT     = ${METATRON_PORT}"
echo "METATRON_USERNAME = ${METATRON_USERNAME}"
echo "METATRON_PASSWORD = ${METATRON_PASSWORD}"
echo "SRC_URL           = ${SRC_URL}"

[ -z ${WDS_ID} ]          || echo "WDS_ID          = ${WDS_ID}"
[ -z ${WDS_NAME} ]        || echo "WDS_NAME        = ${WDS_NAME}"
[ -z ${DEST_URL} ]        || echo "DEST_URL        = ${DEST_URL}"
[ -z ${DEST_DIR} ]        || echo "DEST_DIR        = ${DEST_DIR}"
[ -z ${DOWNLOAD} ]        || echo "DOWNLOAD        = ${DOWNLOAD}"
[ -z ${DATASOURCE_ID} ]   || echo "DATASOURCE_ID   = ${DATASOURCE_ID}"
[ -z ${DATASOURCE_NAME} ] || echo "DATASOURCE_NAME = ${DATASOURCE_NAME}"


function connect {
  echo "Connect ..."
  AUTH_TOKEN="thisisauthtoken"
}

function createIDS {
  echo "Create imported dataset ..."
  echo "In: SRC_URL=$1"
  IDS_ID="thisisidsid"
}

#function createDataflow {
#  echo "Create dataflow ..."
#  echo "In: IDS_ID=$1"
#  DF_ID="thisisdfid"
#}

function getFirstWDS {
  echo "Get first wrangled dataset ID named $1"
  echo "In: WDS_NAME=$1"
  WDS_ID="thisiswrangleddatasetid"
  return 0
}

function cloneAndSwap {
  echo "Clone wrangled dataset and swap imported dataset ..."
  echo "In: IDS_ID=$1"
  echo "In: WDS_ID=$2"
  return 0
}

function createSnapshot {
  if [ -z $2 ]; then
    echo "Create snapshot to $DEST_URL ..."
  else
    echo "Create snapshot to default directory ..."
  fi
  echo "In: WDS_ID=$1"
  echo "In: DOWNLOAD=$2"
  SS_ID="thisisssid"
}

function downloadSnapshot {
  echo "Download snapshot to $DEST_URL ..."
  echo "In: SS_ID=$1"
  return 0
}

function getFirstDatasource {
  echo "Get first datasource ID named $1 ..."
  echo "In: DATASOURCE_NAME=$1"
  DATASOURCE_ID="thisisdatasourceid"
  return 0
}

function appendFileDatasource {
  echo "Append file datasource to datasource $1 ..."
  echo "In: DATASOURCE_ID=$1"
  echo "In: FILE_URL=$2"
  echo "In: INTERVAL=${INTERVAL}"

  if [ -z ${INTERVAL} ]; then
    echo "Interval string is mandatory for ingestion."
    exit -1
  fi
  return 0
}


### Run
echo
connect
echo "Out: AUTH_TOKEN=$AUTH_TOKEN"
echo

createIDS $SRC_URL
echo "Out: IDS_ID=$IDS_ID"
echo

#createDataflow $IDS_ID
#echo "Out: DF_ID=$DF_ID"
#echo

[ -z ${WDS_ID} ] || getFirstWDS $WDS_NAME
echo "Out: WDS_ID=$WDS_ID"
echo

cloneAndSwap $IDS_ID $WDS_ID
echo "Out: $?"
echo

createSnapshot $WDS_ID $DOWNLOAD
echo "Out: SS_ID=$SS_ID"
echo "Out: DEST_URL=$DEST_URL"
echo

[ -z ${DATASOURCE_ID} ] || getFirstDatasource $DATASOURCE_NAME

if [ -z ${DOWNLOAD} ]; then
  echo "Skip downloading ..."
else
  downloadSnapshot $SS_ID
  echo "Out: $?"
fi
echo

if [ -z ${DATASOURCE_ID} ] && [ -z ${DATASOURCE_NAME} ]; then
  echo "Finish without ingestion ..."
  exit 0;
fi

[ -z ${DATASOURCE_ID} ] || getFirstDatasource $DATASOURCE_NAME
echo "Out: DATASOURCE_ID=$DATASOURCE_ID"
echo

appendFileDatasource $DATASOURCE_ID $DEST_URL
echo "Out: $?"
echo

#eof
