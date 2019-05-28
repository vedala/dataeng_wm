function handler () {
    EVENT_DATA=$1

    # Save initial directory location
    HOME=`pwd`

    # Download source data file from S3
    ./aws s3 cp s3://${SRC_BUCKET}/features.csv /tmp

    # Download date dimension file form S3
    ./aws s3 cp s3://${DEST_BUCKET}/date_dimension.csv /tmp

    #
    # Data cleaning and preparation
    #

    # All processing will be done in /tmp directory
    cd /tmp

    # Convert NA to 0.0
    sed 's/NA/0.0/g' features.csv > features_na_cleaned.csv

    # Delete IsHoliday field
    cut -d, -f 1-11 features_na_cleaned.csv > features_no_is_holiday.csv

    # Separate out header row
    sed -n '1p' features_no_is_holiday.csv > header_row.csv
    sed '1d' features_no_is_holiday.csv > features_no_header.csv

    # Copy date dimension to current directory and remove header
    sed '1d' date_dimension.csv > date_dimension_no_header.csv

    # Replace date field with date key
    sort -t , -k 2,2 features_no_header.csv > features_sorted.csv
    join -t , -1 2 -2 2 -o'1.1,2.1,1.3,1.4,1.5,1.6,1.7,1.8,1.9,1.10,1.11' features_sorted.csv date_dimension_no_header.csv > features_joined.csv

    # Modify header "Date" field name to "DateKey"
    sed 's/Date/DateKey/' header_row.csv > header_row_datekey.csv

    # Concatenate header and rest of data
    cat header_row_datekey.csv features_joined.csv > features_fact.csv

    # Go back to initial directory location
    cd $HOME

    # Upload the features_fact.csv file to S3
    ./aws s3 cp /tmp/features_fact.csv s3://${DEST_BUCKET}

    RESPONSE="{\"statusCode\": 200, \"body\": \"Success\"}"
    echo $RESPONSE
}
