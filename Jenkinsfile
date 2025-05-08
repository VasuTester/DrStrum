pipeline {
    agent any

    tools {
        nodejs "NodeJS 18"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/VasuTester/DrStrum.git'
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
                sh 'npx playwright test --reporter=junit,html'
            }
        }

        stage('Archive results') {
            steps {
                junit 'test-results/**/*.xml'
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
