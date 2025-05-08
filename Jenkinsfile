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
//                 bat 'npx playwright install --with-deps'
//             }
//         }

//         stage('Run tests') {
//             steps {
//                 script {
//                     try {
//                         bat 'npx playwright test --reporter=html'
//                     } catch (Exception e) {
//                         echo "Tests failed: ${e.getMessage()}"
//                         currentBuild.result = 'FAILURE'
//                         throw e
//                     }
//                 }
//             }
//         }

//         stage('Archive results') {
//             steps {
//                 archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Pipeline finished.'
//             script {
//                 def status = currentBuild.currentResult
//                 bat "echo Build status: ${status}"
//             }
//         }
//         success {
//             echo 'Tests passed successfully!'
//         }
//         failure {
//             echo 'Tests failed. Check the archived reports for details.'
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
                // Ensure wkhtmltopdf is available; download and extract if not present
                bat '''
                    if not exist "C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" (
                        curl -L -o wkhtmltopdf.tar.xz https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1/wkhtmltox-0.12.6.1-2.msvc2015-win64.exe
                        mkdir C:\\wkhtmltopdf
                        move wkhtmltopdf.tar.xz C:\\wkhtmltopdf
                        cd C:\\wkhtmltopdf
                        7z x wkhtmltopdf.tar.xz -oC:\\wkhtmltopdf
                    )
                '''
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

        stage('Generate PDF report') {
            steps {
                script {
                    // Convert HTML report to PDF using wkhtmltopdf
                    bat '''
                        if exist "playwright-report\\index.html" (
                            "C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" --enable-local-file-access "playwright-report\\index.html" "playwright-report\\test-report.pdf"
                        ) else (
                            echo "HTML report not found, skipping PDF generation"
                        )
                    '''
                }
            }
        }

        stage('Archive results') {
            steps {
                archiveArtifacts artifacts: 'playwright-report/test-report.pdf,playwright-report/**', allowEmptyArchive: true
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