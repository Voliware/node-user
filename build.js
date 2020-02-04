const NodeBuild = require('@voliware/node-build');
const version = require('./package.json').version;

// js
const jsInput = [
    './node_modules/@voliware/template2/dist/template2-bundle.min.js',
    './public/js/routes.js',
    './public/js/loginForm.js',
    './public/js/registerForm.js',
    './public/js/resetForm.js',
    './public/js/user.js',
    './public/js/userTemplate.js',
    './public/js/userApp.js',
    './public/js/app.js'
];
const jsOutput = "./public/js/app.min.js"
const jsConfig = {
    name: "node-user JS",
    version: version, 
    input: jsInput,
    output: jsOutput
};

// css
const cssInput = [
    './node_modules/@voliware/template2/dist/template2.min.css',
    './public/css/style.css'
];
const cssOutput = "./public/css/style.min.css";
const cssConfig = {
    name: "node-user CSS",
    version: version,
    input: cssInput,
    output: cssOutput
};

// html
// todo: do it
// let template1 = "./public/html/template1.html"
// let template2 = "./public/html/template2.html"
// let inject = new Injector("./public/html/test.html")
//     .inject(template1, 'template1')
//     .inject(template2, 'template2')
//     .run();

// build
const configs = [jsConfig, cssConfig];
new NodeBuild.Build(configs).run();