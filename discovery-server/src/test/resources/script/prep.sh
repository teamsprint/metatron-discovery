#!/usr/bin/env bash

function help() {
  echo
  echo "Usage: prep.sh [options]"
  echo
  echo "  -h, --help             Print this message."
  echo "      --hostname         Metatron hostname."
  echo "      --port             Metatron port."
  echo "  -u, --username         Metatron user."
  echo "  -p, --password         Metatron password."
  echo "  -w, --wrangled-ds-id   W.DS ID to apply."
  echo "      --wrangled-ds-name W.DS name to apply. Use 1st W.DS if many DSs have this name."
  echo "  -s, --src-path         Source pathname."
  echo "  -d, --dest-path        Destination pathname."
  echo "      --dest-dir         Destination directory."
  echo "      --download         Download snapshot file. In this case, destination pathname is used for downloading."
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
  -s|--src-path)
  SRC_PATH="$2"
  shift # past argument
  shift # past value
  ;;
  -d|--dest-path)
  DEST_PATH="$2"
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
METATRON_URL=http://${METATRON_HOSTNAME}:${METATRON_PORT}

if [ -z ${SRC_PATH} ]; then
  echo "SRC_PATH is mandatory."
  exit -1
fi
SRC_BASENAME=${SRC_PATH##*/}

if [ ! -z ${DEST_PATH} ]; then
  DEST_DIR=""
else
  if [ -z ${DEST_DIR} ]; then
    DEST_DIR=$HOME/dataprep/snapshots
  fi
  DEST_PATH=${DEST_DIR}/${SRC_BASENAME}
fi

[ ! -z ${DATASOURCE_ID} ] || DATASOURCE_NAME=""


### Show arguments

echo "METATRON_HOSTNAME = ${METATRON_HOSTNAME}"
echo "METATRON_PORT     = ${METATRON_PORT}"
echo "METATRON_USERNAME = ${METATRON_USERNAME}"
echo "METATRON_PASSWORD = ${METATRON_PASSWORD}"
echo "METATRON_URL      = ${METATRON_URL}"
echo "SRC_PATH          = ${SRC_PATH}"
echo "SRC_BASENAME      = ${SRC_BASENAME}"

[ -z ${WDS_ID} ]          || echo "WDS_ID            = ${WDS_ID}"
[ -z ${WDS_NAME} ]        || echo "WDS_NAME          = ${WDS_NAME}"
[ -z ${DEST_PATH} ]       || echo "DEST_PATH         = ${DEST_PATH}"
[ -z ${DEST_DIR} ]        || echo "DEST_DIR          = ${DEST_DIR}"
[ -z ${DOWNLOAD} ]        || echo "DOWNLOAD          = ${DOWNLOAD}"
[ -z ${DATASOURCE_ID} ]   || echo "DATASOURCE_ID     = ${DATASOURCE_ID}"
[ -z ${DATASOURCE_NAME} ] || echo "DATASOURCE_NAME   = ${DATASOURCE_NAME}"
[ -z ${MANUAL_COLCNT} ]   || echo "MANUAL_COLCNT     = ${MANUAL_COLCNT}"


function extract_value() {
  local key=$1
  local json=$2
  re='"'${key}'":"([^"]+)"'
  if [[ ${json} =~ ${re} ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo ""
  fi
}

# Use when the argument is too long. In my case, it had cut around about 530 bytes.
function extract_value_from_response() {
  local key=$1

  re=${key}'":"([^"]+)"'
  if [[ ${response} =~ ${re} ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo ""
  fi
}

function extract_value_num() {
    local key=$1
    local json=$2
    re='"'${key}'":([^,]+).*'
    if [[ ${json} =~ ${re} ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

function connect() {
  echo "Connect ..."

  echo "  In: METATRON_URL=${METATRON_URL}"

  local client_id="polaris_client"
  local secret="polaris"
  local auth_key=$( echo -n "${client_id}:${secret}" | base64 )

  local response=$( curl -s POST "${METATRON_URL}/oauth/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -H "Origin: ${METATRON_URL}" \
      -H "Referer: ${METATRON_URL}/app/v2/user/login" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Authorization: Basic ${auth_key}" \
      -d "grant_type=password" \
      -d "scope=write" \
      -d "username=admin" \
      -d "password=admin" )

  AUTH_TOKEN=$( extract_value "access_token" ${response} )
}

function get_upload_policy() {
  echo "get_upload_policy ..."

  local response=$( curl -s GET "${METATRON_URL}/api/preparationdatasets/file_upload" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: application/json" )

  UPLOAD_ID=$( extract_value "upload_id" ${response} )
  if [[ -z "${UPLOAD_ID}" ]]; then
    echo "Failed to get UPLOAD_ID"
    exit -1
  fi

  LIMIT_SIZE=$( extract_value_num "limit_size" ${response} )
  if [[ -z "${LIMIT_SIZE}" ]]; then
    echo "Failed to get LIMIT_SIZE"
    exit -1
  fi
}

function post_upload_file() {
  echo "post_upload_file ..."

  local total_size=$(wc -c ${SRC_PATH} | awk '{print $1}')
  local params="name=${SRC_BASENAME}&chunk=0&chunks=1&storage_type=LOCAL&upload_id=${UPLOAD_ID}&chunk_size=${LIMIT_SIZE}&total_size=${total_size}"

  response=$( curl -s POST "${METATRON_URL}/api/preparationdatasets/file_upload?${params}" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: multipart/form-data" \
      -F "file=@${SRC_PATH}" \
  )

  STORED_URI=$( extract_value "storedUri" ${response} )
  if [[ -z "$STORED_URI" ]]; then
      echo "Failed to get stored URI"
      exit -1
  fi
}

function post_create_dataset() {
  echo "post_create_dataset ..."

  if [ -z ${MANUAL_COLCNT} ]; then
    local data="{\"delimiter\":\",\",\"quoteChar\":\"\\\"\",\"dsName\":\"${SRC_BASENAME}\",\"dsDesc\":\"\",\"dsType\":\"IMPORTED\",\"importType\":\"UPLOAD\",\"filenameBeforeUpload\":\"${SRC_BASENAME}\",\"storageType\":\"LOCAL\",\"sheetName\":\"\",\"storedUri\":\"${STORED_URI}\",\"fileFormat\":\"CSV\"}"
  else
    local data="{\"delimiter\":\",\",\"quoteChar\":\"\\\"\",\"dsName\":\"${SRC_BASENAME}\",\"dsDesc\":\"\",\"dsType\":\"IMPORTED\",\"importType\":\"UPLOAD\",\"filenameBeforeUpload\":\"${SRC_BASENAME}\",\"storageType\":\"LOCAL\",\"sheetName\":\"\",\"storedUri\":\"${STORED_URI}\",\"fileFormat\":\"CSV\",\"manualColumnCount\":${MANUAL_COLCNT}}"
  fi

  response=$( curl -s -X POST "${METATRON_URL}/api/preparationdatasets" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: application/json" \
      --data "${data}"
  )

  IDS_ID=$( extract_value "dsId" ${response} )
  if [[ -z "$IDS_ID" ]]; then
    echo "Failed to create dataset"
    exit -1
  fi
}


function createIDS() {
  echo "Create imported dataset ..."
  echo "  In: SRC_PATH=$1"

  get_upload_policy
  post_upload_file $SRC_PATH
  post_create_dataset
}

function getFirstWDS() {
  echo "Get first wrangled dataset ID named $1"
  echo "  In: WDS_NAME=$1"

  local response=$( curl -s GET \
      "${METATRON_URL}/api/preparationdatasets/search/findByDsNameContaining?dsName=s5k_ci" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: application/json" )

  WDS_ID=$( extract_value "dsId" ${response} )
  return 0
}

function getDfId() {
  echo "Get dataflow ID of W.DS $1"
  echo "  In: WDS_ID=$1"
  WDS_ID=$1

  response=$( curl -s GET \
      "${METATRON_URL}/api/preparationdatasets/${WDS_ID}" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: application/json" )

  DF_ID=$( extract_value_from_response "dfId" )
}

function getUpstreamIDS() {
  echo "Get Upstream imported datset ID of W.DS $1"
  echo "  In: WDS_ID=$1"
  echo "  In: DF_ID=$2"
  WDS_ID=$1
  DF_ID=$2

  response=$( curl -s GET \
      "${METATRON_URL}/api/preparationdataflows/${DF_ID}/upstreammap" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: application/json" )

  OLD_IDS_ID=$( extract_value_from_response "upstreamDsId" )
}

function swapUpstream() {
  echo "  In: IDS_ID=$1"
  echo "  In: WDS_ID=$2"
  IDS_ID=$1
  WDS_ID=$2

  getDfId ${WDS_ID}
  echo "  Out: DF_ID=${DF_ID}"
  echo

  getUpstreamIDS ${WDS_ID} ${DF_ID}
  echo "  Out: OLD_IDS_ID=${OLD_IDS_ID}"
  echo

  local data="{\"newDsId\":\"${IDS_ID}\",\"oldDsId\":\"${OLD_IDS_ID}\",\"wrangledDsId\":\"${WDS_ID}\"}"
  echo $data

  response=$( curl -s -X POST "${METATRON_URL}/api/preparationdataflows/${DF_ID}/swap_upstream" \
      -H "Authorization: bearer ${AUTH_TOKEN}" \
      -H "Accept: application/json, text/plain, */*" \
      -H "Content-Type: application/json" \
      --data "${data}"
  )

  return 0
}

function createSnapshot() {
  if [ -z $2 ]; then
    echo "Create snapshot to $DEST_PATH ..."
  else
    echo "Create snapshot to default directory ..."
  fi
  echo "  In: WDS_ID=$1"
  echo "  In: DOWNLOAD=$2"
  SS_ID="thisisssid"
}

function downloadSnapshot() {
  echo "Download snapshot to $DEST_PATH ..."
  echo "  In: SS_ID=$1"
  return 0
}

function getFirstDatasource() {
  echo "Get first datasource ID named $1 ..."
  echo "  In: DATASOURCE_NAME=$1"
  DATASOURCE_ID="thisisdatasourceid"
  return 0
}

function appendFileDatasource() {
  echo "Append file datasource to datasource $1 ..."
  echo "  In: DATASOURCE_ID=$1"
  echo "  In: FILE_PATH=$2"
  echo "  In: INTERVAL=${INTERVAL}"

  if [ -z ${INTERVAL} ]; then
    echo "  Interval string is mandatory for ingestion."
    exit -1
  fi
  return 0
}


### Run
echo
connect
echo "  Out: AUTH_TOKEN=$AUTH_TOKEN"
echo

createIDS $SRC_PATH
echo "  Out: IDS_ID=$IDS_ID"
echo

[ -z ${WDS_ID} ] && getFirstWDS $WDS_NAME
echo "  Out: WDS_ID=$WDS_ID"
echo

swapUpstream $IDS_ID $WDS_ID
echo "  Out: $?"
echo
exit

createSnapshot $WDS_ID $DOWNLOAD
echo "  Out: SS_ID=$SS_ID"
echo "  Out: DEST_PATH=$DEST_PATH"
echo

[ -z ${DATASOURCE_ID} ] || getFirstDatasource $DATASOURCE_NAME

if [ -z ${DOWNLOAD} ]; then
  echo "Skip downloading ..."
else
  downloadSnapshot $SS_ID
  echo "  Out: $?"
fi
echo

if [ -z ${DATASOURCE_ID} ] && [ -z ${DATASOURCE_NAME} ]; then
  echo "Finish without ingestion ..."
  exit 0;
fi

[ -z ${DATASOURCE_ID} ] || getFirstDatasource $DATASOURCE_NAME
echo "  Out: DATASOURCE_ID=$DATASOURCE_ID"
echo

appendFileDatasource $DATASOURCE_ID $DEST_PATH
echo "  Out: $?"
echo

#eof
