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

    qs_param = event['queryStringParameters']
    all_or_pick = event['queryStringParameters'].get('allOrPick')
    selected_holidays = event['queryStringParameters'].get('selectedHolidays')

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

    query = construct_query(labels)

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
        (select date_part('year', datedim."Date") as year,
                'All Year' as holiday_name,
                sum("Weekly_Sales") / count(distinct "Store") / count(distinct "DateKey") as avg_weekly_sales
        from walmartinteg2.sales
        inner join walmartinteg2.date_dimension datedim on sales."DateKey" = datedim."Id"
        group by 1)
    """

    #
    # Construct holiday list for where-in clause
    #
    holiday_list = "("
    for label in labels:
        if label == "year" or label == "All Year":
            continue

        holiday_list += "'%s'," % label

    holiday_list = holiday_list[:-1]
    holiday_list += ")"
    
    main_inner_query += """
        union
        (select year, holiday_name, avg(sum_weekly_sales) as avg_weekly_sales
        from
            (select date_part('year', datedim."Date") as year,
                "Store",
                datedim."HolidayName" as holiday_name,
                sum("Weekly_Sales") as sum_weekly_sales
            from walmartinteg2.sales as sales
            inner join walmartinteg2.date_dimension as datedim on datedim."Id" = sales."DateKey"
            where datedim."HolidayName" in %s
            group by year, "Store", holiday_name
            ) as sum_query
        group by 1, 2)""" % holiday_list

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
                when holiday_name = 'All Year'     then 1
                when holiday_name = 'Super Bowl'   then 2
                when holiday_name = 'Labor Day'    then 3
                when holiday_name = 'Thanksgiving' then 4
                when holiday_name = 'Christmas'    then 5
            end
        $$,
        $$
        %s
        $$
        ) AS %s
        ;""" % (main_inner_query, attribute_list_select, column_def_part)

    return overall_query
