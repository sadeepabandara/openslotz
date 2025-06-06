pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-username/your-repo.git'
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
                // Transfer files to EC2
                sshPublisher(
                    publishers: [
                        sshPublisherDesc(
                            configName: 'AWS EC2', // Matches what you named in Jenkins config
                            transfers: [
                                sshTransfer(
                                    sourceFiles: 'backend/**',
                                    removePrefix: 'backend',
                                    remoteDirectory: 'app/backend'
                                ),
                                sshTransfer(
                                    sourceFiles: 'frontend/build/**',
                                    removePrefix: 'frontend/build',
                                    remoteDirectory: 'app/frontend'
                                )
                            ],
                            execCommand: '''
                                cd /home/ubuntu/app/backend
                                npm install --production
                                pm2 restart backend || pm2 start server.js --name "backend"

                                sudo rm -rf /var/www/html/*
                                sudo cp -r /home/ubuntu/app/frontend/* /var/www/html/
                                sudo systemctl restart nginx
                            '''
                        )
                    ]
                )
            }
        }
    }
}
