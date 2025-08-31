# 🚀 Cattle Breed Model Training Guide

## Prerequisites Setup

### 1. Install Python Dependencies
```bash
pip install tensorflow>=2.13.0 kaggle pillow numpy pandas matplotlib seaborn scikit-learn tensorflowjs
```

### 2. Setup Kaggle API
1. Go to https://www.kaggle.com/account
2. Scroll to "API" section
3. Click "Create New API Token"
4. Download `kaggle.json`
5. Place it in `~/.kaggle/kaggle.json` (Windows: `C:\Users\{username}\.kaggle\kaggle.json`)
6. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

## Training Process

### Step 1: Download Datasets
```bash
# Navigate to model_training directory
cd model_training

# Download primary dataset (3GB)
kaggle datasets download -d lukex9442/indian-bovine-breeds -p data/raw/

# Download secondary dataset (200MB)  
kaggle datasets download -d anandkumarsahu09/cattle-breeds-dataset -p data/raw/

# Extract datasets
python -c "
import zipfile
from pathlib import Path

# Extract Indian Bovine dataset
with zipfile.ZipFile('data/raw/indian-bovine-breeds.zip', 'r') as zip_ref:
    zip_ref.extractall('data/raw/indian_bovine/')

# Extract Cattle Breeds dataset
with zipfile.ZipFile('data/raw/cattle-breeds-dataset.zip', 'r') as zip_ref:
    zip_ref.extractall('data/raw/cattle_breeds/')

print('✅ Datasets extracted successfully!')
"
```

### Step 2: Prepare Data
```bash
python data_preparation.py
```

### Step 3: Train Model
```bash
python train_model.py
```

## Expected Training Timeline

- **Data Download**: 10-30 minutes (depending on internet speed)
- **Data Preparation**: 5-15 minutes
- **Model Training**: 2-4 hours (50 epochs)
- **Model Conversion**: 5-10 minutes

## Training Output

The training will generate:
- `models/tfjs_model/` - TensorFlow.js model for web deployment
- `models/cattle_breed_model/` - Full TensorFlow model
- `results/confusion_matrix.png` - Model evaluation
- `results/training_history.png` - Training progress
- `logs/training_log.csv` - Training metrics

## Integration with App

After training completes, integrate the model:

1. Copy TensorFlow.js model files:
```bash
cp -r models/tfjs_model/* ../public/models/
```

2. Update AI service to use real model instead of mock
