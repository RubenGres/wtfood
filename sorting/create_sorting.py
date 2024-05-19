label_list = """
working conditions
fair trade
consumer rights
water consumption
global emissions
france
spain
portugal
Working Conditions
Fair Trade
Consumer Rights
Water Usage
Emissions Reduction
French Cuisine
Spanish Gastronomy
Portuguese Dishes
Agricultural Subsidies
Food Waste
GMOs
Organic Farming
Labeling Regulations
Food Safety
Nutrition Education
Food Insecurity
Urban Agriculture
Indigenous Sovereignty
Agroforestry
Sustainable Aquaculture
Packaging Impact
Farm-to-Table
Livestock Welfare
Plant-Based Diets
Food Additives
Allergies
School Lunches
Industry Consolidation
Foodborne Illnesses
Agricultural Technology
Food Sovereignty
Food Deserts
Land Grabbing
Sustainable Fishing
Food Tourism
Cultural Appropriation
Community-Supported
Food Transportation
Climate Adaptation
Indigenous Rights
Culinary Education
Lobbying Influence
Biodiversity Preservation
Food Cooperatives
Food Justice
Urban Policy
Cultural Heritage
Knowledge Transfer
Traceability Systems
Future Innovations
"""

labels = label_list.split("\n")

import requests

sortings = {}
for label in labels:
    answer = requests.get(f"https://6z8wzg7gc62klm-5000.proxy.runpod.net/sort?x=Spanish Gastronomy&y={label}")
    answer_dict = answer.json()
    
    label_sorting = {}
    for k in answer_dict:
        label_sorting[k] = answer_dict[k]["y"]



    sortings[label] = label_sorting
    print("label", label)


import json
with open("sortings.json", "w") as outfile: 
    json.dump(sortings, outfile)
