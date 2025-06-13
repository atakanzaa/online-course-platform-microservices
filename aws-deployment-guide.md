# 🚀 AWS Deployment Rehberi - Online Course Platform

## 📋 İçindekiler
1. [EC2 + Docker Compose (Başlangıç)](#ec2--docker-compose)
2. [ECS Fargate (Orta Seviye)](#ecs-fargate)
3. [EKS Kubernetes (İleri Seviye)](#eks-kubernetes)

---

## 🥉 **1. EC2 + Docker Compose (Başlangıç)**

### **📊 Maliyet: ~$50-100/ay**
### **⏱️ Setup Süresi: 2-3 saat**
### **🎯 Uygun: Öğrenme, MVP, küçük trafik**

#### **🔧 Gerekli AWS Servisleri:**
```
✅ EC2 Instance (t3.large - 2 vCPU, 8GB RAM)
✅ RDS PostgreSQL (db.t3.micro)
✅ S3 Bucket (Media dosyaları için)
✅ Route 53 (Domain yönetimi)
✅ ALB (Application Load Balancer)
✅ Security Groups (Firewall)
```

#### **📝 Adım 1: EC2 Instance Kurulumu**

```bash
# 1. AWS Console'dan EC2 instance oluştur
Instance Type: t3.large (2 vCPU, 8GB RAM)
Operating System: Amazon Linux 2023
Storage: 30GB gp3 SSD
Security Group: web-servers-sg

# 2. Security Group Rules
Port 22 (SSH): Your IP only
Port 80 (HTTP): 0.0.0.0/0
Port 443 (HTTPS): 0.0.0.0/0
Port 8080 (API Gateway): ALB only
```

#### **📝 Adım 2: EC2'ye Bağlanma ve Kurulum**

```bash
# EC2'ye SSH bağlantısı
ssh -i your-key.pem ec2-user@your-ec2-ip

# Docker kurulumu
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git kurulumu
sudo yum install -y git

# Projeyi clone
git clone https://github.com/your-username/online-course-platform.git
cd online-course-platform
```

#### **📝 Adım 3: RDS PostgreSQL Kurulumu**

```bash
# AWS Console'dan RDS oluştur
Engine: PostgreSQL 15
Instance Class: db.t3.micro (Free tier eligible)
Storage: 20GB gp2
Multi-AZ: No (maliyet için)
VPC: Default VPC
Security Group: database-sg

# Database Security Group
Port 5432: EC2 Security Group only
```

#### **📝 Adım 4: Environment Variables**

```bash
# .env.production dosyası oluştur
cat > .env.production << EOF
# Database
DATABASE_URL=jdbc:postgresql://your-rds-endpoint:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-secure-password

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-course-platform-bucket

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
JWT_SECRET=your-super-secret-jwt-key-with-256-bits

# Email (AWS SES)
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USERNAME=your-ses-username
EMAIL_PASSWORD=your-ses-password
EOF
```

#### **📝 Adım 5: Production Deployment**

```bash
# Production profile ile deployment
export $(cat .env.production | xargs)

# Production docker-compose.yml ile başlat
docker-compose -f docker-compose.prod.yml up -d

# Log'ları kontrol et
docker-compose -f docker-compose.prod.yml logs -f
```

#### **📝 Adım 6: Application Load Balancer**

```bash
# AWS Console'dan ALB oluştur
Type: Application Load Balancer
Scheme: Internet-facing
Listeners: HTTP:80, HTTPS:443

# Target Groups
api-gateway-tg: Port 8080 (Health check: /actuator/health)

# Listener Rules
Default: Forward to api-gateway-tg
```

#### **📝 Adım 7: SSL Certificate & Domain**

```bash
# AWS Certificate Manager'dan SSL sertifika
Domain: your-domain.com
Validation: DNS

# Route 53'te domain yapılandırması
Type: A Record
Name: api.your-domain.com
Value: ALB DNS Name (Alias)
```

---

## 🥈 **2. ECS Fargate (Orta Seviye)**

### **📊 Maliyet: ~$150-300/ay**
### **⏱️ Setup Süresi: 1 gün**
### **🎯 Uygun: Production, otomatik ölçeklendirme**

#### **🔧 Gerekli AWS Servisleri:**
```
✅ ECS Fargate Cluster
✅ ECR (Docker Registry)
✅ RDS PostgreSQL (Multi-AZ)
✅ ElastiCache Redis
✅ Application Load Balancer
✅ CloudWatch Logs
✅ AWS Systems Manager (Secrets)
```

#### **📝 Adım 1: ECR Repository'leri Oluştur**

```bash
# Her mikroservis için ECR repository
aws ecr create-repository --repository-name courseplatform/user-service
aws ecr create-repository --repository-name courseplatform/course-service
aws ecr create-repository --repository-name courseplatform/payment-service
aws ecr create-repository --repository-name courseplatform/notification-service
aws ecr create-repository --repository-name courseplatform/media-service
aws ecr create-repository --repository-name courseplatform/api-gateway
aws ecr create-repository --repository-name courseplatform/config-server
aws ecr create-repository --repository-name courseplatform/discovery-server
```

#### **📝 Adım 2: Docker Images Build & Push**

```bash
# AWS CLI configure
aws configure

# ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# Build ve push script
#!/bin/bash
services=("user-service" "course-service" "payment-service" "notification-service" "media-service" "api-gateway" "config-server" "discovery-server")

for service in "${services[@]}"; do
    echo "Building $service..."
    docker build -t courseplatform/$service ./$service/
    
    echo "Tagging $service..."
    docker tag courseplatform/$service:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/courseplatform/$service:latest
    
    echo "Pushing $service..."
    docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/courseplatform/$service:latest
done
```

#### **📝 Adım 3: ECS Task Definitions**

```json
{
  "family": "user-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::your-account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::your-account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "user-service",
      "image": "your-account-id.dkr.ecr.us-east-1.amazonaws.com/courseplatform/user-service:latest",
      "portMappings": [
        {
          "containerPort": 8081,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:ssm:us-east-1:your-account:parameter/courseplatform/database/password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/user-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8081/actuator/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### **📝 Adım 4: ECS Services & Cluster**

```bash
# ECS Cluster oluştur
aws ecs create-cluster --cluster-name courseplatform-cluster

# Service oluştur (her mikroservis için)
aws ecs create-service \
    --cluster courseplatform-cluster \
    --service-name user-service \
    --task-definition user-service:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:your-account:targetgroup/user-service-tg/1234567890123456,containerName=user-service,containerPort=8081"
```

---

## 🥇 **3. EKS Kubernetes (İleri Seviye)**

### **📊 Maliyet: ~$300-500/ay**
### **⏱️ Setup Süresi: 2-3 gün**
### **🎯 Uygun: Enterprise, yüksek trafik, tam otomasyon**

#### **🔧 Gerekli AWS Servisleri:**
```
✅ EKS Cluster
✅ ECR (Docker Registry)
✅ RDS PostgreSQL (Multi-AZ)
✅ ElastiCache Redis
✅ AWS Load Balancer Controller
✅ EBS CSI Driver
✅ CloudWatch Container Insights
✅ AWS Systems Manager
```

#### **📝 Adım 1: EKS Cluster Kurulumu**

```bash
# eksctl kurulumu
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# kubectl kurulumu
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.27.1/2023-04-19/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin

# EKS Cluster oluştur
eksctl create cluster \
    --name courseplatform-cluster \
    --version 1.27 \
    --region us-east-1 \
    --nodegroup-name courseplatform-nodes \
    --node-type t3.medium \
    --nodes 3 \
    --nodes-min 1 \
    --nodes-max 10 \
    --managed
```

#### **📝 Adım 2: Kubernetes Manifests**

```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: courseplatform
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: your-account-id.dkr.ecr.us-east-1.amazonaws.com/courseplatform/user-service:latest
        ports:
        - containerPort: 8081
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: url
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: password
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8081
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: courseplatform
spec:
  selector:
    app: user-service
  ports:
  - port: 8081
    targetPort: 8081
  type: ClusterIP
```

#### **📝 Adım 3: Ingress Controller & Load Balancer**

```bash
# AWS Load Balancer Controller kurulumu
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds"

helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=courseplatform-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller
```

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: courseplatform-ingress
  namespace: courseplatform
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:your-account:certificate/your-cert-id
spec:
  rules:
  - host: api.your-domain.com
    http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 8081
      - path: /courses
        pathType: Prefix
        backend:
          service:
            name: course-service
            port:
              number: 8082
      - path: /payments
        pathType: Prefix
        backend:
          service:
            name: payment-service
            port:
              number: 8083
```

#### **📝 Adım 4: Helm Charts (Recommended)**

```bash
# Helm kurulumu
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Chart oluştur
helm create courseplatform

# values.yaml düzenle
cat > courseplatform/values.yaml << EOF
replicaCount: 2

image:
  repository: your-account-id.dkr.ecr.us-east-1.amazonaws.com/courseplatform
  pullPolicy: Always
  tag: "latest"

services:
  - name: user-service
    port: 8081
    targetPort: 8081
  - name: course-service
    port: 8082
    targetPort: 8082
  - name: payment-service
    port: 8083
    targetPort: 8083

ingress:
  enabled: true
  className: "alb"
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
  hosts:
    - host: api.your-domain.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
EOF

# Deploy
helm install courseplatform ./courseplatform
```

---

## 🎯 **Hangi Stratejiyi Seçmelisiniz?**

### **🔰 Yeni Başlıyorsanız: EC2 + Docker Compose**
```
✅ Kolay setup
✅ Düşük maliyet
✅ Hızlı öğrenme
✅ MVP için ideal
❌ Ölçeklendirme zor
❌ Manuel backup
```

### **🚀 Orta Seviye: ECS Fargate**
```
✅ Serverless containers
✅ Otomatik ölçeklendirme
✅ AWS entegrasyonu
✅ Zero downtime deployment
❌ Docker bilgisi gerekli
❌ Daha yüksek maliyet
```

### **⭐ İleri Seviye: EKS Kubernetes**
```
✅ Enterprise-grade
✅ Multi-cloud portable
✅ Gelişmiş orchestration
✅ DevOps best practices
❌ Steep learning curve
❌ En yüksek maliyet
❌ Kompleks setup
```

---

## 💰 **Maliyet Karşılaştırması (Aylık)**

| Strateji | AWS Servisleri | Tahmini Maliyet |
|----------|----------------|-----------------|
| **EC2 + Docker** | EC2 (t3.large) + RDS (db.t3.micro) + S3 | $50-100 |
| **ECS Fargate** | Fargate + RDS (Multi-AZ) + ElastiCache + ALB | $150-300 |
| **EKS Kubernetes** | EKS Cluster + EC2 Nodes + RDS + ElastiCache + Monitoring | $300-500 |

---

## 🎓 **Önerilen Öğrenme Yolu**

```
1. 📚 EC2 + Docker Compose ile başla (1-2 hafta)
   ↓
2. 🔄 ECS Fargate'e geçiş (2-3 hafta)
   ↓
3. ⭐ EKS Kubernetes master (1-2 ay)
```

Bu rehber ile AWS'ye profesyonel deployment yapabilirsiniz! 🚀 