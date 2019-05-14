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

    all_or_pick = event['queryStringParameters'].get('allOrPick')
    selected_holidays = event['queryStringParameters'].get('selectedHolidays')
    print(selected_holidays)

    labels = ["year", "All Year", "Super Bowl", "Labor Day",
                                                "Thanksgiving", "Christmas"]
    rows = [
        [2010, 5000, 5200, 5400, 5600, 5800],
        [2011, 6000, 7200, 7400, 7600, 7800],
        [2012, 8000, 8200, 8400, 8600, 8800],
    ]
    print(labels)
    print(rows)

    return_dict = {
        'statusCode': 200,
        'body': {
            'rows': rows,
            'labels': labels
        }
    }

    return return_dict
