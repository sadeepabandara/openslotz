pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/sadeepabandara/openslotz.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshPublisher(
            publishers: [
                sshPublisherDesc(
                    configName: 'AWS EC2', // Must match your Jenkins SSH server config
                    transfers: [
                        // Deploy backend
                        sshTransfer(
                            sourceFiles: 'backend/**',
                            removePrefix: 'backend',
                            remoteDirectory: 'app/backend',
                            execCommand: '''
                                cd /home/ubuntu/app/backend
                                npm install --production
                                pm2 restart backend || pm2 start server.js --name "backend"
                            '''
                        ),
                        // Deploy frontend
                        sshTransfer(
                            sourceFiles: 'frontend/dist/**',
                            removePrefix: 'frontend/dist',
                            remoteDirectory: 'app/frontend',
                            execCommand: '''
                                sudo rm -rf /var/www/html/*
                                sudo cp -r /home/ubuntu/app/frontend/* /var/www/html/
                                sudo systemctl restart nginx
                            '''
                        )
                    ]
                )
            ]
        )
            }
        }
    }
}
