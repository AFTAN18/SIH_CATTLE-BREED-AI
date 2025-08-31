#!/usr/bin/env python3
"""
Data Preparation Script for Cattle Breed Identification
Downloads and organizes Kaggle datasets for training
"""

import os
import shutil
import zipfile
import json
from pathlib import Path
import pandas as pd
from PIL import Image
import numpy as np
from sklearn.model_selection import train_test_split

class DataPreparator:
    def __init__(self):
        self.base_dir = Path("data")
        self.raw_dir = self.base_dir / "raw"
        self.processed_dir = self.base_dir / "processed"
        self.train_dir = self.processed_dir / "train"
        self.val_dir = self.processed_dir / "validation"
        self.test_dir = self.processed_dir / "test"
        
        # Target breeds for Indian context
        self.target_breeds = {
            # Cattle breeds
            'Gir': 'cattle',
            'Sahiwal': 'cattle', 
            'Red_Sindhi': 'cattle',
            'Tharparkar': 'cattle',
            'Rathi': 'cattle',
            'Hariana': 'cattle',
            'Kankrej': 'cattle',
            'Ongole': 'cattle',
            'Krishna_Valley': 'cattle',
            'Deoni': 'cattle',
            'Khillari': 'cattle',
            'Malvi': 'cattle',
            'Nimari': 'cattle',
            'Nagori': 'cattle',
            'Mewati': 'cattle',
            'Ponwar': 'cattle',
            'Bachaur': 'cattle',
            'Gaolao': 'cattle',
            'Dangi': 'cattle',
            'Amritmahal': 'cattle',
            'Hallikar': 'cattle',
            'Kangayam': 'cattle',
            'Pulikulam': 'cattle',
            'Umblachery': 'cattle',
            'Vechur': 'cattle',
            'Kasaragod': 'cattle',
            'Holstein_Friesian': 'cattle',
            'Jersey': 'cattle',
            'Brown_Swiss': 'cattle',
            'Crossbred': 'cattle',
            
            # Buffalo breeds
            'Murrah': 'buffalo',
            'Nili_Ravi': 'buffalo',
            'Bhadawari': 'buffalo',
            'Jaffarabadi': 'buffalo',
            'Mehsana': 'buffalo',
            'Nagpuri': 'buffalo',
            'Pandharpuri': 'buffalo',
            'Toda': 'buffalo',
            'Chilika': 'buffalo',
            'Kalahandi': 'buffalo',
            'Marathwadi': 'buffalo',
            'Godavari': 'buffalo',
            'Surti': 'buffalo'
        }
        
    def setup_directories(self):
        """Create directory structure"""
        directories = [
            self.raw_dir,
            self.processed_dir,
            self.train_dir,
            self.val_dir,
            self.test_dir
        ]
        
        for breed in self.target_breeds.keys():
            directories.extend([
                self.train_dir / breed,
                self.val_dir / breed,
                self.test_dir / breed
            ])
            
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def download_kaggle_data(self):
        """Download datasets using Kaggle API"""
        print("Downloading Kaggle datasets...")
        
        datasets = [
            {
                'name': 'lukex9442/indian-bovine-breeds',
                'extract_to': self.raw_dir / 'indian_bovine'
            },
            {
                'name': 'anandkumarsahu09/cattle-breeds-dataset', 
                'extract_to': self.raw_dir / 'cattle_breeds'
            }
        ]
        
        for dataset in datasets:
            print(f"Downloading {dataset['name']}...")
            
            # Create extraction directory
            dataset['extract_to'].mkdir(parents=True, exist_ok=True)
            
            # Download using Kaggle API
            download_cmd = f"kaggle datasets download -d {dataset['name']} -p {dataset['extract_to']}"
            os.system(download_cmd)
            
            # Extract zip files
            for zip_file in dataset['extract_to'].glob("*.zip"):
                with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                    zip_ref.extractall(dataset['extract_to'])
                zip_file.unlink()  # Remove zip file after extraction
                
    def validate_and_filter_images(self, image_path):
        """Validate image quality and format"""
        try:
            with Image.open(image_path) as img:
                # Check format
                if img.format not in ['JPEG', 'JPG', 'PNG']:
                    return False
                    
                # Check size
                if img.size[0] < 100 or img.size[1] < 100:
                    return False
                    
                # Check aspect ratio (not too extreme)
                aspect_ratio = max(img.size) / min(img.size)
                if aspect_ratio > 5:
                    return False
                    
                # Check if image is corrupted
                img.verify()
                return True
                
        except Exception:
            return False
            
    def organize_indian_bovine_data(self):
        """Organize Indian Bovine dataset"""
        source_dir = self.raw_dir / 'indian_bovine'
        
        if not source_dir.exists():
            print("Indian Bovine dataset not found. Please download first.")
            return
            
        print("Organizing Indian Bovine dataset...")
        
        # Map dataset folders to our breed names
        breed_mapping = {}
        
        for folder in source_dir.iterdir():
            if folder.is_dir():
                folder_name = folder.name
                # Try to match with our target breeds
                for breed in self.target_breeds.keys():
                    if breed.lower().replace('_', ' ') in folder_name.lower():
                        breed_mapping[folder] = breed
                        break
                        
        # Copy and organize images
        for source_folder, breed_name in breed_mapping.items():
            print(f"Processing {breed_name}...")
            
            images = []
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
                images.extend(source_folder.glob(ext))
                
            # Filter valid images
            valid_images = [img for img in images if self.validate_and_filter_images(img)]
            
            if len(valid_images) < 10:  # Skip breeds with too few images
                print(f"Skipping {breed_name}: only {len(valid_images)} valid images")
                continue
                
            # Split into train/val/test
            train_imgs, temp_imgs = train_test_split(valid_images, test_size=0.3, random_state=42)
            val_imgs, test_imgs = train_test_split(temp_imgs, test_size=0.5, random_state=42)
            
            # Copy images to respective directories
            for split, img_list in [('train', train_imgs), ('validation', val_imgs), ('test', test_imgs)]:
                split_dir = getattr(self, f"{split.replace('validation', 'val')}_dir") / breed_name
                
                for i, img_path in enumerate(img_list):
                    dest_path = split_dir / f"{breed_name}_{i:04d}.jpg"
                    
                    # Convert to RGB and save as JPEG
                    with Image.open(img_path) as img:
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        img.save(dest_path, 'JPEG', quality=95)
                        
            print(f"  {breed_name}: {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test")
            
    def organize_cattle_breeds_data(self):
        """Organize additional cattle breeds dataset"""
        source_dir = self.raw_dir / 'cattle_breeds'
        
        if not source_dir.exists():
            print("Cattle breeds dataset not found.")
            return
            
        print("Organizing additional cattle breeds dataset...")
        
        # Similar processing for the second dataset
        # This would supplement the main dataset
        
    def create_dataset_statistics(self):
        """Generate dataset statistics"""
        stats = {
            'total_breeds': len(self.target_breeds),
            'cattle_breeds': sum(1 for t in self.target_breeds.values() if t == 'cattle'),
            'buffalo_breeds': sum(1 for t in self.target_breeds.values() if t == 'buffalo'),
            'splits': {}
        }
        
        for split in ['train', 'val', 'test']:
            split_dir = getattr(self, f"{split}_dir")
            split_stats = {}
            total_images = 0
            
            for breed_dir in split_dir.iterdir():
                if breed_dir.is_dir():
                    image_count = len(list(breed_dir.glob('*.jpg')))
                    split_stats[breed_dir.name] = image_count
                    total_images += image_count
                    
            stats['splits'][split] = {
                'breeds': split_stats,
                'total_images': total_images
            }
            
        # Save statistics
        with open(self.processed_dir / 'dataset_stats.json', 'w') as f:
            json.dump(stats, f, indent=2)
            
        print(f"\nDataset Statistics:")
        print(f"Total breeds: {stats['total_breeds']}")
        print(f"Cattle breeds: {stats['cattle_breeds']}")
        print(f"Buffalo breeds: {stats['buffalo_breeds']}")
        
        for split, split_data in stats['splits'].items():
            print(f"{split.capitalize()}: {split_data['total_images']} images")
            
    def create_class_mapping(self):
        """Create class mapping for model training"""
        class_mapping = {
            'breed_to_id': {},
            'id_to_breed': {},
            'breed_types': self.target_breeds
        }
        
        for i, breed in enumerate(sorted(self.target_breeds.keys())):
            class_mapping['breed_to_id'][breed] = i
            class_mapping['id_to_breed'][i] = breed
            
        with open(self.processed_dir / 'class_mapping.json', 'w') as f:
            json.dump(class_mapping, f, indent=2)
            
        return class_mapping

def main():
    """Main data preparation pipeline"""
    print("🐄 Preparing Cattle Breed Dataset for Training")
    print("=" * 50)
    
    preparator = DataPreparator()
    
    # Setup directory structure
    print("Setting up directories...")
    preparator.setup_directories()
    
    # Download datasets (requires Kaggle API setup)
    try:
        preparator.download_kaggle_data()
    except Exception as e:
        print(f"Error downloading data: {e}")
        print("Please download datasets manually and place in data/raw/")
        
    # Organize datasets
    preparator.organize_indian_bovine_data()
    preparator.organize_cattle_breeds_data()
    
    # Generate statistics and mappings
    preparator.create_dataset_statistics()
    preparator.create_class_mapping()
    
    print("\n✅ Data preparation completed!")
    print("📁 Organized data available in data/processed/")

if __name__ == "__main__":
    main()
