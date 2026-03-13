# ===========================================
# HCOMS Azure Container App Deployment (PowerShell)
# ===========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,

    [Parameter(Mandatory=$true)]
    [string]$ContainerAppsEnvironmentId,

    [Parameter(Mandatory=$true)]
    [string]$DockerImage,

    [Parameter(Mandatory=$true)]
    [string]$DbHost,

    [Parameter(Mandatory=$true)]
    [string]$DbUser,

    [Parameter(Mandatory=$true)]
    [SecureString]$DbPassword,

    [Parameter(Mandatory=$true)]
    [SecureString]$JwtSecret,

    [string]$Environment = "dev",
    [string]$DbPort = "5432",
    [string]$DbName = "hcoms_db",
    [string]$DockerUsername = "",
    [SecureString]$DockerPassword = $null,
    [string]$AllowedEmailDomain = "who.int",
    [string]$FrontendUrl = "",
    [switch]$BuildImage,
    [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"

Write-Host "===========================================" -ForegroundColor Green
Write-Host "HCOMS Azure Container App Deployment" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroup"
Write-Host "  Environment: $Environment"
Write-Host "  Docker Image: $DockerImage"
Write-Host "  Database Host: $DbHost"

# Convert secure strings
$DbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword))
$JwtSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($JwtSecret))

# Build and push Docker image
if ($BuildImage) {
    Write-Host "`nBuilding and pushing Docker image..." -ForegroundColor Yellow

    if ($DockerUsername -and $DockerPassword) {
        $DockerPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DockerPassword))
        $DockerPasswordPlain | docker login -u $DockerUsername --password-stdin
    }

    docker build -t $DockerImage "$PSScriptRoot\.."
    docker push $DockerImage

    Write-Host "✓ Docker image pushed" -ForegroundColor Green
}

# Deploy to Azure
if (-not $SkipDeploy) {
    Write-Host "`nDeploying Container App..." -ForegroundColor Yellow

    $params = @(
        "--parameters", "environment=$Environment",
        "--parameters", "containerAppsEnvironmentId=$ContainerAppsEnvironmentId",
        "--parameters", "dockerImage=$DockerImage",
        "--parameters", "dbHost=$DbHost",
        "--parameters", "dbPort=$DbPort",
        "--parameters", "dbName=$DbName",
        "--parameters", "dbUser=$DbUser",
        "--parameters", "dbPassword=$DbPasswordPlain",
        "--parameters", "jwtSecret=$JwtSecretPlain",
        "--parameters", "allowedEmailDomain=$AllowedEmailDomain"
    )

    if ($DockerUsername) {
        $params += "--parameters", "dockerUsername=$DockerUsername"
    }

    if ($DockerPassword) {
        $DockerPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DockerPassword))
        $params += "--parameters", "dockerPassword=$DockerPasswordPlain"
    }

    if ($FrontendUrl) {
        $params += "--parameters", "frontendUrl=$FrontendUrl"
    }

    $DeploymentOutput = az deployment group create `
        --resource-group $ResourceGroup `
        --template-file "$PSScriptRoot\main.bicep" `
        @params `
        --query 'properties.outputs' `
        --output json | ConvertFrom-Json

    $AppUrl = $DeploymentOutput.containerAppUrl.value

    Write-Host "✓ Container App deployed" -ForegroundColor Green
}

Write-Host "`n===========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application URL: $AppUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  az containerapp logs show -n hcoms-$Environment -g $ResourceGroup --follow"
