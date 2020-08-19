var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);
    }
    collect() {
        this.log('collect');
    }
    create() {
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.deleteDestination('package.json'),
            { title: 'tempalte with Yeoman' }
        )
        this.npmInstall([
            'webpack',
            'webpack-cli',
            'webpack-dev-server',
            '@babel/core',
            '@babel/plugin-transform-react-jsx',
            '@babel/preset-dev'
        ], {'save-dev': true})
    }
};