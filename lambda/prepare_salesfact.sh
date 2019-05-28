function handler () {
    EVENT_DATA=$1

    # Save initial directory location
    HOME=`pwd`

    # Download source data file from S3
    ./aws s3 cp s3://kvwalmart/train.csv /tmp

    # Download date dimension file form S3
    ./aws s3 cp s3://kvwalmart3/date_dimension.csv /tmp

    #
    # Data cleaning and preparation
    #

    # All processing will be done in /tmp directory
    cd /tmp

    # Delete IsHoliday field
    cut -d, -f 1-4 train.csv > sales_no_is_holiday.csv

    # Separate out header row
    sed -n '1p' sales_no_is_holiday.csv > header_row.csv
    sed '1d' sales_no_is_holiday.csv > sales_no_header.csv

    # Copy date_dimension.csv to current directory and remove header
    sed '1d' date_dimension.csv > date_dimension_no_header.csv

    #
    # Replace date field with date key
    # sorting is required for join to work correctly
    #
    sort -t , -k 3,3 sales_no_header.csv > sales_sorted.csv
    join -t , -1 3 -2 2 -o'1.1,1.2,2.1,1.4' sales_sorted.csv date_dimension_no_header.csv > sales_joined.csv

    # Modify header "Date" field name to "DateKey"
    sed 's/Date/DateKey/' header_row.csv > header_row_datekey.csv

    # Concatenate header and rest of data
    cat header_row_datekey.csv sales_joined.csv > sales_fact.csv

    # Go back to initial directory location
    cd $HOME

    # Upload the date_dimension.csv file to S3
    ./aws s3 cp /tmp/sales_fact.csv s3://kvwalmart3

    RESPONSE="{\"statusCode\": 200, \"body\": \"Success\"}"
    echo $RESPONSE
}
