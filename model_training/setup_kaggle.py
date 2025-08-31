#!/usr/bin/env python3
"""
Kaggle API Setup and Dataset Download Script
Automates the process of setting up Kaggle credentials and downloading datasets
"""

import os
import json
import subprocess
import sys
from pathlib import Path

def setup_kaggle_credentials():
    """Setup Kaggle API credentials"""
    print("🔑 Setting up Kaggle API credentials...")
    
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_dir.mkdir(exist_ok=True)
    
    credentials_file = kaggle_dir / 'kaggle.json'
    
    if credentials_file.exists():
        print("✅ Kaggle credentials already exist")
        return True
    
    print("\n📋 To use Kaggle API, you need to:")
    print("1. Go to https://www.kaggle.com/account")
    print("2. Scroll to 'API' section")
    print("3. Click 'Create New API Token'")
    print("4. Download kaggle.json file")
    print("5. Place it in your home directory/.kaggle/")
    
    # Interactive setup
    print(f"\n📁 Expected location: {credentials_file}")
    
    if input("\nHave you downloaded kaggle.json? (y/n): ").lower() == 'y':
        json_path = input("Enter path to kaggle.json file: ").strip()
        
        if Path(json_path).exists():
            import shutil
            shutil.copy(json_path, credentials_file)
            credentials_file.chmod(0o600)  # Set proper permissions
            print("✅ Kaggle credentials setup complete!")
            return True
        else:
            print("❌ File not found. Please check the path.")
            return False
    
    return False

def install_dependencies():
    """Install required packages"""
    print("📦 Installing required packages...")
    
    packages = [
        'kaggle',
        'tensorflow>=2.13.0',
        'pillow',
        'numpy',
        'pandas',
        'matplotlib',
        'seaborn',
        'scikit-learn'
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")

def download_datasets():
    """Download Kaggle datasets"""
    print("⬇️ Downloading Kaggle datasets...")
    
    datasets = [
        {
            'name': 'lukex9442/indian-bovine-breeds',
            'size': '~3GB',
            'description': 'Indian Bovine Breeds Dataset'
        },
        {
            'name': 'anandkumarsahu09/cattle-breeds-dataset',
            'size': '~200MB',
            'description': 'Cattle Breeds Dataset'
        }
    ]
    
    data_dir = Path('data/raw')
    data_dir.mkdir(parents=True, exist_ok=True)
    
    for dataset in datasets:
        print(f"\n📥 Downloading {dataset['description']} ({dataset['size']})...")
        
        try:
            cmd = f"kaggle datasets download -d {dataset['name']} -p {data_dir}"
            subprocess.run(cmd, shell=True, check=True)
            print(f"✅ Downloaded {dataset['name']}")
            
            # Extract zip files
            for zip_file in data_dir.glob("*.zip"):
                print(f"📦 Extracting {zip_file.name}...")
                import zipfile
                with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                    extract_dir = data_dir / zip_file.stem
                    extract_dir.mkdir(exist_ok=True)
                    zip_ref.extractall(extract_dir)
                zip_file.unlink()  # Remove zip after extraction
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to download {dataset['name']}: {e}")
            print("Please check your Kaggle credentials and internet connection")

def verify_datasets():
    """Verify downloaded datasets"""
    print("\n🔍 Verifying downloaded datasets...")
    
    data_dir = Path('data/raw')
    
    expected_dirs = [
        'indian-bovine-breeds',
        'cattle-breeds-dataset'
    ]
    
    for dir_name in expected_dirs:
        dir_path = data_dir / dir_name
        if dir_path.exists():
            file_count = len(list(dir_path.rglob('*.*')))
            print(f"✅ {dir_name}: {file_count} files found")
        else:
            print(f"❌ {dir_name}: Not found")

def main():
    """Main setup script"""
    print("🐄 Kaggle Dataset Setup for Cattle Breed Identification")
    print("=" * 60)
    
    # Install dependencies
    install_dependencies()
    
    # Setup Kaggle credentials
    if not setup_kaggle_credentials():
        print("❌ Cannot proceed without Kaggle credentials")
        return
    
    # Download datasets
    download_datasets()
    
    # Verify datasets
    verify_datasets()
    
    print("\n✅ Setup completed!")
    print("\n🚀 Next steps:")
    print("1. Run: python data_preparation.py")
    print("2. Run: python train_model.py")

if __name__ == "__main__":
    main()
