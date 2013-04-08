module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
		builddir: 'build',
		commonDir: 'common',
		pkg: grunt.file.readJSON('package.json'),
		
		concat: {
			buildJs: {
				src: ['common/*.js', 'modules/**/*.js'],
				//src: ['modules/**/*.js'],
				//src: ['common/*.js'],
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
			options:{
				force: true,
				//sub:true,
			},
			beforeconcat: ['common/module.js', 'modules/**/*.js'],
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

  // Default task(s).
	grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint:beforeconcat', 'uglify:build', 'cssmin:build']);
	//grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint:afterconcat']);
	//grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint:beforeconcat']);
};