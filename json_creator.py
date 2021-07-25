#!/usr/bin/python3
from pprint import pprint
import json

with open('./data/archivo_prueba_front_end_v2.csv') as f:
    file = f.readlines()

data = []
for item in file:
    line = item.split(",")
    if line[0] == "timestamp":
        continue
    temp_dictionary = {}
    temp_dictionary['timestamp'] = int(line[0])
    temp_dictionary['utilizacion_turno_porcentual'] = float(line[1])
    # print(line[2])
    # print(type(line[2]))
    d = json.loads(line[2].replace('\'', "\""))
    temp_dictionary['context_utilizacion_turno'] = d
    temp_dictionary['date'] = line[3].replace("\n", "")
    data.append(temp_dictionary)

print(data)
    