import sys
import csv
import json

csv.field_size_limit(sys.maxsize)

# csvfile = open('seitest.csv', 'r')
csvfile = open('emissions_ships.csv', 'r')
# csvfile = open('testfile2.csv', 'r')

fieldnames = ("HS2", "HS4", "imo", "date", "departure_port", "departure_lat", "departure_lon", "arrival_port", "arrival_lat", "arrival_lon", "arrival_country", "total_weight_tonnes", "country_type", "country_region", "country_name", "HS2_desc", "HS4_desc", "HS6", "HS6_DESC", "HS8", "HS8_desc", "total_value_usd", "total_co2")
reader = csv.DictReader( csvfile, fieldnames)
# reader = csv.reader(csvfile, delimiter='\t', quoting=csv.QUOTE_NONE)
i = 0;
final = []
lista = []
regions = ["South-eastern Asia","Southern Asia","Eastern Asia","Western Asia","Eastern Europe","Northern Europe","Western Europe","Southern Europe","Northern Africa","Sub-Saharan Africa","Latin America and the Caribbean","Northern America"]
brazil = {"name":'Brazil','color':{"colorR": 0, "colorG": 0, "colorB": 0},"children":[]}

color_scheme = [{"name": "South-eastern Asia", "color": {"colorR": 238, "colorG": 99, "colorB": 99}}, 
{"name": "Southern Asia", "color":{"colorR": 238, "colorG": 158, "colorB": 99}}, 
{"name": "Eastern Asia", "color":{"colorR": 238, "colorG": 220, "colorB": 99}}, 
{"name": "Western Asia", "color":{"colorR": 204, "colorG": 238, "colorB": 99}}, 
{"name": "Eastern Europe", "color":{"colorR": 99, "colorG": 238, "colorB": 99}}, 
{"name": "Northern Europe", "color":{"colorR": 99, "colorG": 238, "colorB": 171}}, 
{"name": "Western Europe", "color":{"colorR": 99, "colorG": 238, "colorB": 210}}, 
{"name": "Southern Europe", "color":{"colorR": 99, "colorG": 187, "colorB": 238}}, 
{"name": "Northern Africa", "color":{"colorR": 102, "colorG": 99, "colorB": 238}}, 
{"name": "Sub-Saharan Africa", "color":{"colorR": 148, "colorG": 99, "colorB": 238}}, 
{"name": "Latin America and the Caribbean", "color":{"colorR": 207, "colorG": 99, "colorB": 238}}, 
{"name": "Northern America", "color":{"colorR": 238, "colorG": 99, "colorB": 187}}];



# color_scheme = [{"name": "Latin America and the Caribbean", "color": {"colorR": 238, "colorG": 99, "colorB": 99}}, 
# {"name": "Southern Asia", "color":{"colorR": 238, "colorG": 158, "colorB": 99}}, 
# {"name": "South-eastern Asia", "color":{"colorR": 238, "colorG": 220, "colorB": 99}}, 
# {"name": "Western Europe", "color":{"colorR": 204, "colorG": 238, "colorB": 99}}, 
# {"name": "Eastern Asia", "color":{"colorR": 99, "colorG": 238, "colorB": 99}}, 
# {"name": "Southern Europe", "color":{"colorR": 99, "colorG": 238, "colorB": 171}}, 
# {"name": "Northern Europe", "color":{"colorR": 99, "colorG": 238, "colorB": 210}}, 
# {"name": "Northern America", "color":{"colorR": 99, "colorG": 187, "colorB": 238}}, 
# {"name": "Northern Africa", "color":{"colorR": 102, "colorG": 99, "colorB": 238}}, 
# {"name": "Sub-Saharan Africa", "color":{"colorR": 148, "colorG": 99, "colorB": 238}}, 
# {"name": "Eastern Europe", "color":{"colorR": 207, "colorG": 99, "colorB": 238}}, 
# {"name": "Western Asia", "color":{"colorR": 238, "colorG": 99, "colorB": 187}}];



for row in reader:
	lista.append(row);

# for item in lista:
# 	if i > 0:
# 		region = item['country_region']
# 		if (region not in regions):
# 			regions.append(item['country_region']);
# 	i += 1

for region in regions:
	tempcolor = {"colorR": 0, "colorG": 0, "colorB": 0}
	for continent in color_scheme:
		if continent['name'] == region:
			tempcolor = continent['color']
	
	temp = {'name': region,'color':tempcolor ,'children': []}

	for item in lista:
		if (item['country_region'] == region):
			if not temp['children']:
				temp['children'].append({'name':item['country_name'],'children' : []})
			else:
				tempchildren = [];
				for child in temp['children']:
					tempchildren.append(child['name'])

				if (item['country_name'] not in tempchildren):
					temp['children'].append({'name':item['country_name'],'children' : []})

	final.append(temp)

print('First section done, we got a list of regions and countries!')

for row in lista:
	for region in final:
		for country in region['children']:
			if row['country_name'] == country['name']:
				if not country['children']:
					tdict = {"name":row['HS2_desc'],"size": int(float(row['total_co2']))}
					country['children'].append(tdict)
				else:
					temptemp = []
					for child in country['children']:
						temptemp.append(child['name'])

					if row['HS2_desc'] not in temptemp:
						tdict = {"name":row['HS2_desc'],"size": int(float(row['total_co2']))}
						country['children'].append(tdict)	
					else:
						child['size'] = child['size'] + int(float(row['total_co2']))
						# child['size'] = 10

print('Second section is done, we got a tree with cargo types')

def colorPicker(parent, index, region = None):
	parentColor = parent['color']
	if(region):
		parentColor = region['color']

	scalar = (index+1)*20
	ncp = len(parent['children'])

	rDiff = int((parentColor['colorR']/ncp)/2 + scalar)
	gDiff = int((parentColor['colorG']/ncp)/2 + scalar)
	bDiff = int((parentColor['colorB']/ncp)/2 + scalar)

	newR = -1;
	newG = -1;
	newB = -1;
	i = 1;
	while(newR <= 0 and newB <= 0 and newG <= 0):
		newR = parentColor['colorR']-(rDiff/i)
		newG = parentColor['colorG']-(gDiff/i)
		newB = parentColor['colorB']-(bDiff/i)
		i += 1;

	return {"colorR": newR, "colorG": newG, "colorB": newB}
# co2min = int(float(100000000))
# Percentage now
co2min = 4

def percentage(part, whole):
  return 100 * float(part)/float(whole)

for region in final:
	for index, country in enumerate(region['children']):
		# Add color to each country
		country['color'] = colorPicker(region, index)
		# Add "Other to children"
		templist = []
		totalco2 = int(float(0))
		for child in country['children']:
			totalco2 += child['size']

		# cargolist = []
		otherco2 = int(float(0))
		for i in range(0, len(country['children'])):
			lookat = country['children'].pop(0)

			if percentage(lookat['size'],totalco2) < co2min:
				# Add size to other
				otherco2 += lookat['size']
				# if lookat['name'] not in cargolist:
				# 	cargolist.append(lookat['name'])
			else:
				# add back to list
				templist.append(lookat)
		if otherco2 > 0:
			# templist.append({"name":"Other","size": otherco2, "cargos":cargolist})
			templist.append({"name":"Other","size": otherco2})
		country['children'] = templist

		# Add color to each cargo
		for index, cargo in enumerate(country['children']):
			cargo['color'] = colorPicker(country, index, region)

brazil['children'] = final


with open('data.json', 'w') as outfile:
    json.dump(brazil, outfile)

print('Done! Grouped by other if co2 smaller than co2min')



