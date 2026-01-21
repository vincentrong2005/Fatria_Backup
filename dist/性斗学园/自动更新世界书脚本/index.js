import * as __WEBPACK_EXTERNAL_MODULE_https_testingcf_jsdelivr_net_npm_compare_versions_esm_4fbc8a69__ from "https://testingcf.jsdelivr.net/npm/compare-versions/+esm";

var __webpack_modules__ = {
  "./src/性斗学园/自动更新世界书脚本/index.ts": 
  /*!*************************************!*\
  !*** ./src/性斗学园/自动更新世界书脚本/index.ts ***!
  \*************************************/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   checkUpdate: () => (/* binding */ checkUpdate)\n/* harmony export */ });\n/* harmony import */ var compare_versions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! compare-versions */ \"compare-versions\");\n\nconst CHARACTER_NAME = '性斗学院超级重制版';\nconst WORLDBOOK_NAME = '性斗学园';\nconst VERSION_ENTRY_NAME = '版本号';\nconst GITHUB_BASE_URL = 'https://raw.githack.com/vincentrong2005/Fatria/main/src/性斗学园';\nasync function checkUpdate() {\n    const version = (await getWorldbook(WORLDBOOK_NAME))\n        .find(entry => entry.name === VERSION_ENTRY_NAME)\n        ?.content.trim() ?? '0.0.0';\n    const remoteVersion = await fetch(`${GITHUB_BASE_URL}/版本号.txt`)\n        .then(response => response.text())\n        .then(text => text.trim())\n        .catch(() => '0.0.0');\n    if ((0,compare_versions__WEBPACK_IMPORTED_MODULE_0__.compare)(version, remoteVersion, '>=')) {\n        return;\n    }\n    await importRawCharacter(CHARACTER_NAME, await fetch(`${GITHUB_BASE_URL}/性斗学园超级重制版.png`).then(response => response.blob()));\n    toastr.success('角色卡自动更新成功, 准备刷新页面以生效...', CHARACTER_NAME);\n    setTimeout(() => triggerSlash('/reload-page'), 3000);\n}\ncheckUpdate();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMv5oCn5paX5a2m5ZutL+iHquWKqOabtOaWsOS4lueVjOS5puiEmuacrC9pbmRleC50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUEyQztBQUUzQyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDbkMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBQzlCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBQ2pDLE1BQU0sZUFBZSxHQUFHLDhEQUE4RCxDQUFDO0FBRWhGLEtBQUssVUFBVSxXQUFXO0lBQy9CLE1BQU0sT0FBTyxHQUNYLENBQUMsTUFBTSxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxrQkFBa0IsQ0FBQztRQUNqRCxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxPQUFPLENBQUM7SUFFaEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxlQUFlLFVBQVUsQ0FBQztTQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3pCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV4QixJQUFJLHlEQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzFDLE9BQU87SUFDVCxDQUFDO0lBRUQsTUFBTSxrQkFBa0IsQ0FDdEIsY0FBYyxFQUNkLE1BQU0sS0FBSyxDQUFDLEdBQUcsZUFBZSxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUNsRixDQUFDO0lBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMxRCxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFFRCxXQUFXLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsic3JjOi8vdGF2ZXJuX2hlbHBlcl90ZW1wbGF0ZS9zcmMv5oCn5paX5a2m5ZutL+iHquWKqOabtOaWsOS4lueVjOS5puiEmuacrC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb21wYXJlIH0gZnJvbSAnY29tcGFyZS12ZXJzaW9ucyc7XHJcblxyXG5jb25zdCBDSEFSQUNURVJfTkFNRSA9ICfmgKfmlpflrabpmaLotoXnuqfph43liLbniYgnO1xyXG5jb25zdCBXT1JMREJPT0tfTkFNRSA9ICfmgKfmlpflrablm60nO1xyXG5jb25zdCBWRVJTSU9OX0VOVFJZX05BTUUgPSAn54mI5pys5Y+3JztcclxuY29uc3QgR0lUSFVCX0JBU0VfVVJMID0gJ2h0dHBzOi8vcmF3LmdpdGhhY2suY29tL3ZpbmNlbnRyb25nMjAwNS9GYXRyaWEvbWFpbi9zcmMv5oCn5paX5a2m5ZutJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1VwZGF0ZSgpIHtcclxuICBjb25zdCB2ZXJzaW9uID1cclxuICAgIChhd2FpdCBnZXRXb3JsZGJvb2soV09STERCT09LX05BTUUpKVxyXG4gICAgICAuZmluZChlbnRyeSA9PiBlbnRyeS5uYW1lID09PSBWRVJTSU9OX0VOVFJZX05BTUUpXHJcbiAgICAgID8uY29udGVudC50cmltKCkgPz8gJzAuMC4wJztcclxuXHJcbiAgY29uc3QgcmVtb3RlVmVyc2lvbiA9IGF3YWl0IGZldGNoKGAke0dJVEhVQl9CQVNFX1VSTH0v54mI5pys5Y+3LnR4dGApXHJcbiAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXHJcbiAgICAudGhlbih0ZXh0ID0+IHRleHQudHJpbSgpKVxyXG4gICAgLmNhdGNoKCgpID0+ICcwLjAuMCcpO1xyXG5cclxuICBpZiAoY29tcGFyZSh2ZXJzaW9uLCByZW1vdGVWZXJzaW9uLCAnPj0nKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgaW1wb3J0UmF3Q2hhcmFjdGVyKFxyXG4gICAgQ0hBUkFDVEVSX05BTUUsXHJcbiAgICBhd2FpdCBmZXRjaChgJHtHSVRIVUJfQkFTRV9VUkx9L+aAp+aWl+WtpuWbrei2hee6p+mHjeWItueJiC5wbmdgKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmJsb2IoKSksXHJcbiAgKTtcclxuXHJcbiAgdG9hc3RyLnN1Y2Nlc3MoJ+inkuiJsuWNoeiHquWKqOabtOaWsOaIkOWKnywg5YeG5aSH5Yi35paw6aG16Z2i5Lul55Sf5pWILi4uJywgQ0hBUkFDVEVSX05BTUUpO1xyXG4gIHNldFRpbWVvdXQoKCkgPT4gdHJpZ2dlclNsYXNoKCcvcmVsb2FkLXBhZ2UnKSwgMzAwMCk7XHJcbn1cclxuXHJcbmNoZWNrVXBkYXRlKCk7XHJcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/性斗学园/自动更新世界书脚本/index.ts\n\n}");
  },
  "compare-versions": 
  /*!***************************************************************************!*\
  !*** external "https://testingcf.jsdelivr.net/npm/compare-versions/+esm" ***!
  \***************************************************************************/ module => {
    module.exports = __WEBPACK_EXTERNAL_MODULE_https_testingcf_jsdelivr_net_npm_compare_versions_esm_4fbc8a69__;
  }
};

var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  var module = __webpack_module_cache__[moduleId] = {
    exports: {}
  };
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  return module.exports;
}

(() => {
  __webpack_require__.d = (exports, definition) => {
    for (var key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: definition[key]
        });
      }
    }
  };
})();

(() => {
  __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
})();

(() => {
  __webpack_require__.r = exports => {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  };
})();

var __webpack_exports__ = __webpack_require__("./src/性斗学园/自动更新世界书脚本/index.ts");

const __webpack_exports__checkUpdate = __webpack_exports__.checkUpdate;

export { __webpack_exports__checkUpdate as checkUpdate };