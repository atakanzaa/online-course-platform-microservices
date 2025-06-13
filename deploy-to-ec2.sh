#!/bin/bash

# 🚀 AWS EC2 Deployment Script - Online Course Platform
# Atakan'ın EC2: 13.61.180.150
# Region: eu-north-1

echo "🚀 AWS EC2 Deployment - Online Course Platform"
echo "EC2 IP: 13.61.180.150"
echo "Region: eu-north-1"
echo "================================================"

# 1. Update system
echo "📦 Sistem güncelleniyor..."
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

# 5. Install PostgreSQL client (database test için)
echo "🗄️ PostgreSQL client kuruluyor..."
sudo yum install -y postgresql15

# 6. Clone project
echo "📂 Proje indiriliyor..."
cd /home/ec2-user
git clone https://github.com/atakanzaa/online-course-platform-microservices.git
cd online-course-platform-microservices
git checkout development

# 7. Create production environment file
echo "⚙️ Production environment dosyası oluşturuluyor..."
cat > .env.production << 'EOF'
# Database (Atakan'ın RDS PostgreSQL)
DATABASE_URL=jdbc:postgresql://database-1.cfk0ku4amk30.eu-north-1.rds.amazonaws.com:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=atakan1903

# AWS Services
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIA_YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=courseplatform-media-atakan

# OAuth (Google Cloud Console'dan alacaksınız)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Security
JWT_SECRET=course-platform-super-secret-jwt-key-2024-atakan-1903

# RabbitMQ
RABBITMQ_USER=courseplatform
RABBITMQ_PASSWORD=CourseP1atform2024!

# Redis
REDIS_PASSWORD=Redis_P@ssw0rd_2024

# Email (AWS SES - sonra ekleyeceğiz)
EMAIL_HOST=email-smtp.eu-north-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USERNAME=your-ses-username
EMAIL_PASSWORD=your-ses-password
EOF

# 8. Test Database Connection
echo "🔍 Database bağlantısı test ediliyor..."
PGPASSWORD=atakan1903 psql -h database-1.cfk0ku4amk30.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo "✅ Database bağlantısı başarılı!"
    
    # Create microservice databases
    echo "🗄️ Mikroservis database'leri oluşturuluyor..."
    PGPASSWORD=atakan1903 psql -h database-1.cfk0ku4amk30.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "
    CREATE DATABASE IF NOT EXISTS userdb;
    CREATE DATABASE IF NOT EXISTS coursedb;
    CREATE DATABASE IF NOT EXISTS paymentdb;
    CREATE DATABASE IF NOT EXISTS notificationdb;
    CREATE DATABASE IF NOT EXISTS mediadb;
    "
    echo "✅ Database'ler oluşturuldu!"
else
    echo "❌ Database bağlantısı başarısız! Security Group kontrol edin."
fi

# 9. Load environment variables
echo "🔧 Environment variables yükleniyor..."
export $(cat .env.production | xargs)

# 10. Build and start services
echo "🏗️ Docker services build ediliyor ve başlatılıyor..."
docker-compose -f docker-compose.simple.yml build
docker-compose -f docker-compose.simple.yml up -d

echo ""
echo "✅ Deployment tamamlandı!"
echo ""
echo "🌐 Servisleriniz:"
echo "API Gateway: http://13.61.180.150:8080"
echo "User Service: http://13.61.180.150:8081"
echo "Course Service: http://13.61.180.150:8082"
echo "Payment Service: http://13.61.180.150:8083"
echo "Notification Service: http://13.61.180.150:8084"
echo "Media Service: http://13.61.180.150:8085"
echo "Eureka Dashboard: http://13.61.180.150:8761"
echo "RabbitMQ Management: http://13.61.180.150:15672"
echo ""
echo "🔍 Log'ları kontrol etmek için:"
echo "docker-compose -f docker-compose.simple.yml logs -f"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Google OAuth credentials ekleyin"
echo "2. AWS IAM access keys ekleyin"
echo "3. S3 bucket oluşturun"
echo "4. Domain ve SSL certificate ekleyin" 