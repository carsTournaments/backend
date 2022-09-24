import json
import os
import sys
from dotenv import load_dotenv

load_dotenv()
path_project = os.getenv('PATH_PROJECT')
type_log = "all"
order_log = ""

if len(sys.argv) > 1:
    type_log = sys.argv[1]
if len(sys.argv) > 2:
    order_log = sys.argv[2].split(":")

logs_path = path_project + '/logs/' + type_log + '.log'

logs = []
log_file = open(logs_path, 'r')

for line in log_file:
    line = line.split(' | ')
    if len(line) == 3:
        date = line[0]
        level = line[1]
        message = line[2].strip()
        logs.append({
            "date": date,
            "level": level,
            "message": message,
        })


def sort_list(e):
    return e[order_log[0]]


if order_log != "":
    reverse = True
    if order_log[1] == "asc":
        reverse = False
    logs.sort(reverse=reverse, key=sort_list)
else:
    logs.reverse()


print(json.dumps(logs))
