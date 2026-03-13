// ===========================================
// HCOMS Azure Container App Deployment
// ===========================================
// Deploys only the Container App using external infrastructure

targetScope = 'resourceGroup'

// Parameters
@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Application name')
param appName string = 'hcoms'

@description('Existing Container Apps Environment resource ID')
param containerAppsEnvironmentId string

@description('Docker Hub image (e.g., username/hcoms:latest)')
param dockerImage string

@description('Docker Hub username (leave empty for public images)')
param dockerUsername string = ''

@description('Docker Hub password/token (leave empty for public images)')
@secure()
param dockerPassword string = ''

@description('PostgreSQL host')
param dbHost string

@description('PostgreSQL port')
param dbPort string = '5432'

@description('PostgreSQL database name')
param dbName string = 'hcoms_db'

@description('PostgreSQL user')
param dbUser string

@description('PostgreSQL password')
@secure()
param dbPassword string

@description('JWT secret for authentication')
@secure()
param jwtSecret string

@description('Allowed email domain for login')
param allowedEmailDomain string = 'who.int'

@description('Frontend URL for CORS (optional)')
param frontendUrl string = ''

@description('Minimum number of replicas')
param minReplicas int = 0

@description('Maximum number of replicas')
param maxReplicas int = 3

// Variables
var resourceName = '${appName}-${environment}'
var tags = {
  application: appName
  environment: environment
  managedBy: 'bicep'
}

var baseSecrets = [
  { name: 'db-password', value: dbPassword }
  { name: 'jwt-secret', value: jwtSecret }
]

var dockerSecrets = !empty(dockerPassword) ? [
  { name: 'docker-password', value: dockerPassword }
] : []

var secrets = concat(baseSecrets, dockerSecrets)

var registryConfig = !empty(dockerPassword) ? [
  {
    server: 'index.docker.io'
    username: dockerUsername
    passwordSecretRef: 'docker-password'
  }
] : []

// Container App
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: resourceName
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 5000
        transport: 'http'
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
      registries: registryConfig
      secrets: secrets
    }
    template: {
      containers: [
        {
          name: 'hcoms-app'
          image: dockerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '5000' }
            { name: 'DB_HOST', value: dbHost }
            { name: 'DB_PORT', value: dbPort }
            { name: 'DB_NAME', value: dbName }
            { name: 'DB_USER', value: dbUser }
            { name: 'DB_SSL', value: 'true' }
            { name: 'DB_PASSWORD', secretRef: 'db-password' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'ALLOWED_EMAIL_DOMAIN', value: allowedEmailDomain }
            { name: 'FRONTEND_URL', value: frontendUrl }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 5000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 5000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs
output containerAppName string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
