#!/usr/bin/python

import boto3
import logging
import os
import sys

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')

src_bucket_name  = os.environ.get('SRC_BUCKET_NAME')
src_file_names  = os.environ.get('SRC_FILE_NAMES')

src_file_names_arr = src_file_names.split(',')
for src_file_name in src_file_names_arr:
    dest_file_name = '/tmp/%s' % src_file_name
    s3.download_file(src_bucket_name, src_file_name, dest_file_name)

logger.info("SUCCESS: Downloaded files from s3 successfully")

sys.exit(0)
