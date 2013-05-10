/**
Lint, concat, & minify (uglify) process (since ONLY want to lint & minify files that haven't already been minified BUT want concat ALL files (including already minified ones) into ONE final file)
1. lint all non-minified (i.e. custom built as opposed to 3rd party) files
2. minify these custom built files (this also concats them into one)
3. concat all the (now minified) files - the custom built one AND all existing (3rd party) minified ones

@usage
`grunt`
`grunt doubleConcat` to generate non minified version of .js file as well as min.js version
*/

module.exports = function(grunt) {

	var config ={
		//lintFiles: ['common/module.js', 'modules/**/*.js'],
		lintFiles: ['common/*.js', 'modules/**/*.js'],
		customMinifyFile: 'temp/custom.min.js',
		customFile: 'temp/custom.js',
		concatFilesExt: ['common/ext/*.js'],
		concatFiles: [],
		concatFilesMin: []		//will be built below as combination of concatFilesExt and customMinifiyFile
	};
	config.concatFilesMin =config.concatFilesExt.concat(config.customMinifyFile);
	config.concatFiles =config.concatFilesExt.concat(config.customFile);
		
	// Project configuration.
	grunt.initConfig({
		builddir: 'build',
		commonDir: 'common',
		customMinifyFile: config.customMinifyFile,
		customFile: config.customFile,
		pkg: grunt.file.readJSON('package.json'),
		
		concat: {
			buildJs: {
				// options: {
					// separator: '\n\n'
				// },
				src: config.concatFilesMin,
				//src: ['common/*.js', 'modules/**/*.js'],
				//src: ['modules/**/*.js'],
				//src: ['common/*.js'],
				//dest: '<%= builddir %>/<%= pkg.name %>.js'
				dest: '<%= builddir %>/<%= pkg.name %>.min.js'
			},
			doubleConcat: {
				src: config.lintFiles,
				//dest: '<%= customFile %>'
				dest: '<%= builddir %>/<%= pkg.name %>.js'
			},
			doubleConcatAfterMin: {
				//src: config.concatFiles,
				src: config.concatFilesMin,
				dest: '<%= builddir %>/<%= pkg.name %>.min.js'
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
				globalstrict:	true,
				browser:		true,
				devel:			true,
				globals: {
					angular:	false,
					$:			false,
					FB:			false,
					PG:			false,
					CDV:		false,
					gapi:		false,
					globalPhoneGap:	false,		//@todo - fix this?
					escape:		false,		//apparently escape function isn't part of the "standard"
					unescape:	false		//apparently unescape function isn't part of the "standard"
				}
			},
			//beforeconcat: ['common/module.js', 'modules/**/*.js'],
			beforeconcat: config.lintFiles,
			afterconcat: ['<%= builddir %>/<%= pkg.name %>.js']
		},
		uglify: {
			options: {
				//banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
				mangle: false
				//beautify:true
			},
			build: {
				files: {
					//'<%= builddir %>/<%= pkg.name %>.min.js': ['<%= builddir %>/<%= pkg.name %>.js']
					'<%= customMinifyFile %>': config.lintFiles
				}
			},
			doubleConcat:{
				files: {
					'<%= customMinifyFile %>': ['<%= customFile %>']
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
	grunt.registerTask('default', ['jshint:beforeconcat', 'uglify:build', 'less:dev', 'concat:buildJs', 'cssmin:build']);
	//grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint:beforeconcat', 'uglify:build', 'cssmin:build']);
	//grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint:afterconcat']);
	//grunt.registerTask('default', ['concat:buildJs', 'less:dev', 'jshint:beforeconcat']);
	
	//build non-minified version of js file as well as minified version
	grunt.registerTask('doubleConcat', ['jshint:beforeconcat', 'concat:doubleConcat', 'uglify:doubleConcat', 'concat:doubleConcatAfterMin', 'less:dev', 'cssmin:build']);
};