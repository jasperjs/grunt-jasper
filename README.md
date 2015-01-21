# grunt-jasper

> Grunt task for build and package jasper application

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-jasper --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-jasper');
```

## The "jasper" task

### Overview
In your project's Gruntfile, add a section named `jasper` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  jasper: {
    options: {
    
    },

    target: {
      options:{
        package: false
      }
    }
    
  }
})
```

### Options

#### options.singlePage
Type: `String`
Default value: `index.html'

Path to the single page, that will be modified during build process. Page must contain <!-- SCRIPTS --> and <!-- STYLES --> areas

#### options.appPath
Type: `String`
Default value: `app'

Path to application root. Task will search areas, components, etc.. in this folder.

#### options.package
Type: `Boolean`
Default value: false

If true task will package your application to 'options.packageOutput' path;

#### options.packageOutput
Type: `String`
Default value: 'dist'

Specifying destination of application package

#### options.bootstrapScripts
Type: `Array`
Default value: []

Specifying array of scripts, which bootstrap application (place in the options.singlePage)

#### options.baseCss
Type: `Array`
Default value: []

Specifying array of stylesheet, which need to be referenced to the page before components styles. You can specify here any css framework style (Twitter bootstrap) or normalize styles

### Usage Examples

In this example, the options are used to build and package jasper application. Two target are used: for development process (debug) and package (release).

```js
grunt.initConfig({
  jasper: {
    options: {
      singlePage: 'index.html',
      appPath: 'app',

      packageOutput: 'dist',
      
      bootstrapScripts: [
        'vendor/angularjs/angular.js',
        'vendor/angularjs/angular-route.js',
        'vendor/scriptjs/script.js',

        'vendor/jasper/jasper.js',

        '%areas_config%',
        '%routes_config%',
        
        'app/bootstrap.js'
      ],
      
      baseCss: [
        'vendor/bootstrap/bootstrap.min.css'
      ],

      defaultRoutePath: '/'
    },

    debug: {
      options:{
        package: false
      }
    },

    release: {
      options: {
        package: true
      }
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Licensed under the MIT license.
