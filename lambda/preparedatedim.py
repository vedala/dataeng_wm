import json
import subprocess

def handler(event, context):
    # call first python
    subprocess.run(['./cp_from_s3.py']

    # call bash
    subprocess.run(['./prepare_datedim.sh']

    # call second python
    subprocess.run(['./cp_to_s3.py']
    
    return {
        'statusCode': 200,
        'body': "Success"
    }
