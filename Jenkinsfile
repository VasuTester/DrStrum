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
                script {
                    try {
                        bat 'npx playwright test --reporter=html'
                    } catch (Exception e) {
                        echo "Tests failed: ${e.getMessage()}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }

        stage('Archive results') {
            steps {
                archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
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
            echo 'Tests failed. Check the archived reports for details.'
        }
    }
}