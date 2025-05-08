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
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run tests') {
            steps {
                bat 'npx playwright test --reporter=junit,html,allure'
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat 'npx allure generate allure-results --clean -o allure-report'
            }
        }

        stage('Archive results') {
            steps {
                junit 'test-results/**/*.xml'
                archiveArtifacts artifacts: 'playwright-report/**,allure-report/**', allowEmptyArchive: true
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright HTML Report'
                ])
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'allure-report',
                    reportFiles: 'index.html',
                    reportName: 'Allure Report'
                ])
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            script {
                def status = currentBuild.currentResult
                bat "echo Build status: ${status}"
            }
        }
        success {
            echo 'Tests passed successfully!'
        }
        failure {
            echo 'Tests failed. Check the reports for details.'
        }
    }
}

