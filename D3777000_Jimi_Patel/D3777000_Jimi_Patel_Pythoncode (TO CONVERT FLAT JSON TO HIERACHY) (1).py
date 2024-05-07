import json

def create_hierarchy(flat_json):
    hierarchy = {
        "All": {
            "name": "superstore",
            "value": 0,
            "2014": 0,
            "2015": 0,
            "2016": 0,
            "2017": 0,
            "children": []
        },
        "South": {
            "name": "superstore",
            "value": 0,
            "2014": 0,
            "2015": 0,
            "2016": 0,
            "2017": 0,
            "children": []
        },
        "East": {
            "name": "superstore",
            "value": 0,
            "2014": 0,
            "2015": 0,
            "2016": 0,
            "2017": 0,
            "children": []
        },
        "West": {
            "name": "superstore",
            "value": 0,
            "2014": 0,
            "2015": 0,
            "2016": 0,
            "2017": 0,
            "children": []
        },
        "Central": {
            "name": "superstore",
            "value": 0,
            "2014": 0,
            "2015": 0,
            "2016": 0,
            "2017": 0,
            "children": []
        }
    }

    for item in flat_json:
        region = item["Region"]
        category = item["Category"]
        subcategory = item["Sub-Category"]
        product_name = item["Product Name"]
        sales = item["Sales"]
        order_date = item["Order Date"]
        year = int(order_date.split("/")[-1])

        # Update hierarchy for "All"
        all_children = hierarchy["All"]["children"]
        furniture_index = next((index for (index, d) in enumerate(all_children) if d["name"] == category), None)
        if furniture_index is None:
            all_children.append({
                "name": category,
                "value": 0,
                "2014": 0,
                "2015": 0,
                "2016": 0,
                "2017": 0,
                "children": []
            })
            furniture_index = len(all_children) - 1

        furniture_children = all_children[furniture_index]["children"]
        bookcases_index = next((index for (index, d) in enumerate(furniture_children) if d["name"] == subcategory), None)
        if bookcases_index is None:
            furniture_children.append({
                "name": subcategory,
                "value": 0,
                "2014": 0,
                "2015": 0,
                "2016": 0,
                "2017": 0,
                "children": []
            })
            bookcases_index = len(furniture_children) - 1

        bookcases_children = furniture_children[bookcases_index]["children"]
        bookcases_children.append({
            "name": product_name,
            "value": sales,
            "2014": sales if year == 2014 else 0,
            "2015": sales if year == 2015 else 0,
            "2016": sales if year == 2016 else 0,
            "2017": sales if year == 2017 else 0
        })

        # Update values for "All"
        hierarchy["All"]["value"] += sales
        hierarchy["All"]["2014"] += sales if year == 2014 else 0
        hierarchy["All"]["2015"] += sales if year == 2015 else 0
        hierarchy["All"]["2016"] += sales if year == 2016 else 0
        hierarchy["All"]["2017"] += sales if year == 2017 else 0

        all_children[furniture_index]["value"] += sales
        all_children[furniture_index]["2014"] += sales if year == 2014 else 0
        all_children[furniture_index]["2015"] += sales if year == 2015 else 0
        all_children[furniture_index]["2016"] += sales if year == 2016 else 0
        all_children[furniture_index]["2017"] += sales if year == 2017 else 0

        furniture_children[bookcases_index]["value"] += sales
        furniture_children[bookcases_index]["2014"] += sales if year == 2014 else 0
        furniture_children[bookcases_index]["2015"] += sales if year == 2015 else 0
        furniture_children[bookcases_index]["2016"] += sales if year == 2016 else 0
        furniture_children[bookcases_index]["2017"] += sales if year == 2017 else 0

        # Update hierarchy for region
        region_children = hierarchy[region]["children"]
        furniture_index = next((index for (index, d) in enumerate(region_children) if d["name"] == category), None)
        if furniture_index is None:
            region_children.append({
                "name": category,
                "value": 0,
                "2014": 0,
                "2015": 0,
                "2016": 0,
                "2017": 0,
                "children": []
            })
            furniture_index = len(region_children) - 1

        furniture_children = region_children[furniture_index]["children"]
        bookcases_index = next((index for (index, d) in enumerate(furniture_children) if d["name"] == subcategory), None)
        if bookcases_index is None:
            furniture_children.append({
                "name": subcategory,
                "value": 0,
                "2014": 0,
                "2015": 0,
                "2016": 0,
                "2017": 0,
                "children": []
            })
            bookcases_index = len(furniture_children) - 1

        bookcases_children = furniture_children[bookcases_index]["children"]
        bookcases_children.append({
            "name": product_name,
            "value": sales,
            "2014": sales if year == 2014 else 0,
            "2015": sales if year == 2015 else 0,
            "2016": sales if year == 2016 else 0,
            "2017": sales if year == 2017 else 0
        })

        # Update values for region
        hierarchy[region]["value"] += sales
        hierarchy[region]["2014"] += sales if year == 2014 else 0
        hierarchy[region]["2015"] += sales if year == 2015 else 0
        hierarchy[region]["2016"] += sales if year == 2016 else 0
        hierarchy[region]["2017"] += sales if year == 2017 else 0

        region_children[furniture_index]["value"] += sales
        region_children[furniture_index]["2014"] += sales if year == 2014 else 0
        region_children[furniture_index]["2015"] += sales if year == 2015 else 0
        region_children[furniture_index]["2016"] += sales if year == 2016 else 0
        region_children[furniture_index]["2017"] += sales if year == 2017 else 0

        furniture_children[bookcases_index]["value"] += sales
        furniture_children[bookcases_index]["2014"] += sales if year == 2014 else 0
        furniture_children[bookcases_index]["2015"] += sales if year == 2015 else 0
        furniture_children[bookcases_index]["2016"] += sales if year == 2016 else 0
        furniture_children[bookcases_index]["2017"] += sales if year == 2017 else 0

    return hierarchy

# Function to read input JSON file
def read_input_json(filename):
    with open(filename, "r") as file:
        data = json.load(file)
    return data

# Example input JSON file path
input_json_file = "superstorelast.json"

# Read input JSON file
flat_json = read_input_json(input_json_file)

# Create hierarchy
hierarchy_json = create_hierarchy(flat_json)

# Save JSON file
with open("firstnavratri.json", "w") as outfile:
    json.dump(hierarchy_json, outfile, indent=4)

print("Hierarchical data saved to navratri.json")
