terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Name of the Cloud Run application"
  type        = string
  default     = "trade-harmony-frontend"
}

variable "image_name" {
  description = "Container image to deploy to Cloud Run"
  type        = string
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required services
resource "google_project_service" "cloud_run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "vpcaccess_api" {
  service            = "vpcaccess.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "compute_api" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

# Create VPC network
resource "google_compute_network" "vpc_network" {
  name                    = "${var.app_name}-vpc"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.compute_api]
}

# Create subnet
resource "google_compute_subnetwork" "vpc_subnet" {
  name          = "${var.app_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
  
  # Enable private Google access
  private_ip_google_access = true
}

# Create Serverless VPC Access connector
resource "google_vpc_access_connector" "connector" {
  name          = "th-frontend-connector2"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc_network.name
  
  depends_on = [
    google_project_service.vpcaccess_api
  ]
}

# Deploy Cloud Run service
resource "google_cloud_run_service" "frontend" {
  name     = var.app_name
  location = var.region
  
  template {
    spec {
      containers {
        image = var.image_name
        
        # Example environment variables
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "5"
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.connector.name
        "run.googleapis.com/vpc-access-egress"    = "all-traffic"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.cloud_run_api
  ]
}

# IAM policy to make the service public
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the service URL
output "service_url" {
  value = google_cloud_run_service.frontend.status[0].url
} 