pipeline {
  agent any

  environment {
    PROJECT_DIR = '/root/project'
    IMAGE_BASE  = 'ghcr.io/nrmadi02/hono-bun'
    GITHUB_USER = 'nrmadi02'
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

    stage('Build & Push (GitHub Actions)') {
      steps {
        echo 'Build & push GitHub Actions'
      }
    }

    stage('Deploy staging') {
      when {
        expression {
          return (env.BRANCH_NAME == 'staging') || (env.GIT_BRANCH?.contains('staging'))
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
            # NOTE: IMAGE_BASE, GITHUB_USER, PROJECT_DIR expanded locally by the shell.
            printf "%s" "$GHCR_PAT" | ssh -o StrictHostKeyChecking=no -i "$SSH_KEYFILE" "$SSH_USER"@"$SERVER_HOST" "set -e; cd ${PROJECT_DIR}; docker login ghcr.io -u ${GITHUB_USER} --password-stdin || true; docker pull ${IMAGE_BASE}:staging; docker compose -f docker-compose.staging.yml up -d"
          '''
        }
      }
    }

    stage('Deploy production') {
      when {
        expression {
          return (env.BRANCH_NAME == 'master') || (env.GIT_BRANCH?.contains('master'))
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

  options {
    disableConcurrentBuilds()
  }
}
