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
                bat 'npm install -g junit2html'
                bat 'npx playwright install --with-deps'
                // Ensure wkhtmltopdf is available; download and extract if not present
                bat '''
                    if not exist "C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" (
                        curl -L -o wkhtmltopdf.exe https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1/wkhtmltox-0.12.6.1-2.msvc2015-win64.exe
                        mkdir C:\\wkhtmltopdf
                        move wkhtmltopdf.exe C:\\wkhtmltopdf\\wkhtmltopdf.exe
                    )
                '''
            }
        }

        stage('Run tests') {
            steps {
                script {
                    try {
                        bat 'npx playwright test --reporter=junit'
                    } catch (Exception e) {
                        echo "Tests failed: ${e.getMessage()}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }

        stage('Generate HTML from JUnit') {
            steps {
                script {
                    // Convert JUnit XML to HTML
                    bat '''
                        if exist "test-results\\results.xml" (
                            junit2html "test-results\\results.xml" "test-results\\junit-report.html"
                        ) else (
                            echo "JUnit XML report not found, skipping HTML generation"
                        )
                    '''
                }
            }
        }

        stage('Generate PDF report') {
            steps {
                script {
                    // Convert HTML report to PDF using wkhtmltopdf
                    bat '''
                        if exist "test-results\\junit-report.html" (
                            "C:\\wkhtmltopdf\\wkhtmltopdf.exe" --enable-local-file-access "test-results\\junit-report.html" "test-results\\test-report.pdf"
                        ) else (
                            echo "HTML report not found, skipping PDF generation"
                        )
                    '''
                }
            }
        }

        stage('Archive results') {
            steps {
                archiveArtifacts artifacts: 'test-results/test-report.pdf,test-results/results.xml', allowEmptyArchive: true
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