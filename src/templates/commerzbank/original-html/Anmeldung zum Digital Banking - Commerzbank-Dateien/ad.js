var CI360_TEILNEHMERNUMMER = null;
try {
    CI360_TEILNEHMERNUMMER = TEILNEHMERNUMMER;
} catch (error) {
    console.log(error);
}
(function (ci, a) {
    window[ci] || function () {
        var ef = window[ci] = function () {
            return ef.q.push(arguments);
        }; ef.q = []; ef.a = a || {};
    }();
})
    ('ci360', {
        tenantId: '55cca7442f00010d1e64bd0a',
        identity: {
            source: 'jsvar', type: 'login_id', name: 'CI360_TEILNEHMERNUMMER',
            obscure: true
        }
    });

var dcrmScript = document.createElement("script");
dcrmScript.src = "https://execution.ci360.tpp.commerzbank.de/js/ot2.min.js";
dcrmScript.async = true;
dcrmScript.setAttribute("data-efname", "ci360");
dcrmScript.id = "ob-script-async";
dcrmScript.setAttribute("integrity", "sha512-uGc9/9JggrvMou7Mb75bJiWQNHRhgvfy+TutTfxzuOoKB3pGaYIydGQMgLfRHPpDrsq/rfqkx9V5A56ecdMhsA==");
dcrmScript.crossOrigin = "anonymus";

document.head.appendChild(dcrmScript);