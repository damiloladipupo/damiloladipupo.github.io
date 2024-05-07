import json
import matplotlib.pyplot as plt

# Sample hierarchical data
hierarchy = {
    2015: {
        4: {
            10: [
                {"Product Name": "Bretford CR4500 Series Slim Rectangular Table", "Quantity": 5}
            ]
        }
    },
    2016: {
        2: {
            6: [
                {"Product Name": "Self-Adhesive Address Labels for Typewriters by Universal", "Quantity": 2}
            ]
        },
        4: {
            11: [
                {"Product Name": "Bush Somerset Collection Bookcase", "Quantity": 2},
                {"Product Name": "Hon Deluxe Fabric Upholstered Stacking Chairs, Rounded Back", "Quantity": 3}
            ]
        }
    }
}

# Save hierarchical data to JSON file
with open('hierarchy.json', 'w') as json_file:
    json.dump(hierarchy, json_file, indent=4)

# Visualize graph of month and product quantity
months = []
quantities = []

for year, quarters in hierarchy.items():
    for quarter, months_data in quarters.items():
        for month, products in months_data.items():
            months.append(month)
            quantities.append(sum(product['Quantity'] for product in products))

plt.bar(months, quantities)
plt.xlabel('Month')
plt.ylabel('Total Quantity')
plt.title('Total Quantity of Products per Month')
plt.xticks(months)
plt.grid(True)
plt.show()
