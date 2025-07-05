terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

variable "mongo_region" {
  description = "The Google Cloud region for MongoDB subnet"
  type        = string
  default     = "europe-west1"
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
  default     = "gcr.io/stalwart-elixir-458022-d5/management-demo-construct:latest"
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

resource "google_compute_subnetwork" "mongo_subnet" {
  name          = "${var.app_name}-subnet-mongo"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.mongo_region
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
        "autoscaling.knative.dev/maxScale"        = "5"
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


# MongoDB VM - No external IP, IAP access
resource "google_compute_instance" "mongodb_vm" {
  name         = "${var.app_name}-mongodb"
  machine_type = "e2-micro"
  zone         = "${var.mongo_region}-b"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 10
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = google_compute_network.vpc_network.name
    subnetwork = google_compute_subnetwork.mongo_subnet.name
  }

  tags = ["mongodb-server", "iap-ssh"]

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    
    # Install MongoDB
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    
    # Configure MongoDB for network access
    sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
    
    # Enable and start MongoDB
    systemctl enable mongod
    systemctl start mongod
  EOF
}

resource "google_project_service" "iap_api" {
  service            = "iap.googleapis.com"
  disable_on_destroy = false
}


# Firewall rule for IAP SSH access
resource "google_compute_firewall" "iap_ssh" {
  name    = "${var.app_name}-iap-ssh"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # IAP's IP range for SSH tunneling
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["iap-ssh"]

  depends_on = [google_project_service.iap_api]
}



# Firewall rule for MongoDB access
resource "google_compute_firewall" "mongodb_firewall" {
  name    = "${var.app_name}-mongodb-firewall"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["27017"]
  }

  source_ranges = ["10.0.0.0/16"]
  target_tags   = ["mongodb-server"]
}


resource "google_compute_firewall" "allow_egress" {
  name      = "${var.app_name}-allow-egress"
  network   = google_compute_network.vpc_network.name
  direction = "EGRESS"

  allow {
    protocol = "all"
  }

  destination_ranges = ["0.0.0.0/0"]
}


resource "google_compute_router" "nat_router" {
  name    = "${var.app_name}-nat-router"
  region  = var.mongo_region
  network = google_compute_network.vpc_network.id
}

# Cloud NAT Gateway
resource "google_compute_router_nat" "nat_gateway" {
  name   = "${var.app_name}-nat-gateway"
  router = google_compute_router.nat_router.name
  region = var.mongo_region

  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}


resource "google_compute_firewall" "allow_internal" {
  name    = "${var.app_name}-allow-internal"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/16"]
}
