pipeline {
    agent any

    tools {
        nodejs "NodeJS 18"  // Make sure you've configured this version in Jenkins global tools
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/VasuTester/DrStrum.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npx playwright test'
            }
        }

        stage('Archive results') {
            steps {
                junit 'test-results/**/*.xml' // If using junit reporter
                archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
