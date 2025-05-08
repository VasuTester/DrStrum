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
                bat 'npm install xml2js fs'
                bat 'npx playwright install --with-deps'
                // Ensure wkhtmltopdf is available; provide a fallback message if installation fails
                bat '''
                    if not exist "C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" (
                        echo Attempting to download wkhtmltopdf...
                        curl -L -o wkhtmltopdf-installer.exe https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1/wkhtmltox-0.12.6.1-2.msvc2015-win64.exe
                        mkdir C:\\wkhtmltopdf
                        echo Installing wkhtmltopdf...
                        wkhtmltopdf-installer.exe /S /D=C:\\wkhtmltopdf
                        if not exist "C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" (
                            echo ERROR: wkhtmltopdf installation failed. Please install manually at C:\\wkhtmltopdf.
                        )
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
                    // Write a Node.js script to convert JUnit XML to HTML
                    writeFile file: 'generate-junit-html.js', text: '''
                        const fs = require('fs');
                        const xml2js = require('xml2js');

                        const xmlFile = 'test-results/results.xml';
                        const outputHtml = 'test-results/junit-report.html';

                        fs.readFile(xmlFile, (err, data) => {
                            if (err) {
                                console.error('Error reading XML:', err);
                                process.exit(1);
                            }

                            xml2js.parseString(data, (err, result) => {
                                if (err) {
                                    console.error('Error parsing XML:', err);
                                    process.exit(1);
                                }

                                let html = '<!DOCTYPE html><html><head><title>JUnit Test Report</title>';
                                html += '<style>';
                                html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
                                html += 'table { border-collapse: collapse; width: 100%; }';
                                html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
                                html += 'th { background-color: #f2f2f2; }';
                                html += '.pass { color: green; }';
                                html += '.fail { color: red; }';
                                html += '</style></head><body>';
                                html += '<h1>JUnit Test Report</h1>';

                                const testsuites = result.testsuites.testsuite;
                                html += '<table><tr><th>Test Suite</th><th>Tests</th><th>Failures</th><th>Time (s)</th><th>Status</th></tr>';

                                testsuites.forEach(suite => {
                                    const name = suite.$.name;
                                    const tests = suite.$.tests;
                                    const failures = suite.$.failures;
                                    const time = suite.$.time;
                                    const status = failures == 0 ? 'pass' : 'fail';
                                    html += `<tr><td>${name}</td><td>${tests}</td><td>${failures}</td><td>${time}</td><td class="${status}">${status.toUpperCase()}</td></tr>`;

                                    if (suite.testcase) {
                                        suite.testcase.forEach(test => {
                                            const testName = test.$.name;
                                            const testTime = test.$.time;
                                            const testStatus = test.failure ? 'fail' : 'pass';
                                            html += `<tr><td colspan="5">Test: ${testName} (${testTime}s) - <span class="${testStatus}">${testStatus.toUpperCase()}</span>`;
                                            if (test.failure) {
                                                const failureMessage = test.failure[0].$.message;
                                                html += `<br>Failure: ${failureMessage}`;
                                            }
                                            html += '</td></tr>';
                                        });
                                    }
                                });

                                html += '</table></body></html>';
                                fs.writeFileSync(outputHtml, html);
                                console.log('HTML report generated at:', outputHtml);
                            });
                        });
                    '''

                    // Run the script to generate HTML
                    bat '''
                        if exist "test-results\\results.xml" (
                            node generate-junit-html.js
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
                            "C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" --enable-local-file-access "test-results\\junit-report.html" "test-results\\test-report.pdf"
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