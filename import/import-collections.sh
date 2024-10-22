# DB_NAME=sridhar_2
DB_NAME=prod_full
DB_URI=mongodb://127.0.0.1:27017/$DB_NAME

echoImport() {
    echo ''
    echo Importing: $1
}

echo '--- Count documents before import ---'
mongosh $DB_NAME --quiet --file mongo-count-all.js

echo ''
echo '--- Mark old data ---'
mongosh $DB_NAME --quiet --file mongo-mark-old-data.js

JSON_PATH=../output/json/categories.json
echoImport $JSON_PATH
mongoimport --uri $DB_URI --type json --jsonArray --mode=upsert --file $JSON_PATH --upsertFields=slug --collection topics

JSON_PATH=../output/json/footnotes.json
echoImport $JSON_PATH
mongoimport --uri $DB_URI --type json --jsonArray --mode=upsert --file $JSON_PATH --upsertFields=meta.slug --collection footnotes

JSON_PATH=../output/json/posts.json
echoImport $JSON_PATH
mongoimport --uri $DB_URI --type json --jsonArray --mode=upsert --file $JSON_PATH --upsertFields=meta.slug --collection posts

JSON_PATH=../output/json/tags.json
echoImport $JSON_PATH
mongoimport --uri $DB_URI --type json --jsonArray --mode=upsert --file $JSON_PATH --upsertFields=slug --collection tags

JSON_PATH=../fixtures/years.json
echoImport $JSON_PATH
mongoimport --uri $DB_URI --type json --jsonArray --mode=upsert --file $JSON_PATH --upsertFields=value --collection years

echo ''
echo '--- Remove old data ---'
mongosh $DB_NAME --quiet --file mongo-remove-old-data.js

echo ''
echo '--- Count documents after import ---'
mongosh $DB_NAME --file mongo-count-all.js
