---
order: 11
title: API参考
type: 开发指南
---

### JavaScript 常量

---

#### downloadRootDir

下载的根目录。你可以使用react-native-fs等第三方组件检查其中的内容。

---

#### packageVersion

当前应用原生包的版本。其中android取自`versionName`字段(位于`android/app/build.gradle`中)。ios取自`CFBundleShortVersionString`字段(位于`ios/项目名/Info.plist`中)。

---

#### currentVersion

当前热更新版本（jsbundle文件）的Hash号。

---

#### isFirstTime

是否更新后的首次启动。当此项为真时，你需要在合适的时候调用`markSuccess()`以确保更新成功。否则应用下一次启动时将会回滚。

---

#### isRolledBack

是否刚刚经历了一次回滚。

### JavaScript 方法

---

#### async function checkUpdate(appKey)

检查更新，返回值有三种情形：

1. `{expired: true}`：该应用原生包已过期（已从pushy服务器中删除），需要前往应用市场下载新的版本(在设置中填写downloadUrl)。
```
    {
        expired: true,
        downloadUrl: 'http://appstore/downloadUrl',
    }
```
2. `{upToDate: true}`：当前已经更新到最新，无需进行更新。

3. `{update: true}`：当前有新版本可以更新。info的`name`、`description`字段可
以用于提示用户，而`metaInfo`字段则可以根据你的需求自定义其它属性(如是否静默更新、
是否强制更新等等)。另外还有几个字段，包含了热更新文件的下载地址，
```
    {
        update: true,
        name: '1.0.3-rc',
        hash: 'hash',
        description: '添加聊天功能\n修复商城页面BUG',
        metaInfo: '{"silent":true}',
        pdiffUrl: 'http://update-packages.reactnative.cn/hash',
        diffUrl: 'http://update-packages.reactnative.cn/hash',
    }
```

---

#### async function downloadUpdate(info)

下载更新版本。info为checkUpdate函数的返回值，并且仅当`update:true`时实际进行下载。

---

#### function switchVersion(hash) 

立即重启应用，并加载已经下载完毕的版本。

---

#### function switchVersionLater(hash)

在下一次启动应用的时候加载已经下载完毕的版本。

---

#### function markSuccess()

在isFirstTime为true时需在应用成功启动后调用此函数，

---

### Android 方法

待补充

### iOS 方法

待补充