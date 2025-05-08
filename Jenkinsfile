// pipeline {
//     agent any

//     tools {
//         nodejs "NodeJS 18"
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 git branch: 'main', url: 'https://github.com/VasuTester/DrStrum.git'
//             }
//         }

//         stage('Install dependencies') {
//             steps {
//                 bat 'npm ci'
//                 bat 'npx playwright install'
//             }
//         }

//         stage('Run tests') {
//             steps {
//                 bat 'npx playwright test --reporter=junit,html'
//             }
//         }

//         stage('Archive results') {
//             steps {
//                 junit 'test-results/**/*.xml'
//                 archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Pipeline finished.'
//         }
//     }
// }

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
                bat 'mkdir -p test-results'
                // Run tests and specify the output format (JUnit)
                bat 'npx playwright test --reporter=junit --output=test-results --debug'
            }
        }

        stage('Archive results') {
            steps {
                // Archive JUnit XML reports
                junit 'test-results/**/*.xml'
                // Archive Playwright HTML reports (optional)
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

