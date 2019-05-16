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

    start_year = event['queryStringParameters'].get('startYear')
    end_year = event['queryStringParameters'].get('endYear')

    if start_year and end_year:
        query = \
            """select date_part('year', datedim."Date") as year, count(distinct "DateKey") as num_weeks
            from walmartinteg2.sales
            inner join walmartinteg2.date_dimension as datedim on "DateKey" = datedim."Id"
                and date_part('year', datedim."Date") >= %s
                and date_part('year', datedim."Date") <= %s
            group by 1
            order by 1""" % (start_year, end_year)
    elif start_year:
        query = \
            """select date_part('year', datedim."Date") as year, count(distinct "DateKey") as num_weeks
            from walmartinteg2.sales
            inner join walmartinteg2.date_dimension as datedim on "DateKey" = datedim."Id"
                and date_part('year', datedim."Date") >= %s
            group by 1
            order by 1""" % (start_year)
    elif end_year:
        query = \
            """select date_part('year', datedim."Date") as year, count(distinct "DateKey") as num_weeks
            from walmartinteg2.sales
            inner join walmartinteg2.date_dimension as datedim on "DateKey" = datedim."Id"
                and date_part('year', datedim."Date") <= %s
            group by 1
            order by 1""" % (end_year)
    else:
        query = \
            """select date_part('year', datedim."Date") as year, count(distinct "DateKey") as num_weeks
            from walmartinteg2.sales
            inner join walmartinteg2.date_dimension as datedim on "DateKey" = datedim."Id"
            group by 1
            order by 1"""

    with conn.cursor() as cur:
        rows = []
        cur.execute(query)
        for row in cur:
            rows.append(row)

    return_dict = {
        'statusCode': 200,
        'body': rows
    }

    return return_dict
