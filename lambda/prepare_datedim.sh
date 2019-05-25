function handler () {
    EVENT_DATA=$1

    # Save initial directory location
    HOME=`pwd`

    # Download data file from S3
    ./aws s3 cp s3://kvwalmart/train.csv /tmp

    #
    # Data cleaning and preparation
    #

    # All processing will be done in /tmp directory
    cd /tmp

    # Extract only Date and isHoliday columns
    # Split header row and data into separate files
    cut -d ',' -f 3,5 train.csv > two_col.csv
    sed -n '1p' two_col.csv > header_row.csv
    sed '1d' two_col.csv > two_col_no_header.csv

    # Sort on Date field and output only unique rows
    sort -u -t, -k1,1 two_col_no_header.csv >  sorted_unique.csv

    # Add rows for 2010 dates that are missing from data
    echo "2010-01-08,FALSE" > 2010_new_rows.csv
    echo "2010-01-15,FALSE" >> 2010_new_rows.csv
    echo "2010-01-22,FALSE" >> 2010_new_rows.csv
    echo "2010-01-29,FALSE" >> 2010_new_rows.csv

    # Add rows for 2012 dates that are missing from data
    echo "2012-11-02,FALSE" > 2012_new_rows.csv
    echo "2012-11-09,FALSE" >> 2012_new_rows.csv
    echo "2012-11-16,FALSE" >> 2012_new_rows.csv
    echo "2012-11-23,TRUE" >> 2012_new_rows.csv
    echo "2012-11-29,FALSE" >> 2012_new_rows.csv
    echo "2012-12-07,FALSE" >> 2012_new_rows.csv
    echo "2012-12-14,FALSE" >> 2012_new_rows.csv
    echo "2012-12-21,FALSE" >> 2012_new_rows.csv
    echo "2012-12-28,TRUE" >> 2012_new_rows.csv

    # Concatenate rest of data with 2010 and 2012 rows created above
    cat 2010_new_rows.csv sorted_unique.csv 2012_new_rows.csv > data_with_new_rows.csv

    # Add Id and HolidayName fields to header (Id to be first column, HolidayName last)
    echo "Id" > new_column_name_1.csv
    echo "HolidayName" > new_column_name_2.csv
    paste -d, new_column_name_1.csv header_row.csv new_column_name_2.csv > header_row_with_new_columns.csv

    # Create file with holiday dates and names
    echo "2010-02-12,Super Bowl" > holidays_with_names.csv
    echo "2010-09-10,Labor Day" >> holidays_with_names.csv
    echo "2010-11-26,Thanksgiving" >> holidays_with_names.csv
    echo "2010-12-31,Christmas" >> holidays_with_names.csv
    echo "2011-02-11,Super Bowl" >> holidays_with_names.csv
    echo "2011-09-09,Labor Day" >> holidays_with_names.csv
    echo "2011-11-25,Thanksgiving" >> holidays_with_names.csv
    echo "2011-12-30,Christmas" >> holidays_with_names.csv
    echo "2012-02-10,Super Bowl" >> holidays_with_names.csv
    echo "2012-09-07,Labor Day" >> holidays_with_names.csv
    echo "2012-11-23,Thanksgiving" >> holidays_with_names.csv
    echo "2012-12-28,Christmas" >> holidays_with_names.csv

    # Insert holiday_name field into data using join command
    join -t , -1 1 -2 1 -a1  -o'0,1.2,2.2' data_with_new_rows.csv holidays_with_names.csv > data_with_holiday_names_joined.csv

    # Create sequence column for total number of rows in date data
    # Add sequence data as first column
    seq 1 156 > sequence.csv
    paste -d, sequence.csv data_with_holiday_names_joined.csv > data_with_holiday_and_seq.csv

    # Concatenate header and rest of data
    cat header_row_with_new_columns.csv data_with_holiday_and_seq.csv   > date_dimension.csv

    # Go back to initial directory location (since aws cli executable is located there)
    cd $HOME

    # Upload the date_dimension.csv file to S3
    ./aws s3 cp /tmp/date_dimension.csv s3://kvwalmart3

    RESPONSE="{\"statusCode\": 200, \"body\": \"Success\"}"
    echo $RESPONSE
}

