const NodeBuild = require('@voliware/node-build');
const version = require('./package.json').version;

// js core, no template library
const jsInput = [
    './public/js/routes.js',
    './public/js/loginForm.js',
    './public/js/registerForm.js',
    './public/js/resetForm.js',
    './public/js/user.js',
    './public/js/userTemplate.js',
    './public/js/userApp.js'
];
const jsOutput = "./public/js/nodeuser.min.js"
const jsConfig = {
    name: "node-user core JS",
    version: version, 
    input: jsInput,
    output: jsOutput,
    minify: true
};

// js bundle, includes template library
const jsBundleInput = [
    './node_modules/@voliware/template2/dist/template2-bundle.min.js',
    ...jsInput
];
const jsBundleOut = "./public/js/nodeuser.bundle.min.js"
const jsBundleConfig = {
    name: "node-user bundle JS",
    version: version, 
    input: jsBundleInput,
    output: jsBundleOut,
    minify: true
};

// css core, no template library
const cssInput = [
    './public/css/style.css'
];
const cssOutput = "./public/css/nodeuser.min.css";
const cssConfig = {
    name: "node-user core CSS",
    version: version,
    input: cssInput,
    output: cssOutput,
    minify: true
};

// css bundle, includes template library
const cssBundleInput = [
    './node_modules/@voliware/template2/dist/template2.min.css',
    ...cssInput
];
const cssBundleOutput = "./public/css/nodeuser.bundle.min.css";
const cssBundleConfig = {
    name: "node-user bundle CSS",
    version: version,
    input: cssBundleInput,
    output: cssBundleOutput,
    minify: true
};

// templates
const templateUserApp = './public/templates/template-user-app.html';
const templateUserFeedback = './public/templates/template-user-feedback.html';
const templateUserLinks = './public/templates/template-user-links.html';
const templateUserLogin = './public/templates/template-user-login.html';
const templateUserRegister = './public/templates/template-user-register.html';
const templateUserReset = './public/templates/template-user-reset.html';
const templateUser = './public/templates/template-user.html';

// html
// user app
const htmlAppInput = templateUserApp;
const htmlAppOutput = './public/html/nodeuser.html';
const htmlAppConfig = {
    name: "node-user app HTML",
    version: version,
    input: htmlAppInput,
    output: htmlAppOutput,
    minify: true,
    modifiers: {
        replace: [
            {match: '<!-- template-user-feedback -->', contents: {file: templateUserFeedback}},
            {match: '<!-- template-user-links -->', contents: {file: templateUserLinks}},
            {match: '<!-- template-user-login -->', contents: {file: templateUserLogin}},
            {match: '<!-- template-user-register -->', contents: {file: templateUserRegister}},
            {match: '<!-- template-user-reset -->', contents: {file: templateUserReset}},
            {match: '<!-- template-user -->', contents: {file: templateUser}},
        ]
    }
};

// index
// for standalone builds
const htmlInput = './public/html/index.in.html';
const htmlOutput = './public/index.html';
const htmlConfig = {
    name: "node-user index HTML",
    version: version,
    input: htmlInput,
    output: htmlOutput,
    minify: true,
    modifiers: {
        replace: [
            {match: '<!-- user-app -->', contents: {file: htmlAppOutput}}
        ]
    }
};

// build
const configs = [
    jsConfig,
    jsBundleConfig, 
    cssConfig,
    cssBundleConfig, 
    htmlAppConfig, 
    htmlConfig
];
new NodeBuild.Build(configs).run();