import sys
import logging
import psycopg2
import json
import os

# rds settings
rds_host  = os.environ.get('RDS_HOST')
rds_username = os.environ.get('RDS_USERNAME')
rds_user_pwd = os.environ.get('RDS_USER_PWD')
rds_db_name = os.environ.get('RDS_DB_NAME')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn_string = "host=%s user=%s password=%s dbname=%s" % \
                    (rds_host, rds_username, rds_user_pwd, rds_db_name)
    conn = psycopg2.connect(conn_string)
except:
    logger.error("ERROR: Unexpected error: Could not connect to Postgres instance.")
    sys.exit()

logger.info("SUCCESS: Connection to RDS Postgres instance succeeded")

def handler(event, context):
    """
    This function fetches content from Postgres RDS instance
    """

    print(event)
    qs_param = event['queryStringParameters']
    all_or_pick = event['queryStringParameters'].get('allOrPick')
    selected_holidays = event['queryStringParameters'].get('selectedHolidays')
    print(selected_holidays)

    if all_or_pick == "all_holidays":
        labels = ["year", "All Year", "Super Bowl", "Labor Day",
                                                "Thanksgiving", "Christmas"]
    else:
        checkbox_label_dict = {
            'superbowl':    'Super Bowl',
            'laborday':     'Labor Day',
            'thanksgiving': 'Thanksgiving',
            'christmas':    'Christmas'
        }

        labels = ["year", "All Year"]
        selected_holiday_list = selected_holidays.split(',')
        for holiday_value in selected_holiday_list:
            labels.append(checkbox_label_dict[holiday_value])

    print(labels)

    query = construct_query(labels)
    print(query)

    with conn.cursor() as cur:
        rows = []
        cur.execute(query)
        for row in cur:
            rows.append(row)

    return_dict = {
        'statusCode': 200,
        'body': {
            'labels': labels,
            'rows': rows
        }
    }

    return return_dict

def construct_query(labels):
    main_inner_query = """
        (select date_part('year', "Date") as year, 'All Year' as col1, avg("Weekly_Sales")
        from walmartinteg.sales
        where date_part('year', "Date") in (2010, 2011, 2012)
        group by 1, 2)
    """

    for label in labels:
        if label == "year" or label == "All Year":
            continue
        elif label == "Super Bowl":
            main_inner_query += """
                union
                (select date_part('year', "Date") as year, 'Super Bowl' as col1, avg("Weekly_Sales")
                from walmartinteg.sales
                where "Date" in ('2010-02-12', '2011-02-11', '2012-02-10')
                group by 1, 2)
                """
        elif label == "Labor Day":
            main_inner_query += """
                union
                (select date_part('year', "Date") as year, 'Labor Day' as col1, avg("Weekly_Sales")
                from walmartinteg.sales
                where "Date" in ('2010-09-10', '2011-09-09', '2012-09-07')
                group by 1, 2)
                """
        elif label == "Thanksgiving":
            main_inner_query += """
                union
                (select date_part('year', "Date") as year, 'Thanksgiving' as col1, avg("Weekly_Sales")
                from walmartinteg.sales
                where "Date" in ('2010-11-26', '2011-11-25', '2012-11-23')
                group by 1, 2)
                """
        elif label == "Christmas":
            main_inner_query += """
                union
                (select date_part('year', "Date") as year, 'Christmas' as col1, avg("Weekly_Sales")
                from walmartinteg.sales
                where "Date" in ('2010-12-31', '2011-12-30', '2012-12-28')
                group by 1, 2)
                """

    #
    # construct attribute list select
    #
    attrib_labels = []
    for label in labels:
        if label == "year":
            continue
        attrib_labels.append(label)

    attribute_list_select = """select unnest(array[%s])""" % ("'" + "', '".join(attrib_labels) + "'")

    #
    # construct column definition
    #
    column_def_part = """mycol_def("Year" text, """
    for label in labels:
        if label == "year":
            continue
        column_def_part += "\"" + label + "\" numeric,"

    column_def_part = column_def_part[:-1]
    column_def_part += ")"

    overall_query = """
        SELECT *
        FROM   crosstab(
        $$
        select * from (
        %s
        ) mytab order by 1,
            case
                when col1 = 'All Year'     then 1
                when col1 = 'Super Bowl'   then 2
                when col1 = 'Labor Day'    then 3
                when col1 = 'Thanksgiving' then 4
                when col1 = 'Christmas'    then 5
            end
        $$,
        $$
        %s
        $$
        ) AS %s
        ;""" % (main_inner_query, attribute_list_select, column_def_part)

    return overall_query
