#!/bin/bash

# 🚀 AWS EC2 Deployment Script for Online Course Platform
# This script sets up the entire microservices platform on AWS EC2

echo "🚀 AWS EC2 Deployment - Online Course Platform"
echo "================================================"

# 1. Update system
echo "📦 System güncelleniyor..."
sudo yum update -y

# 2. Install Docker
echo "🐳 Docker kuruluyor..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# 3. Install Docker Compose
echo "🔧 Docker Compose kuruluyor..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Install Git
echo "📥 Git kuruluyor..."
sudo yum install -y git

# 5. Install AWS CLI
echo "☁️ AWS CLI kuruluyor..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 6. Clone project (replace with your repo)
echo "📂 Proje indiriliyor..."
git clone https://github.com/your-username/online-course-platform.git
cd online-course-platform

# 7. Create production environment file
echo "⚙️ Production environment dosyası oluşturuluyor..."
cat > .env.production << 'EOF'
# Database (RDS PostgreSQL)
DATABASE_URL=jdbc:postgresql://your-rds-endpoint:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-secure-password

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-course-platform-bucket

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-with-256-bits-minimum

# Email (AWS SES)
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USERNAME=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password

# RabbitMQ
RABBITMQ_USER=courseplatform
RABBITMQ_PASSWORD=your-rabbitmq-password

# Redis
REDIS_PASSWORD=your-redis-password
EOF

echo "✅ Setup tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. .env.production dosyasını gerçek değerlerle doldurun"
echo "2. AWS RDS PostgreSQL instance oluşturun"
echo "3. docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔧 Gerekli AWS servisleri:"
echo "- EC2 Instance (t3.medium - 4GB RAM)"
echo "- RDS PostgreSQL (db.t3.micro)"
echo "- S3 Bucket (media dosyaları)"
echo "- Route 53 (domain)"
echo "- Application Load Balancer"
echo ""
echo "💰 Tahmini maliyet: $60-100/ay"
