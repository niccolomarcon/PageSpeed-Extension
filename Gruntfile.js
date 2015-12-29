module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      my_target: {
        files: {
          'dist/js/options.min.js': ['js/defaults.js', 'js/options.js'],
          'dist/js/popup.min.js': ['js/defaults.js', 'js/popup.js']
        }
      }
    },
    cssmin: {
      target: {
        files: {
          'dist/css/popup.min.css': 'css/popup.css'
        }
      }
    },
    minjson: {
      compile: {
        files: {
          'dist/manifest.json': 'manifest.json'
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'tmp/options.html': 'options.html',
          'tmp/popup.html': 'popup.html'
        }
      }
    },
    copy: {
      main: {
        src: 'media/*',
        dest: 'dist/'
      }
    },
    shell: {
      dep: {
        command: 'zip -r -X extension.zip dist'
      },
      clear: {
        command: 'rm -rf tmp'
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true
        },
        files: {
          'dist/popup.html': 'tmp/popup.html',
          'dist/options.html': 'tmp/options.html'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-minjson');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['uglify', 'cssmin', 'minjson', 'processhtml', 'copy', 'htmlmin', 'shell:clear']);
  grunt.registerTask('deploy', ['default', 'shell:dep']);
  
};
  