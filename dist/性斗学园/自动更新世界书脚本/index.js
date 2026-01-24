import * as __WEBPACK_EXTERNAL_MODULE_https_testingcf_jsdelivr_net_npm_compare_versions_esm_4fbc8a69__ from "https://testingcf.jsdelivr.net/npm/compare-versions/+esm";

var __webpack_modules__ = {
  "./src/性斗学园/自动更新世界书脚本/index.ts": 
  /*!*************************************!*\
  !*** ./src/性斗学园/自动更新世界书脚本/index.ts ***!
  \*************************************/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   checkUpdate: () => (/* binding */ checkUpdate)\n/* harmony export */ });\n/* harmony import */ var compare_versions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! compare-versions */ \"compare-versions\");\n\nconst CHARACTER_NAME = '性斗学园超级重制版';\nconst WORLDBOOK_NAME = '性斗学园';\nconst VERSION_ENTRY_NAME = '版本号';\nconst GITHUB_BASE_URL = 'https://raw.githack.com/vincentrong2005/Fatria/main/src/性斗学园';\nasync function checkUpdate() {\n    const version = (await getWorldbook(WORLDBOOK_NAME)).find(entry => entry.name === VERSION_ENTRY_NAME)?.content.trim() ?? '0.0.0';\n    const remoteVersion = await fetch(`${GITHUB_BASE_URL}/版本号.txt`)\n        .then(response => response.text())\n        .then(text => text.trim())\n        .catch(() => '0.0.0');\n    if ((0,compare_versions__WEBPACK_IMPORTED_MODULE_0__.compare)(version, remoteVersion, '>=')) {\n        return;\n    }\n    await importRawCharacter(CHARACTER_NAME, await fetch(`${GITHUB_BASE_URL}/性斗学园超级重制版.png`).then(response => response.blob()));\n    toastr.success('角色卡自动更新成功, 准备刷新页面以生效...', CHARACTER_NAME);\n    setTimeout(() => triggerSlash('/reload-page'), 3000);\n}\ncheckUpdate();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMv5oCn5paX5a2m5ZutL+iHquWKqOabtOaWsOS4lueVjOS5puiEmuacrC9pbmRleC50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUEyQztBQUUzQyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDbkMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBQzlCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBQ2pDLE1BQU0sZUFBZSxHQUFHLDhEQUE4RCxDQUFDO0FBRWhGLEtBQUssVUFBVSxXQUFXO0lBQy9CLE1BQU0sT0FBTyxHQUNYLENBQUMsTUFBTSxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLGtCQUFrQixDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLE9BQU8sQ0FBQztJQUVuSCxNQUFNLGFBQWEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLGVBQWUsVUFBVSxDQUFDO1NBQzVELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDekIsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXhCLElBQUkseURBQU8sQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDMUMsT0FBTztJQUNULENBQUM7SUFFRCxNQUFNLGtCQUFrQixDQUN0QixjQUFjLEVBQ2QsTUFBTSxLQUFLLENBQUMsR0FBRyxlQUFlLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQ2xGLENBQUM7SUFFRixNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzFELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUVELFdBQVcsRUFBRSxDQUFDIiwic291cmNlcyI6WyJzcmM6Ly90YXZlcm5faGVscGVyX3RlbXBsYXRlL3NyYy/mgKfmlpflrablm60v6Ieq5Yqo5pu05paw5LiW55WM5Lmm6ISa5pysL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbXBhcmUgfSBmcm9tICdjb21wYXJlLXZlcnNpb25zJztcblxuY29uc3QgQ0hBUkFDVEVSX05BTUUgPSAn5oCn5paX5a2m5Zut6LaF57qn6YeN5Yi254mIJztcbmNvbnN0IFdPUkxEQk9PS19OQU1FID0gJ+aAp+aWl+WtpuWbrSc7XG5jb25zdCBWRVJTSU9OX0VOVFJZX05BTUUgPSAn54mI5pys5Y+3JztcbmNvbnN0IEdJVEhVQl9CQVNFX1VSTCA9ICdodHRwczovL3Jhdy5naXRoYWNrLmNvbS92aW5jZW50cm9uZzIwMDUvRmF0cmlhL21haW4vc3JjL+aAp+aWl+WtpuWbrSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1VwZGF0ZSgpIHtcbiAgY29uc3QgdmVyc2lvbiA9XG4gICAgKGF3YWl0IGdldFdvcmxkYm9vayhXT1JMREJPT0tfTkFNRSkpLmZpbmQoZW50cnkgPT4gZW50cnkubmFtZSA9PT0gVkVSU0lPTl9FTlRSWV9OQU1FKT8uY29udGVudC50cmltKCkgPz8gJzAuMC4wJztcblxuICBjb25zdCByZW1vdGVWZXJzaW9uID0gYXdhaXQgZmV0Y2goYCR7R0lUSFVCX0JBU0VfVVJMfS/niYjmnKzlj7cudHh0YClcbiAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG4gICAgLnRoZW4odGV4dCA9PiB0ZXh0LnRyaW0oKSlcbiAgICAuY2F0Y2goKCkgPT4gJzAuMC4wJyk7XG5cbiAgaWYgKGNvbXBhcmUodmVyc2lvbiwgcmVtb3RlVmVyc2lvbiwgJz49JykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhd2FpdCBpbXBvcnRSYXdDaGFyYWN0ZXIoXG4gICAgQ0hBUkFDVEVSX05BTUUsXG4gICAgYXdhaXQgZmV0Y2goYCR7R0lUSFVCX0JBU0VfVVJMfS/mgKfmlpflrablm63otoXnuqfph43liLbniYgucG5nYCkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5ibG9iKCkpLFxuICApO1xuXG4gIHRvYXN0ci5zdWNjZXNzKCfop5LoibLljaHoh6rliqjmm7TmlrDmiJDlip8sIOWHhuWkh+WIt+aWsOmhtemdouS7peeUn+aViC4uLicsIENIQVJBQ1RFUl9OQU1FKTtcbiAgc2V0VGltZW91dCgoKSA9PiB0cmlnZ2VyU2xhc2goJy9yZWxvYWQtcGFnZScpLCAzMDAwKTtcbn1cblxuY2hlY2tVcGRhdGUoKTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/性斗学园/自动更新世界书脚本/index.ts\n\n}");
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