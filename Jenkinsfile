pipeline {
    agent any
    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'openslotz-deployments'
        APP_NAME = 'openslotz'
        DEPLOYMENT_GROUP = 'prod'
    }
    stages {
        // Stage 1: Build
        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'tar -czf frontend.tar.gz dist/'
                }
                dir('backend') {
                    sh 'npm install --production'
                    sh 'tar -czf backend.tar.gz .'
                }
            }
        }

        // Stage 2: Test
        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm test' // Ensure you have test scripts in package.json
                }
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }

        // Stage 3: Code Quality (SonarQube)
        stage('Code Quality') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    sh 'sonar-scanner -Dsonar.projectKey=your-app'
                }
            }
        }

        // Stage 4: Security (OWASP Scan)
        stage('Security') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --format HTML', odcInstallation: 'OWASP'
                dependencyCheckPublisher pattern: '**/dependency-check-report.html'
            }
        }

        // Stage 5: Deploy to S3 & Trigger CodeDeploy
        stage('Deploy') {
            steps {
                s3Upload(
                    bucket: "${S3_BUCKET}",
                    file: 'backend/backend.tar.gz',
                    path: 'backend/backend.tar.gz'
                )
                sh """
                aws deploy create-deployment \
                    --application-name ${APP_NAME} \
                    --deployment-group-name ${DEPLOYMENT_GROUP} \
                    --s3-location bucket=${S3_BUCKET},bundleType=tgz,key=backend/backend.tar.gz
                """
            }
        }

        // Stage 6: Release (Approval)
        stage('Release') {
            steps {
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Deploy to production?', ok: 'Confirm'
                }
            }
        }

        // Stage 7: Monitoring (New Relic)
        stage('Monitoring') {
            steps {
                sh 'curl -X POST "https://api.newrelic.com/v2/applications/YOUR_APP_ID/deployments.json" \
                    -H "Api-Key:YOUR_API_KEY" \
                    -d "deployment[app_name]=${APP_NAME}"'
            }
        }
    }
}
