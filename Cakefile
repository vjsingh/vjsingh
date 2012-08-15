{spawn, exec} = require 'child_process'
watch         = require 'nodewatch'
path          = require 'path'

task 'jade:compile', 'compile jade templates from /src/templates to /tmp/templates', ->
  exec 'jade src/templates/ --out tmp/templates/', (err, stdout, stderr) ->
    err && throw err
    console.log 'Jade templates compiled!'
    invoke 'underscore:renameTemplates'

task 'underscore:renameTemplates', 'Rename underscore templates from html to .us', ->
  exec 'for file in tmp/templates/*.html; do mv ${file} ${file%.html}.us; done;', (err, stdout, stderr) ->
    err && throw err
    console.log 'Underscore templates renamed!'
    invoke 'underscore:compileTemplates'

task 'underscore:compileTemplates', 'Compile and minify all underscore templates', ->
  exec 'tplcpl -t tmp/templates/ -o public/js/templates.js;', (err, stdout, stderr) ->
    err && throw err
    console.log 'Underscore templates compiled!'

task 'less:compile', 'Compiles less files', ->
  exec 'lessc src/css/styles.less public/css/styles.css', (err, stdout, stderr) ->
    err && throw err
    console.log 'less compiled!'

task 'coffee:compile', 'Compiles coffee files', ->
  exec 'coffee --output public/js/ --compile src/js/', (err, stdout, stderr) ->
    err && throw err
    console.log 'coffee compiled!'

#
# Watch for changes in source files, and compile as saved
# 
task 'watch', 'watches for changes in source files', ->
  # Compile all on startup
  console.log("compiling...");
  invoke 'jade:compile'
  #invoke 'less:copyLess'
  invoke 'coffee:compile'

  console.log("Watching files")
  watch.add("./src/", true).onChange((file,prev,curr,action) ->
    console.log(file)
    ext = path.extname(file).substr(1)
    if ext == 'jade'
      invoke 'jade:compile'
    else if ext == 'less'
      #invoke 'less:compile'
    else if ext == 'coffee'
      invoke 'coffee:compile'
  )
