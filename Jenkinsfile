node ('controls') {
def version = "3.19.100"
def workspace = "/home/sbis/workspace/router_${version}/${BRANCH_NAME}"
    ws (workspace){
    deleteDir()
    checkout([$class: 'GitSCM',
        branches: [[name: "rc-${version}"]],
        doGenerateSubmoduleConfigurations: false,
        extensions: [[
            $class: 'RelativeTargetDirectory',
            relativeTargetDir: "jenkins_pipeline"
            ]],
            submoduleCfg: [],
            userRemoteConfigs: [[
                credentialsId: 'ae2eb912-9d99-4c34-ace5-e13487a9a20b',
                url: 'git@git.sbis.ru:sbis-ci/jenkins_pipeline.git']]
                                ])
    load "./platforma/branch/Jenkinsfile"
    }
}
