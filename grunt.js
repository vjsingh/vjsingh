// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib');

  grunt.initConfig({

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: ["dist/"],

    // The concatenate task is used here to merge the almond require/define
    // shim and the templates into the application code.  It's named
    // dist/debug/require.js, because we want to only load one script file in
    // index.html.
    concat: {
      dist: {
        src: ["static/js/libs/require.js", "static/js/templates.js", "dist/debug/require.js"],
        //dest: "dist/debug/require.js"
        dest: "dist/release/require.js"
      }
    },

    // This task uses the MinCSS Node.js project to take all your CSS files in
    // order and concatenate them into a single CSS file named index.css.  It
    // also minifies all the CSS as well.  This is named index.css, because we
    // only want to load one stylesheet in index.html.
    mincss: {
      "dist/release/styles.min.css": [
        "dist/debug/styles.less.css"
      ]
    },

    // Takes the built require.js file and minifies it for filesize benefits.
    min: {
      dist: {
        src: "dist/debug/venmo.app.js",
        dest: "dist/release/require.js"
      }
      /*
      deps: {
        src: "static/js/api/venmo.deps.js",
        dest: "dist/release/require.js"
      }
      */
    },

    // Running the server without specifying an action will run the defaults,
    // port: 8000 and host: 127.0.0.1.  If you would like to change these
    // defaults, simply add in the properties `port` and `host` respectively.
    // Alternatively you can omit the port and host properties and the server
    // task will instead default to process.env.PORT or process.env.HOST.
    //
    // Changing the defaults might look something like this:
    //
    // server: {
    //   host: "127.0.0.1", port: 9001
    //   debug: { ... can set host and port here too ...
    //  }
    //
    //  To learn more about using the server task, please refer to the code
    //  until documentation has been written.
    /*
    server: {
      // Ensure the favicon is mapped correctly.
      files: { "favicon.ico": "favicon.ico" },

      debug: {
        // Ensure the favicon is mapped correctly.
        files: { "favicon.ico": "favicon.ico" },

        // Map `server:debug` to `debug` folders.
        folders: {
          "app": "dist/debug",
          "assets/js/libs": "dist/debug"
        }
      },
      release: {
        // This makes it easier for deploying, by defaulting to any IP.
        host: "0.0.0.0",

        // Ensure the favicon is mapped correctly.
        files: { "favicon.ico": "favicon.ico" },

        // Map `server:release` to `release` folders.
        folders: {
          "app": "dist/release",
          "assets/js/libs": "dist/release",
          "assets/css": "dist/release"
        }
      }
    },
    */

    // This task uses James Burke's excellent r.js AMD build tool.  In the
    // future other builders may be contributed as drop-in alternatives.
    // NOT WORKING FOR SOME REASON, compiling in ./doProd
    /*
    requirejs: {
      compile: {
        options: {
          baseUrl: './static/js/',
          // Include the main configuration file.
          mainConfigFile: "./static/js/config.js",

          // Output file.
          out: "dist/debug/require.js",

          // Root application module.
          name: "main",

          // Do not wrap everything in an IIFE.
          wrap: false
        }
      }
    },
    */

    /*
    // The headless QUnit testing environment is provided for "free" by Grunt.
    // Simply point the configuration to your test directory.
    qunit: {
      all: ["test/qunit/*.html"]
    },

    // The headless Jasmine testing is provided by grunt-jasmine-task. Simply
    // point the configuration to your test directory.
    jasmine: {
      all: ["test/jasmine/*.html"]
    }
    */

  });

  // The debug task will remove all contents inside the dist/ folder, lint
  // all your code, precompile all the underscore templates into
  // dist/debug/templates.js, compile all the application code into
  // dist/debug/require.js, and then concatenate the require/define shim
  // almond.js and dist/debug/templates.js into the require.js file.
  //grunt.registerTask("debug", "clean requirejs concat");
  //grunt.registerTask("debug", "concat");

  // The release task will run the debug tasks and then minify the
  // dist/debug/require.js file and CSS files.
  grunt.registerTask("release", "min mincss");

};
