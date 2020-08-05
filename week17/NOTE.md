# 每周总结可以写在这里
# 每周总结可以写在这里
##### 工具链
1. 初始化
脚手架：create-react-app / vue-cli / yeoman
2. 开发调试
- dev-tool/chrome
- webpack-dev-server / webpack
- mock
- wireshark
- charles
- postman
- eslint / prettier(代码校验及美化)
3. 测试
- mocha 
- jest
4. 发布(部署)
- lint
- webpack / gulp / grunt(打包构建)
- jenkins / CI / CD(持续集成)
- git / gitlab(代码管理)

## struct1
```
├───package.json
└───generators/
    ├───app/
    │   └───index.js
    └───router/
        └───index.js

```
package.json
```
{
  "files": [
    "generators"
  ],
}

```

## struct2
```
├───package.json
├───app/
│   └───index.js
└───router/
    └───index.js

```
package.json
```
{
  "files": [
    "app",
    "router"
  ]
}

```

## npm link
A global module may be created and symlinked to a local one, using npm.

lrwxrwxrwx 1 86187 197609  43  5月 25 22:06  nodejs -> /c/Users/86187/AppData/Roaming/nvm/v12.16.1/
lrwxrwxrwx 1 86187 197609 43  8月  2 21:18  generator-ghj -> /c/Users/86187/Documents/ghj/generator-ghj//


## Finding the project root
While running a generator, Yeoman will try to figure some things out based on the context of the folder it’s running from.

Most importantly, Yeoman searches the directory tree for a .yo-rc.json file. If found, it considers the location of the file as the root of the project. Behind the scenes, Yeoman will change the current directory to the .yo-rc.json file location and run the requested generator there.

The Storage module creates the .yo-rc.json file. Calling this.config.save() from a generator for the first time will create the file.

So, if your generator is not running in your current working directory, make sure you don’t have a .yo-rc.json somewhere up the directory tree.

# GENERATOR RUNTIME CONTEXT

## Prototype methods as actions
Each method directly attached to a Generator prototype is considered to be a task. Each task is run in sequence by the Yeoman environment run loop.

In other words, each function on the object returned by Object.getPrototypeOf(Generator) will be automatically run.

## Helper and private methods
Now that you know the prototype methods are considered to be a task, you may wonder how to define helper or private methods that won’t be called automatically. There are three different ways to achieve this.

* Prefix method name by an underscore
```
class extends Generator {
  method1() {
    console.log('hey 1');
  }

  _private_method() {
    console.log('private hey');
  }
}

```
* Use instance methods
```
 class extends Generator {
    constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts)

      this.helperMethod = function () {
        console.log('won\'t be called automatically');
      };
    }
  }

```
* Extend a parent generator:
```
 class MyBase extends Generator {
    helper() {
      console.log('methods on the parent generator won\'t be called automatically');
    }
  }

  module.exports = class extends MyBase {
    exec() {
      this.helper();
    }
  };
```

## The run loop
Running tasks sequentially is alright if there’s a single generator. But it is not enough once you start composing generators together.

That’s why Yeoman uses a run loop.

