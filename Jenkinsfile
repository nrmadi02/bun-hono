pipeline {
  agent any

  environment {
    PROJECT_DIR = '/root/project'
    IMAGE_BASE  = 'ghcr.io/nrmadi02/hono-bun'
    GITHUB_USER = 'nrmadi02'
    SLACK_CHANNEL = '#deployment'  
    SLACK_CREDENTIAL_ID = 'slack-token' 
  }

  stages {
    stage('Debug branch') {
      steps {
        sh '''
          echo "BRANCH_NAME=${BRANCH_NAME}"
          echo "GIT_BRANCH=${GIT_BRANCH}"
        '''
      }
    }

    stage('Deploy staging') {
      when {
        expression {
          return (env.BRANCH_NAME == 'staging') || 
                 (env.GIT_BRANCH?.contains('staging'))
        }
      }
      steps {
        withCredentials([
          sshUserPrivateKey(credentialsId: 'ssh-ubuntu-key', keyFileVariable: 'SSH_KEYFILE', usernameVariable: 'SSH_USER'),
          string(credentialsId: 'ghcr-pat', variable: 'GHCR_PAT'),
          string(credentialsId: 'server-host', variable: 'SERVER_HOST')
        ]) {
          sh '''
            set -e
            chmod 600 "$SSH_KEYFILE"

            # Pipe secret (GHCR_PAT) into remote docker login stdin.
            printf "%s" "$GHCR_PAT" | ssh -o StrictHostKeyChecking=no -i "$SSH_KEYFILE" "$SSH_USER"@"$SERVER_HOST" "set -e; cd ${PROJECT_DIR}; docker login ghcr.io -u ${GITHUB_USER} --password-stdin || true; docker pull ${IMAGE_BASE}:staging; docker compose -f docker-compose.staging.yml up -d"
          '''
        }
      }
    }

    stage('Deploy production') {
      when {
        expression {
          return (env.BRANCH_NAME == 'master') || 
                 (env.GIT_BRANCH?.contains('master'))
        }
      }
      steps {
        withCredentials([
          sshUserPrivateKey(credentialsId: 'ssh-ubuntu-key', keyFileVariable: 'SSH_KEYFILE', usernameVariable: 'SSH_USER'),
          string(credentialsId: 'ghcr-pat', variable: 'GHCR_PAT'),
          string(credentialsId: 'server-host', variable: 'SERVER_HOST')
        ]) {
          sh '''
            set -e
            chmod 600 "$SSH_KEYFILE"

            # Pipe secret into remote docker login stdin, expand safe vars locally
            printf "%s" "$GHCR_PAT" | ssh -o StrictHostKeyChecking=no -i "$SSH_KEYFILE" "$SSH_USER"@"$SERVER_HOST" "set -e; cd ${PROJECT_DIR}; docker login ghcr.io -u ${GITHUB_USER} --password-stdin || true; docker pull ${IMAGE_BASE}:production; docker compose -f docker-compose.production.yml up -d"
          '''
        }
      }
    }
  }

  post {
    success {
      script {
        def environment = env.GIT_BRANCH?.contains('staging') ? 'STAGING' : 'PRODUCTION'
        def branch = env.GIT_BRANCH?.split('/')?.last()
        slackSend(
          channel: env.SLACK_CHANNEL,
          color: 'good',
          message: "*Deployment ${environment} SUCCESS*\nJob: `${env.JOB_NAME}`\nBuild: #${env.BUILD_NUMBER}\nBranch: ${branch}\n<${env.BUILD_URL}|View Build>",
          tokenCredentialId: env.SLACK_CREDENTIAL_ID
        )
      }
    }
    
    failure {
      script {
        def environment = env.GIT_BRANCH?.contains('staging') ? 'STAGING' : 'PRODUCTION'
        def branch = env.GIT_BRANCH?.split('/')?.last()
        slackSend(
          channel: env.SLACK_CHANNEL,
          color: 'danger',
          message: "*Deployment ${environment} FAILED*\nJob: `${env.JOB_NAME}`\nBuild: #${env.BUILD_NUMBER}\nBranch: ${branch}\n<${env.BUILD_URL}|View Build>",
          tokenCredentialId: env.SLACK_CREDENTIAL_ID
        )
      }
    }
    
    aborted {
      script {
        def environment = env.GIT_BRANCH?.contains('staging') ? 'STAGING' : 'PRODUCTION'
        def branch = env.GIT_BRANCH?.split('/')?.last()
        slackSend(
          channel: env.SLACK_CHANNEL,
          color: 'warning',
          message: "*Deployment ${environment} ABORTED*\nJob: `${env.JOB_NAME}`\nBuild: #${env.BUILD_NUMBER}\nBranch: ${branch}\n<${env.BUILD_URL}|View Build>",
          tokenCredentialId: env.SLACK_CREDENTIAL_ID
        )
      }
    }
  }

  options {
    disableConcurrentBuilds()
  }
}
