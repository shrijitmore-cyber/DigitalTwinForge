import pickle
from pathlib import Path

model_path = Path("d:/digital_twin/backend/data/quantile_models.pkl")
with open(model_path, "rb") as f:
    bundle = pickle.load(f)

print("Sensors in model:", bundle.get("sensors"))
print("Features in model:", bundle.get("features"))
print("Spec columns in model:", bundle.get("spec_columns"))