The run loop is a queue system with priority support. We use the [Grouped-queue](https://github.com/SBoudrias/grouped-queue) module to handle the run loop.

Priorities are defined in your code as special prototype method names. When a method name is the same as a priority name, the run loop pushes the method into this special queue. If the method name doesn’t match a priority, it is pushed in the default group.

In code, it will look this way:
```
class extends Generator {
  priorityName() {}
}
```

You can also group multiple methods to be run together in a queue by using a hash instead of a single method:
```
Generator.extend({
  priorityName: {
    method() {},
    method2() {}
  }
});
```

(Note that this last technique doesn’t play well with JS class definition)

The available priorities are (in running order):

  1. initializing - Your initialization methods (checking current project state, getting configs, etc)
  2. prompting - Where you prompt users for options (where you’d call this.prompt())
  3. configuring - Saving configurations and configure the project (creating .editorconfig files and other metadata files)
  4. default - If the method name doesn’t match a priority, it will be pushed to this group.
  5. writing - Where you write the generator specific files (routes, controllers, etc)
  6. conflicts - Where conflicts are handled (used internally)
  7. install - Where installations are run (npm, bower)
  8. end - Called last, cleanup, say good bye, etc
  9. Follow these priorities guidelines and your generator will play nice with others.

## Asynchronous tasks

There are multiple ways to pause the run loop until a task is done doing work asynchronously.

The easiest way is to return a promise. The loop will continue once the promise resolves, or it’ll raise an exception and stop if it fails.

If the asynchronous API you’re relying upon doesn’t support promises, then you can rely on the legacy this.async() way. Calling this.async() will return a function to call once the task is done. For example:
```
asyncTask() {
  var done = this.async();

  getUserEmail(function (err, name) {
    done(err);
  });
}
```

If the done function is called with an error parameter, the run loop will stop and an exception will be raised.

# INTERACTING WITH THE USER

Your generator will interact a lot with the end user. By default Yeoman runs on a terminal, but it also supports custom user interfaces that different tools can provide. For example, nothing prevents a Yeoman generator from being run inside of a graphical tool like an editor or a standalone app.

To allow for this flexibility, Yeoman provides a set of user interface element abstractions. It is your responsibility as an author to only use those abstractions when interacting with your end user. Using other ways will probably prevent your generator from running correctly in different Yeoman tools.

For example, it is important to never use console.log() or process.stdout.write() to output content. Using them would hide the output from users not using a terminal. Instead, always rely on the UI generic this.log() method, where this is the context of your current generator.

## User interactions
### Prompts
Prompts are the main way a generator interacts with a user. The prompt module is provided by [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) and you should refer to its API for a list of available prompt options.

The prompt method is asynchronous and returns a promise. You’ll need to return the promise from your task in order to wait for its completion before running the next one. (learn more about asynchronous task)

Note here that we use the prompting queue to ask for feedback from the user.

### Using user answers at a later stage
A very common scenario is to use the user answers at a later stage, e.g. in writing queue. This can be easily achieved by adding them to this context:

```
module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: "confirm",
        name: "cool",
        message: "Would you like to enable the Cool feature?"
      }
    ]);
  }

  writing() {
    this.log("cool feature", this.answers.cool); // user answer `cool` used
  }
};

```
### Remembering user preferences
A user may give the same input to certain questions every time they run your generator. For these questions, you probably want to remember what the user answered previously and use that answer as the new default.

Yeoman extends the Inquirer.js API by adding a store property to question objects. This property allows you to specify that the user provided answer should be used as the default answer in the future. This can be done as follows:

Note: Providing a default value will prevent the user from returning any empty answers.
```
this.prompt({
  type: "input",
  name: "username",
  message: "What's your GitHub username",
  store: true
});

```
If you’re only looking to store data without being directly tied to the prompt, make sure to [checkout the Yeoman storage documentation](https://yeoman.io/authoring/storage.html)

### Arguments
Arguments are passed directly from the command line
`yo webapp my-project`

In this example, my-project would be the first argument.

To notify the system that we expect an argument, we use the this.argument() method. This method accepts a name (String) and an optional hash of options.

The name argument will then be available as: this.options[name].

The options hash accepts multiple key-value pairs:

* desc Description for the argument
* required Boolean whether it is required
* type String, Number, Array (can also be a custom function receiving the raw string value and parsing it)
* default Default value for this argument
This method must be called inside the constructor method. Otherwise Yeoman won’t be able to output the relevant help information when a user calls your generator with the help option: e.g. yo webapp --help.

Here is an example
```
module.exports = class extends Generator {
  // note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);

    // This makes `appname` a required argument.
    this.argument("appname", { type: String, required: true });

    // And you can then access it later; e.g.
    this.log(this.options.appname);
  }
};
```

Argument of type Array will contain all remaining arguments passed to the generator

### Options
Options look a lot like arguments, but they are written as command line flags.
`yo webapp --coffee`

To notify the system that we expect an option, we use the this.option() method. This method accepts a name (String) and an optional hash of options.

The name value will be used to retrieve the option at the matching key this.options[name].

The options hash (the second argument) accepts multiple key-value pairs

* desc Description for the option
* alias Short name for option
* type Either Boolean, String or Number (can also be a custom function receiving the raw string value and parsing it)
* default Default value
* hide Boolean whether to hide from help

Here is an example:

```
module.exports = class extends Generator {
  // note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);

    // This method adds support for a `--coffee` flag
    this.option("coffee");

    // And you can then access it later; e.g.
    this.scriptSuffix = this.options.coffee ? ".coffee" : ".js";
  }
};

```
### Outputting Information

Outputting information is handled by the this.log module.

The main method you’ll use is simply this.log (e.g. this.log('Hey! Welcome to my awesome generator')). It takes a string and outputs it to the user; basically it mimics console.log() when used inside of a terminal session. You can use it like so:

```
module.exports = class extends Generator {
  myAction() {
    this.log("Something has gone wrong!");
  }
};
```

There’s also some other helper methods you can find in the [API documentation.](https://yeoman.github.io/environment/TerminalAdapter.html)

# COMPOSABILITY

> Composability is a way to combine smaller parts to make one large thing. Sort of like Voltron®

Yeoman offers multiple ways for generators to build upon common ground. There’s no sense in rewriting the same functionality, so an API is provided to use generators inside other generators.

In Yeoman, composability can be initiated in two ways:

* A generator can decide to compose itself with another generator (e.g., generator-backbone uses generator-mocha).
* An end user may also initiate the composition (e.g., Simon wants to generate a Backbone project with SASS and Rails). Note: end user initiated composition is a planned feature and currently not available

**this.composeWith()**

The composeWith method allows the generator to run side-by-side with another generator (or subgenerator). That way it can use features from the other generator instead of having to do it all by itself.

When composing, don’t forget about the running context and the run loop. On a given priority group execution, all composed generators will execute functions in that group. Afterwards, this will repeat for the next group. Execution between the generators is the same order as composeWith was called, see execution example.

```
// In my-generator/generators/turbo/index.js
module.exports = class extends Generator {
  prompting() {
    this.log('prompting - turbo');
  }

  writing() {
    this.log('writing - turbo');
  }
};

// In my-generator/generators/electric/index.js
module.exports = class extends Generator {
  prompting() {
    this.log('prompting - zap');
  }

  writing() {
    this.log('writing - zap');
  }
};

// In my-generator/generators/app/index.js
module.exports = class extends Generator {
  initializing() {
    this.composeWith(require.resolve('../turbo'));
    this.composeWith(require.resolve('../electric'));
  }
};

```
## API

composeWith takes two parameters.

generatorPath - A full path pointing to the generator you want to compose with (usually using require.resolve()).
options - An Object containing options to pass to the composed generator once it runs.
When composing with a peerDependencies generator:

`this.composeWith(require.resolve('generator-bootstrap/generators/app'), {preprocessor: 'sass'});`

require.resolve() returns the path from where Node.js would load the provided module.

Note: If you need to pass arguments to a Generator based on a version of yeoman-generator older than 1.0, you can do that by providing an Array as the options.arguments key.

Even though it is not an encouraged practice, you can also pass a generator namespace to composeWith. In that case, Yeoman will try to find that generator installed as a peerDependencies or globally on the end user system.

```
this.composeWith('backbone:route', {rjs: true});
```

## composing with a Generator class
composeWith can also take an object as its first argument. The object should have the following properties defined:

Generator - The generator class to compose with
path - The path to the generator files
This will let you compose with generator classes defined in your project or imported from other modules. Passing options as the second argument to composeWith works as expected

```
// Import generator-node's main generator
const NodeGenerator = require('generator-node/generators/app/index.js');

// Compose with it
this.composeWith({
  Generator: NodeGenerator,
  path: require.resolve('generator-node/generators/app')
});
```

You can alter the function call order by reversing the calls for composeWith.

Keep in mind you can compose with other public generators available on npm.

For a more complex example of composability, check out [generator-generator](https://github.com/yeoman/generator-generator/blob/master/app/index.js) which is composed of [generator-node](https://github.com/yeoman/generator-node).

## dependencies or peerDependencies

npm allows three types of dependencies:

* dependencies get installed local to the generator. It is the best option to control the version of the dependency used. This is the preferred option.
* peerDependencies get installed alongside the generator, as a sibling. For example, if generator-backbone declared generator-gruntfile as a peer dependency, the folder tree would look this way:

```
├───generator-backbone/
└───generator-gruntfile/

```
* devDependencies for testing and development utility. This is not needed here.

When using peerDependencies, be aware other modules may also need the requested module. Take care not to create version conflicts by requesting a specific version (or a narrow range of versions). Yeoman’s recommendation with peerDependencies is to always request higher or equal to (>=) or any (*) available versions. For example:

```
{
  "peerDependencies": {
    "generator-gruntfile": "*",
    "generator-bootstrap": ">=1.0.0"
  }
}
```
Note: as of npm@3, peerDependencies are no longer automatically installed. To install these dependencies, they must be manually installed: npm install generator-yourgenerator generator-gruntfile generator-bootstrap@">=1.0.0"

## MANAGING DEPENDENCIES

Once you’ve run your generators, you’ll often want to run npm (or Yarn) and Bower to install any additional dependencies your generators require.

As these tasks are very frequent, Yeoman already abstracts them away. We’ll also cover how you can launch installation through other tools.

Note that Yeoman provided installation helpers will automatically schedule the installation to run once as part of the install queue. If you need to run anything after they’ve run, use the end queue

## npm
You just need to call this.npmInstall() to run an npm installation. Yeoman will ensure the npm install command is only run once even if it is called multiple times by multiple generators.

For example you want to install lodash as a dev dependency:

```
class extends Generator {
  installingLodash() {
    this.npmInstall(['lodash'], { 'save-dev': true });
  }
}
```

### Manage npm dependencies programmatically

You can programatically create or extend your package.json file if you don’t want to use a template but like to have fixed versions of your dependencies. Yeomans file system tools can help you to get this job done.

Example defining eslint as dev dependency and react as dependency:

```
class extends Generator {
  writing() {
    const pkgJson = {
      devDependencies: {
        eslint: '^3.15.0'
      },
      dependencies: {
        react: '^16.2.0'
      }
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
  }

  install() {
    this.npmInstall();
  }
};
```

## Yarn
You just need to call this.yarnInstall() to launch the installation. Yeoman will ensure the yarn install command is only run once even if it is called multiple time by multiple generators.

For example you want to install lodash as a dev dependency:
```
generators.Base.extend({
  installingLodash: function() {
    this.yarnInstall(['lodash'], { 'dev': true });
  }
});
```

## Bower
You just need to call this.bowerInstall() to launch the installation. Yeoman will ensure the bower install command is only run once even if it is called multiple time by multiple generators.

## Combined use
Calling this.installDependencies() runs npm and bower by default. You can decide which ones to use by passing booleans for each package manager.

Example for using Yarn with Bower:
```
generators.Base.extend({
  install: function () {
    this.installDependencies({
      npm: false,
      bower: true,
      yarn: true
    });
  }
});
```

## Using other tools
Yeoman provides an abstraction to allow users to spawn any CLI commands. This abstraction will normalize to command so it can run seamlessly in Linux, Mac and Windows system.

For example, if you’re a PHP aficionado and wished to run composer, you’d write it this way:
```
class extends Generator {
  install() {
    this.spawnCommand('composer', ['install']);
  }
}

```
Make sure to call the spawnCommand method inside the install queue. Your users don’t want to wait for an installation command to complete.

# WORKING WITH THE FILE SYSTEM
## Location contexts and paths
Yeoman file utilities are based on the idea you always have two location contexts on disk. These contexts are folders your generator will most likely read from and write to.

## Destination context
The first context is the destination context. The destination is the folder in which Yeoman will be scaffolding a new application. It is your user project folder, it is where you’ll write most of the scaffolding.

The destination context is defined as either the current working directory or the closest parent folder containing a .yo-rc.json file. The .yo-rc.json file defines the root of a Yeoman project. This file allows your user to run commands in subdirectories and have them work on the project. This ensures a consistent behaviour for the end user.

You can get the destination path using this.destinationRoot() or by joining a path using this.destinationPath('sub/path').

```
// Given destination root is ~/projects
class extends Generator {
  paths() {
    this.destinationRoot();
    // returns '~/projects'

    this.destinationPath('index.js');
    // returns '~/projects/index.js'
  }
}
```

And you can manually set it using this.destinationRoot('new/path'). But for consistency, you probably shouldn’t change the default destination.

If you want to know from where the user is running yo, then you can get the path with this.contextRoot. This is the raw path where yo was invoked from; before we determine the project root with .yo-rc.json.

## Template context
The template context is the folder in which you store your template files. It is usually the folder from which you’ll read and copy.

The template context is defined as ./templates/ by default. You can overwrite this default by using this.sourceRoot('new/template/path').

You can get the path value using this.sourceRoot() or by joining a path using this.templatePath('app/index.js')
```
class extends Generator {
  paths() {
    this.sourceRoot();
    // returns './templates'

    this.templatePath('index.js');
    // returns './templates/index.js'
  }
};
```

## An “in memory” file system
Yeoman is very careful when it comes to overwriting users files. Basically, every write happening on a pre-existing file will go through a conflict resolution process. This process requires that the user validate every file write that overwrites content to its file.

This behaviour prevents bad surprises and limits the risk of errors. On the other hand, this means every file is written asynchronously to the disk.

As asynchronous APIs are harder to use, Yeoman provide a synchronous file-system API where every file gets written to an [in-memory file system](https://github.com/sboudrias/mem-fs) and are only written to disk once when Yeoman is done running.

This memory file system is shared between all composed generators.

## File utilities
Generators expose all file methods on this.fs, which is an instance of mem-fs editor - make sure to check the module documentation for all available methods.

It is worth noting that although this.fs exposes commit, you should not call it in your generator. Yeoman calls this internally after the conflicts stage of the run loop.

Example: Copying a template file
Here’s an example where we’d want to copy and process a template file.

Given the content of ./templates/index.html is:

```
<html>
  <head>
    <title><%= title %></title>
  </head>
</html>

```
We’ll then use the copyTpl method to copy the file while processing the content as a template. copyTpl is using [ejs template syntax](https://ejs.co/).
```
class extends Generator {
  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: 'Templating with Yeoman' }
    );
  }
}
```
Once the generator is done running, public/index.html will contain:
```
<html>
  <head>
    <title>Templating with Yeoman</title>
  </head>
</html>

```
A very common scenario is to store user answers at the prompting stage and use them for templating

## Transform output files through streams
The generator system allows you to apply custom filters on every file writes. Automatically beautifying files, normalizing whitespace, etc, is totally possible.

Once per Yeoman process, we will write every modified file to disk. This process is passed through a [vinyl](https://github.com/wearefractal/vinyl) object stream (just like gulp). Any generator author can register a transformStream to modify the file path and/or the content.

Registering a new modifier is done through the registerTransformStream() method. Here’s an example:
```
var beautify = require("gulp-beautify");
this.registerTransformStream(beautify({ indent_size: 2 }));
```

Note that every file of any type will be passed through this stream. Make sure any transform stream will passthrough the files it doesn’t support. Tools like gulp-if or gulp-filter will help filter invalid types and pass them through.

You can basically use any gulp plugins with the Yeoman transform stream to process generated files during the writing phase.

## Tip: Update existing file’s content
Updating a pre-existing file is not always a simple task. The most reliable way to do so is to parse the file AST ([abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)) and edit it. The main issue with this solution is that editing an AST can be verbose and a bit hard to grasp.

Some popular AST parsers are:

* [Cheerio](https://github.com/cheeriojs/cheerio) for parsing HTML.
* [Esprima](https://github.com/ariya/esprima) for parsing JavaScript - you might be interested in [AST-Query](https://github.com/SBoudrias/ast-query) which provide a lower level API to edit Esprima syntax tree.
* For JSON files, you can use the [native JSON object methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON).
* [Gruntfile](https://github.com/SBoudrias/gruntfile-editor) Editor to dynamically modify a Gruntfile.

Parsing a code file with RegEx is a perilous path, and before doing so, you should read this CS anthropological answers and grasp the flaws of RegEx parsing. If you do choose to edit existing files using RegEx rather than AST tree, please be careful and provide complete unit tests. - Please please, don’t break your users’ code.

# MANAGING CONFIGURATION

Storing user configuration options and sharing them between sub-generators is a common task. For example, it is common to share preferences like the language (does the user use CoffeeScript?), style options (indenting with spaces or tabs), etc.

These configurations can be stored in the .yo-rc.json file through the Yeoman Storage API. This API is accessible through the generator.config object.

Here are some common methods you’ll use.

## Methods
### this.config.save()
This method will write the configuration to the .yo-rc.json file. If the file doesn’t exist yet, the save method will create it.

The .yo-rc.json file also determines the root of a project. Because of that, even if you’re not using storage for anything, it is considered to be a best practice to always call save inside your :app generator.

Also note that the save method is called automatically each time you set a configuration option. So you usually won’t need to call it explicitly.

### this.config.set()
set either takes a key and an associated value, or an object hash of multiple keys/values.

Note that values must be JSON serializable (String, Number or non-recursive objects).

### this.config.get()
get takes a String key as parameter and returns the associated value.

### this.config.getAll()
Returns an object of the full available configuration.

The returned object is passed by value, not reference. This means you still need to use the set method to update the configuration store.

### this.config.delete()
Deletes a key.

### this.config.defaults()
Accepts a hash of options to use as defaults values. If a key/value pair already exist, the value will remain untouched. If a key is missing, it will be added.

## .yo-rc.json structure

The .yo-rc.json file is a JSON file where configuration objects from multiple generators are stored. Each generator configuration is namespaced to ensure no naming conflicts occur between generators.

This also means each generator configuration is sandboxed and can only be shared between sub-generators. You cannot share configurations between different generators using the storage API. Use options and arguments during invocation to share data between different generators.

Here’s what a .yo-rc.json file looks like internally:
```
{
  "generator-backbone": {
    "requirejs": true,
    "coffee": true
  },
  "generator-gruntfile": {
    "compass": false
  }
}

```

The structure is pretty comprehensive for your end user. This means, you may wish to store advanced configurations inside this file and ask advanced users to edit the file directly when it doesn’t make sense to use prompts for every option.

# ESTING GENERATORS

