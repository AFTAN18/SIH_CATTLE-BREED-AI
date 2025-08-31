@echo off
echo 🐄 Bharat Pashudhan Cattle Breed Model Training
echo ================================================

echo.
echo 📦 Installing Python dependencies...
pip install tensorflow>=2.13.0 kaggle pillow numpy pandas matplotlib seaborn scikit-learn tensorflowjs

echo.
echo 🔍 Checking Python installation...
python --version

echo.
echo 📁 Creating directory structure...
mkdir data\raw 2>nul
mkdir data\processed 2>nul
mkdir models 2>nul
mkdir results 2>nul
mkdir logs 2>nul

echo.
echo 🚀 Starting training pipeline...
echo.
echo ⚠️  IMPORTANT: Make sure you have:
echo    1. Kaggle API credentials in ~/.kaggle/kaggle.json
echo    2. At least 10GB free disk space
echo    3. Stable internet connection for dataset download
echo.

pause

echo.
echo 📥 Step 1: Downloading datasets (this may take 10-30 minutes)...
kaggle datasets download -d lukex9442/indian-bovine-breeds -p data/raw/
kaggle datasets download -d anandkumarsahu09/cattle-breeds-dataset -p data/raw/

echo.
echo 📦 Step 2: Extracting datasets...
python -c "import zipfile; from pathlib import Path; zipfile.ZipFile('data/raw/indian-bovine-breeds.zip').extractall('data/raw/indian_bovine/'); zipfile.ZipFile('data/raw/cattle-breeds-dataset.zip').extractall('data/raw/cattle_breeds/'); print('✅ Datasets extracted!')"

echo.
echo 🔄 Step 3: Preparing data...
python data_preparation.py

echo.
echo 🧠 Step 4: Training model (this will take 2-4 hours)...
python train_model.py

echo.
echo ✅ Training completed! Check the following directories:
echo    - models/tfjs_model/ (for web deployment)
echo    - results/ (evaluation results)
echo    - logs/ (training logs)

pause
