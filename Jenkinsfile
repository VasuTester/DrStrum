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
                bat 'npm ci'
                bat 'npx playwright install'
            }
        }

        stage('Run tests') {
            steps {
                // Ensure test-results directory exists
                bat 'mkdir test-results'
                // Run tests using the config file which already includes junit + html reporters
                bat 'npx playwright test'
            }
        }

        stage('Archive results') {
            steps {
                // This path matches your outputFile: 'test-results/results.xml'
                junit 'test-results/results.xml'
                // Archive HTML report directory
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
