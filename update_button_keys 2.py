import json

# EN Updates
en_path = "/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio/messages/en.json"
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

en_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["select_button"] = "Select"
en_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["selected_badge"] = "Selected Industry"
en_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["change_button"] = "Change Industry"
en_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["clear_button"] = "Clear All"

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

# ES Updates
es_path = "/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio/messages/es.json"
with open(es_path, 'r', encoding='utf-8') as f:
    es_data = json.load(f)

es_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["select_button"] = "Seleccionar"
es_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["selected_badge"] = "Industria Seleccionada"
es_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["change_button"] = "Cambiar Industria"
es_data["Pricing"]["infrastructure_comparison"]["industry_labels"]["clear_button"] = "Limpiar Todo"

with open(es_path, 'w', encoding='utf-8') as f:
    json.dump(es_data, f, indent=2, ensure_ascii=False)

print("Successfully updated translation keys for buttons")
