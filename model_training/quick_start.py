#!/usr/bin/env python3
"""
Quick Start Training Script for Cattle Breed Identification
Simplified version that checks dependencies and provides setup instructions
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required. Current version:", sys.version)
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_and_install_packages():
    """Check and install required packages"""
    required_packages = [
        'tensorflow',
        'kaggle', 
        'pillow',
        'numpy',
        'pandas',
        'matplotlib',
        'scikit-learn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} missing")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install'
            ] + missing_packages)
            print("✅ All packages installed successfully!")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install packages: {e}")
            return False
    
    return True

def setup_kaggle_api():
    """Setup Kaggle API credentials"""
    kaggle_dir = Path.home() / '.kaggle'
    credentials_file = kaggle_dir / 'kaggle.json'
    
    if credentials_file.exists():
        print("✅ Kaggle credentials found")
        return True
    
    print("\n🔑 Kaggle API Setup Required:")
    print("1. Go to https://www.kaggle.com/account")
    print("2. Scroll to 'API' section")
    print("3. Click 'Create New API Token'")
    print("4. Download kaggle.json")
    print(f"5. Place it at: {credentials_file}")
    
    # Create .kaggle directory
    kaggle_dir.mkdir(exist_ok=True)
    
    return False

def download_sample_data():
    """Download a small sample dataset for testing"""
    print("\n📥 Downloading sample data for testing...")
    
    # Create sample data structure
    data_dir = Path('data/sample')
    breeds = ['Gir', 'Sahiwal', 'Murrah', 'Holstein_Friesian']
    
    for breed in breeds:
        for split in ['train', 'validation', 'test']:
            (data_dir / split / breed).mkdir(parents=True, exist_ok=True)
    
    print("✅ Sample data structure created")
    print("📁 You can add sample images to data/sample/train/[breed_name]/")

def create_minimal_trainer():
    """Create a minimal training script for testing"""
    trainer_code = '''
import tensorflow as tf
from tensorflow import keras
import numpy as np
from pathlib import Path

def create_simple_model(num_classes=4):
    """Create a simple CNN model for testing"""
    model = keras.Sequential([
        keras.layers.Conv2D(32, 3, activation='relu', input_shape=(224, 224, 3)),
        keras.layers.MaxPooling2D(),
        keras.layers.Conv2D(64, 3, activation='relu'),
        keras.layers.MaxPooling2D(),
        keras.layers.Conv2D(64, 3, activation='relu'),
        keras.layers.GlobalAveragePooling2D(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def main():
    print("🐄 Testing Cattle Breed Model Training")
    
    # Create sample model
    model = create_simple_model()
    print(f"✅ Model created with {model.count_params():,} parameters")
    
    # Create dummy data for testing
    x_train = np.random.random((100, 224, 224, 3))
    y_train = keras.utils.to_categorical(np.random.randint(4, size=(100, 1)), 4)
    
    print("🚀 Starting test training...")
    model.fit(x_train, y_train, epochs=2, verbose=1)
    
    # Save model
    model.save('test_model.h5')
    print("✅ Test training completed!")

if __name__ == "__main__":
    main()
'''
    
    with open('test_trainer.py', 'w') as f:
        f.write(trainer_code)
    
    print("✅ Minimal trainer created: test_trainer.py")

def main():
    """Main setup and training initiation"""
    print("🐄 Bharat Pashudhan Model Training Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install packages
    if not check_and_install_packages():
        print("❌ Package installation failed. Please install manually:")
        print("pip install tensorflow kaggle pillow numpy pandas matplotlib scikit-learn")
        return
    
    # Setup Kaggle
    kaggle_ready = setup_kaggle_api()
    
    # Create sample data structure
    download_sample_data()
    
    # Create minimal trainer for testing
    create_minimal_trainer()
    
    print("\n🚀 Next Steps:")
    
    if kaggle_ready:
        print("1. Run: python data_preparation.py")
        print("2. Run: python train_model.py")
    else:
        print("1. Setup Kaggle API credentials")
        print("2. Test with: python test_trainer.py")
        print("3. Then run full training pipeline")
    
    print("\n✅ Setup completed!")

if __name__ == "__main__":
    main()
