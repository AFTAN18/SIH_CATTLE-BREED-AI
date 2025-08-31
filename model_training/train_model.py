#!/usr/bin/env python3
"""
Cattle Breed Identification Model Training Script
Trains a TensorFlow model on Kaggle datasets for 43 Indian cattle and buffalo breeds
"""

import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import zipfile
import requests
from PIL import Image
import cv2

# Configuration
CONFIG = {
    'model_name': 'bharat_pashudhan_cattle_classifier',
    'image_size': (224, 224),
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.001,
    'validation_split': 0.2,
    'test_split': 0.1,
    'num_classes': 43,
    'early_stopping_patience': 10,
    'reduce_lr_patience': 5
}

# Indian Cattle and Buffalo Breeds (43 total)
BREED_CLASSES = {
    # Cattle Breeds (30)
    'cattle': [
        'Gir', 'Sahiwal', 'Red_Sindhi', 'Tharparkar', 'Rathi', 'Hariana',
        'Kankrej', 'Ongole', 'Krishna_Valley', 'Deoni', 'Khillari', 'Malvi',
        'Nimari', 'Nagori', 'Mewati', 'Ponwar', 'Bachaur', 'Gaolao',
        'Dangi', 'Amritmahal', 'Hallikar', 'Kangayam', 'Pulikulam', 'Umblachery',
        'Vechur', 'Kasaragod', 'Holstein_Friesian', 'Jersey', 'Brown_Swiss', 'Crossbred'
    ],
    # Buffalo Breeds (13)
    'buffalo': [
        'Murrah', 'Nili_Ravi', 'Bhadawari', 'Jaffarabadi', 'Mehsana',
        'Nagpuri', 'Pandharpuri', 'Toda', 'Chilika', 'Kalahandi',
        'Marathwadi', 'Godavari', 'Surti'
    ]
}

