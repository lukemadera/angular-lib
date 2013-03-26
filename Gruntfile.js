module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
		builddir: 'build',
		commonDir: 'common',
		pkg: grunt.file.readJSON('package.json'),
		
		concat: {
			buildJs: {
				src: ['common/*.js', 'modules/**/*.js'],
				dest: '<%= builddir %>/<%= pkg.name %>.js'
			}
		},
		less: {
			dev: {
				options: {
				},
				files: {
					"<%= builddir %>/<%= pkg.name %>.css": "<%= commonDir %>/less/<%= pkg.name %>.less"
				}
			},
			prod: {
				options: {
					yuicompress: true
				},
				files: {
					"<%= builddir %>/<%= pkg.name %>.css": "<%= commonDir %>/less/<%= pkg.name %>.less"
				}
			}
		},
		jshint: {
			//beforeconcat: ['src/foo.js', 'src/bar.js'],
			afterconcat: ['<%= builddir %>/<%= pkg.name %>.js']
		},
    uglify: {
      options: {
        //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
				mangle: false
      },
      build: {
        files: {
					'<%= builddir %>/<%= pkg.name %>.min.js': ['<%= builddir %>/<%= pkg.name %>.js']
				}
      }
    },
		cssmin: {
			build: {
				files: {
					'<%= builddir %>/<%= pkg.name %>.css': ['<%= builddir %>/<%= pkg.name %>.min.css']
				}
			},
		}
  });

  // Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	//grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.loadTasks('grunt-tasks');

  // Default task(s).
	grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint', 'uglify:build', 'cssmin:build']);
};