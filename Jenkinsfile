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
                bat 'npm install @playwright/test allure-playwright allure-commandline --save-dev'
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run tests') {
            steps {
                script {
                    try {
                        bat 'npx playwright test --reporter=junit,html,allure-playwright'
                    } catch (Exception e) {
                        echo "Tests failed: ${e.getMessage()}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    // Clean up existing allure-results and allure-report
                    bat 'if exist allure-results rmdir /s /q allure-results'
                    bat 'if exist allure-report rmdir /s /q allure-report'
                    // Generate Allure report, exit 0 if no results to avoid failure
                    bat 'npx allure generate allure-results --clean -o allure-report || exit 0'
                }
            }
        }

        stage('Archive results') {
            steps {
                junit allowEmptyResults: true, testResults: 'test-results/**/*.xml'
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
