#!/usr/bin/python

import boto3
import logging
import os
import sys

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3',
            aws_access_key_id=os.environ.get('ACCESS_KEY'),
            aws_secret_access_key=os.environ.get('SECRET_KEY'))

dest_bucket_name  = os.environ.get('DEST_BUCKET_NAME')
created_file_names  = os.environ.get('CREATED_FILE_NAMES')

created_file_names_arr = created_file_names.split(',')
for created_file_name in created_file_names_arr:
    file_name_with_path = '/tmp/%s' % created_file_name
    s3.upload_file(file_name_with_path, dest_bucket_name, created_file_name)

logger.info("SUCCESS: Uploaded files to s3 successfully")

sys.exit(0)
