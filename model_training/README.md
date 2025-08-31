# 🐄 Cattle Breed Identification Model Training

This directory contains scripts and resources for training a TensorFlow.js model on Kaggle datasets for the Bharat Pashudhan cattle breed identification system.

## 📋 Overview

Train a deep learning model to identify 43 Indian cattle and buffalo breeds using EfficientNet architecture and Kaggle datasets.

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Install Python dependencies
pip install -r requirements.txt

# Setup Kaggle API and download datasets
python setup_kaggle.py
```

### 2. Prepare Data

```bash
# Organize and preprocess datasets
python data_preparation.py
```

### 3. Train Model

```bash
# Train the cattle breed classification model
python train_model.py
```

## 📊 Datasets Used

### Primary Dataset: Indian Bovine Breeds
- **Source**: https://www.kaggle.com/datasets/lukex9442/indian-bovine-breeds
- **Size**: ~3GB
- **Content**: Comprehensive image database for Indian cow and buffalo breeds
- **License**: CC0 Public Domain

### Secondary Dataset: Cattle Breeds Dataset
- **Source**: https://www.kaggle.com/datasets/anandkumarsahu09/cattle-breeds-dataset
- **Size**: ~200MB
- **Content**: 200+ images of 5 different cattle breeds

## 🎯 Target Breeds (43 Total)

### Cattle Breeds (30)
- **Indigenous**: Gir, Sahiwal, Red Sindhi, Tharparkar, Rathi, Hariana, Kankrej, Ongole
- **Regional**: Krishna Valley, Deoni, Khillari, Malvi, Nimari, Nagori, Mewati, Ponwar
- **Southern**: Amritmahal, Hallikar, Kangayam, Pulikulam, Umblachery, Vechur, Kasaragod
- **Exotic**: Holstein Friesian, Jersey, Brown Swiss
- **Others**: Bachaur, Gaolao, Dangi, Crossbred

### Buffalo Breeds (13)
- **Major**: Murrah, Nili Ravi, Bhadawari, Jaffarabadi, Mehsana
- **Regional**: Nagpuri, Pandharpuri, Toda, Chilika, Kalahandi
- **Others**: Marathwadi, Godavari, Surti

## 🏗️ Model Architecture

- **Base Model**: EfficientNetB0 (pre-trained on ImageNet)
- **Input Size**: 224x224x3
- **Classes**: 43 breeds
- **Output Format**: TensorFlow.js compatible
- **Training Strategy**: Transfer learning + Fine-tuning

## 📁 Directory Structure

```
model_training/
├── data/
│   ├── raw/                    # Raw downloaded datasets
│   └── processed/              # Organized training data
│       ├── train/              # Training images (70%)
│       ├── validation/         # Validation images (20%)
│       └── test/               # Test images (10%)
├── models/
│   ├── tfjs_model/            # TensorFlow.js model files
│   └── cattle_breed_model/    # SavedModel format
├── results/
│   ├── confusion_matrix.png   # Model evaluation results
│   └── training_history.png   # Training progress plots
├── logs/
│   └── training_log.csv       # Training metrics
└── scripts/
    ├── setup_kaggle.py        # Kaggle API setup
    ├── data_preparation.py    # Data preprocessing
    └── train_model.py         # Model training
```

## ⚙️ Training Configuration

```python
CONFIG = {
    'model_name': 'bharat_pashudhan_cattle_classifier',
    'image_size': (224, 224),
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.001,
    'validation_split': 0.2,
    'test_split': 0.1,
    'num_classes': 43
}
```

## 📈 Expected Performance

- **Target Accuracy**: >90% on validation set
- **Top-5 Accuracy**: >95% on validation set
- **Model Size**: <50MB (TensorFlow.js format)
- **Inference Speed**: <500ms on mobile devices

## 🔧 Integration with App

After training, the model will be integrated into the existing app:

1. **Model Files**: Copy `tfjs_model/` to `public/models/`
2. **Update AI Service**: Replace mock model in `src/services/aiService.ts`
3. **Class Mapping**: Use generated `class_mapping.json`

## 📝 Usage Examples

### Training with Custom Parameters

```python
from train_model import CattleBreedTrainer

# Custom configuration
config = {
    'epochs': 100,
    'batch_size': 16,
    'learning_rate': 0.0005
}

trainer = CattleBreedTrainer(config)
# ... training pipeline
```

### Loading Trained Model

```javascript
// In React app
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/models/tfjs_model/model.json');
const prediction = model.predict(imageData);
```

## 🐛 Troubleshooting

### Common Issues

1. **Kaggle API Error**: Ensure `kaggle.json` is in `~/.kaggle/` with correct permissions
2. **Memory Error**: Reduce batch size or use gradient accumulation
3. **CUDA Error**: Install TensorFlow GPU version if using GPU
4. **Data Loading Error**: Check image file formats and directory structure

### Performance Optimization

- Use mixed precision training for faster training
- Implement data pipeline optimization with `tf.data`
- Use distributed training for multiple GPUs
- Apply advanced data augmentation techniques

## 📚 References

- [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Kaggle API Documentation](https://github.com/Kaggle/kaggle-api)
- [Indian Cattle Breeds Reference](https://agritech.tnau.ac.in/animal_husbandry/animhus_cattle%20_breed.html)

## 🤝 Contributing

1. Add new datasets to improve model accuracy
2. Implement advanced augmentation techniques
3. Optimize model architecture for mobile deployment
4. Add support for additional Indian breeds

## 📄 License

This training pipeline is open source. Dataset licenses vary by source - check individual dataset pages for details.