class CattleBreedTrainer:
    def __init__(self, config):
        self.config = config
        self.model = None
        self.history = None
        self.class_names = []
        
    def setup_directories(self):
        """Create necessary directories for training"""
        directories = [
            'data/raw',
            'data/processed',
            'models',
            'logs',
            'results'
        ]
        for dir_path in directories:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            
    def download_kaggle_datasets(self):
        """Download and extract Kaggle datasets"""
        print("Setting up Kaggle datasets...")
        
        # Instructions for manual download (Kaggle API requires authentication)
        datasets = [
            {
                'name': 'Indian Bovine Breeds',
                'url': 'https://www.kaggle.com/datasets/lukex9442/indian-bovine-breeds',
                'command': 'kaggle datasets download -d lukex9442/indian-bovine-breeds'
            },
            {
                'name': 'Cattle Breeds Dataset',
                'url': 'https://www.kaggle.com/datasets/anandkumarsahu09/cattle-breeds-dataset',
                'command': 'kaggle datasets download -d anandkumarsahu09/cattle-breeds-dataset'
            }
        ]
        
        print("\nTo download datasets, run these commands after setting up Kaggle API:")
        for dataset in datasets:
            print(f"# {dataset['name']}")
            print(f"{dataset['command']}")
            print(f"# Extract to data/raw/{dataset['name'].lower().replace(' ', '_')}/")
            print()
            
    def preprocess_images(self, data_dir):
        """Preprocess and organize images for training"""
        print("Preprocessing images...")
        
        # Create data generators with augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            shear_range=0.2,
            fill_mode='nearest',
            validation_split=self.config['validation_split']
        )
        
        test_datagen = ImageDataGenerator(rescale=1./255)
        
        # Load training data
        train_generator = train_datagen.flow_from_directory(
            data_dir,
            target_size=self.config['image_size'],
            batch_size=self.config['batch_size'],
            class_mode='categorical',
            subset='training',
            shuffle=True
        )
        
        # Load validation data
        validation_generator = train_datagen.flow_from_directory(
            data_dir,
            target_size=self.config['image_size'],
            batch_size=self.config['batch_size'],
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )
        
        self.class_names = list(train_generator.class_indices.keys())
        
        return train_generator, validation_generator
        
    def create_model(self):
        """Create EfficientNet-based model for cattle breed classification"""
        print("Creating model architecture...")
        
        # Load pre-trained EfficientNetB0
        base_model = EfficientNetB0(
            weights='imagenet',
            include_top=False,
            input_shape=(*self.config['image_size'], 3)
        )
        
        # Freeze base model layers initially
        base_model.trainable = False
        
        # Add custom classification head
        model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.3),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(self.config['num_classes'], activation='softmax', name='predictions')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.config['learning_rate']),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_5_accuracy']
        )
        
        self.model = model
        return model
        
    def train_model(self, train_generator, validation_generator):
        """Train the cattle breed classification model"""
        print("Starting model training...")
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=self.config['early_stopping_patience'],
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=self.config['reduce_lr_patience'],
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                f"models/{self.config['model_name']}_best.h5",
                monitor='val_accuracy',
                save_best_only=True,
                save_weights_only=False
            ),
            keras.callbacks.CSVLogger(f"logs/training_log.csv")
        ]
        
        # Train model
        self.history = self.model.fit(
            train_generator,
            epochs=self.config['epochs'],
            validation_data=validation_generator,
            callbacks=callbacks,
            verbose=1
        )
        
        # Fine-tuning phase
        print("Starting fine-tuning...")
        
        # Unfreeze top layers of base model
        self.model.layers[0].trainable = True
        
        # Use lower learning rate for fine-tuning
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.config['learning_rate']/10),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_5_accuracy']
        )
        
        # Continue training with fine-tuning
        fine_tune_epochs = 20
        total_epochs = self.config['epochs'] + fine_tune_epochs
        
        self.history_fine = self.model.fit(
            train_generator,
            epochs=total_epochs,
            initial_epoch=self.history.epoch[-1],
            validation_data=validation_generator,
            callbacks=callbacks,
            verbose=1
        )
        
    def evaluate_model(self, validation_generator):
        """Evaluate model performance"""
        print("Evaluating model...")
        
        # Get predictions
        predictions = self.model.predict(validation_generator)
        predicted_classes = np.argmax(predictions, axis=1)
        true_classes = validation_generator.classes
        
        # Classification report
        report = classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        
        # Save evaluation results
        with open('results/classification_report.json', 'w') as f:
            json.dump(report, f, indent=2)
            
        # Confusion matrix
        cm = confusion_matrix(true_classes, predicted_classes)
        
        plt.figure(figsize=(15, 12))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.class_names, yticklabels=self.class_names)
        plt.title('Confusion Matrix - Cattle Breed Classification')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.xticks(rotation=45)
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig('results/confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        return report
        
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            return
            
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy
        axes[0, 0].plot(self.history.history['accuracy'], label='Training Accuracy')
        axes[0, 0].plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        axes[0, 0].set_title('Model Accuracy')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].legend()
        
        # Loss
        axes[0, 1].plot(self.history.history['loss'], label='Training Loss')
        axes[0, 1].plot(self.history.history['val_loss'], label='Validation Loss')
        axes[0, 1].set_title('Model Loss')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Loss')
        axes[0, 1].legend()
        
        # Top-5 Accuracy
        axes[1, 0].plot(self.history.history['top_5_accuracy'], label='Training Top-5 Accuracy')
        axes[1, 0].plot(self.history.history['val_top_5_accuracy'], label='Validation Top-5 Accuracy')
        axes[1, 0].set_title('Model Top-5 Accuracy')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Top-5 Accuracy')
        axes[1, 0].legend()
        
        # Learning Rate
        if 'lr' in self.history.history:
            axes[1, 1].plot(self.history.history['lr'], label='Learning Rate')
            axes[1, 1].set_title('Learning Rate Schedule')
            axes[1, 1].set_xlabel('Epoch')
            axes[1, 1].set_ylabel('Learning Rate')
            axes[1, 1].set_yscale('log')
            axes[1, 1].legend()
        
        plt.tight_layout()
        plt.savefig('results/training_history.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def convert_to_tensorflowjs(self):
        """Convert trained model to TensorFlow.js format"""
        print("Converting model to TensorFlow.js format...")
        
        # Save model in SavedModel format first
        self.model.save('models/cattle_breed_model')
        
        # Convert to TensorFlow.js (requires tensorflowjs package)
        os.system(f"""
        tensorflowjs_converter \
            --input_format=tf_saved_model \
            --output_format=tfjs_graph_model \
            --signature_name=serving_default \
            --saved_model_tags=serve \
            models/cattle_breed_model \
            models/tfjs_model
        """)
        
        # Save class names for JavaScript
        class_mapping = {
            'classes': self.class_names,
            'num_classes': len(self.class_names),
            'input_shape': [None, *self.config['image_size'], 3],
            'model_info': {
                'name': self.config['model_name'],
                'version': '1.0.0',
                'description': 'Cattle and Buffalo breed identification model for Indian breeds'
            }
        }
        
        with open('models/tfjs_model/class_mapping.json', 'w') as f:
            json.dump(class_mapping, f, indent=2)
            
        print("TensorFlow.js model saved to models/tfjs_model/")
        
    def save_model_info(self):
        """Save model information and metadata"""
        model_info = {
            'model_name': self.config['model_name'],
            'architecture': 'EfficientNetB0',
            'num_classes': self.config['num_classes'],
            'input_shape': [*self.config['image_size'], 3],
            'classes': self.class_names,
            'training_config': self.config,
            'breeds': BREED_CLASSES
        }
        
        with open('models/model_info.json', 'w') as f:
            json.dump(model_info, f, indent=2)

def main():
    """Main training pipeline"""
    print("🐄 Bharat Pashudhan Cattle Breed Identification Model Training")
    print("=" * 60)
    
    # Initialize trainer
    trainer = CattleBreedTrainer(CONFIG)
    
    # Setup directories
    trainer.setup_directories()
    
    # Download datasets (manual step)
    trainer.download_kaggle_datasets()
    
    print("\n⚠️  IMPORTANT: Please download the Kaggle datasets manually and organize them in data/raw/")
    print("After organizing the data, uncomment the training code below and run again.")
    
    # Uncomment below after data preparation
    """
    # Preprocess data
    train_gen, val_gen = trainer.preprocess_images('data/processed')
    
    # Create model
    model = trainer.create_model()
    print(f"Model created with {model.count_params():,} parameters")
    
    # Train model
    trainer.train_model(train_gen, val_gen)
    
    # Evaluate model
    report = trainer.evaluate_model(val_gen)
    print(f"Final Accuracy: {report['accuracy']:.4f}")
    
    # Plot training history
    trainer.plot_training_history()
    
    # Convert to TensorFlow.js
    trainer.convert_to_tensorflowjs()
    
    # Save model info
    trainer.save_model_info()
    
    print("✅ Training completed successfully!")
    print("📁 Check the following directories:")
    print("   - models/tfjs_model/ (TensorFlow.js model)")
    print("   - results/ (evaluation results)")
    print("   - logs/ (training logs)")
    """

if __name__ == "__main__":
    main()
