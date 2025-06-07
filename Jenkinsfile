pipeline {
    agent any
    options {
        failFast true
        skipDefaultCheckout(true)
    }
    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'openslotz-deployments'
        APP_NAME = 'openslotz'
        DEPLOYMENT_GROUP = 'prod'
    }
    stages {
        // Stage 1: Checkout
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        // Stage 2: Build
        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'tar -czf frontend.tar.gz dist/'
                }
                dir('backend') {
                    sh 'npm install --production'
                    // Create backend.tar.gz one level up to root workspace
                    sh 'tar --exclude="./node_modules" --exclude="./.git" -czf ../backend.tar.gz .'
                }
            }
        }

        // Stage 3: Test
        stage('Test') {
            steps {
                dir('e2e-tests') {
                    sh 'npm ci'
                    sh 'npx playwright install'
                    sh 'npm test'
                }
            }
        }

        // Stage 4: Code Quality (SonarQube)
        stage('Code Quality') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    sh 'sonar-scanner -Dsonar.projectKey=your-app'
                }
            }
        }

        // Stage 5: Security (OWASP Scan)
        stage('Security') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --format HTML', odcInstallation: 'OWASP'
                dependencyCheckPublisher pattern: '**/dependency-check-report.html'
            }
        }

        // Stage 6: Deploy to S3 & Trigger CodeDeploy
        stage('Deploy') {
            steps {
                s3Upload(
                    bucket: "${S3_BUCKET}",
                    includePathPattern: 'backend.tar.gz',
                    storageClass: 'STANDARD',
                    acl: 'BucketOwnerFullControl'
                )
                sh """
                aws deploy create-deployment \
                    --application-name ${APP_NAME} \
                    --deployment-group-name ${DEPLOYMENT_GROUP} \
                    --s3-location bucket=${S3_BUCKET},bundleType=tgz,key=backend.tar.gz
                """
            }
        }

        // Stage 7: Release (Approval)
        stage('Release') {
            steps {
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Deploy to production?', ok: 'Confirm'
                }
            }
        }

        // Stage 8: Monitoring (New Relic)
        stage('Monitoring') {
            steps {
                sh '''
                curl -X POST "https://api.newrelic.com/v2/applications/YOUR_APP_ID/deployments.json" \
                    -H "Api-Key:YOUR_API_KEY" \
                    -d "deployment[app_name]=${APP_NAME}"
                '''
            }
        }
    }
}
