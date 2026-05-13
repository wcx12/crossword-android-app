# HLPP Crossword

一个跨平台填字游戏项目，包含 Android 版和网页版。当前主要开发体验集中在 `web/`，网页版支持开始界面、词库选择、词表生成、手动指定词与位置、以及根据黑白布局自动填词。

## 项目结构

```text
android-app/
  android/                 Android 应用，Kotlin + Jetpack Compose
  web/                     网页版，React + TypeScript + Vite
  web/public/wordlists/    内置词库
  web/src/ui/              网页端界面
  web/src/domain/          填字生成核心逻辑
  web/dist/                网页端生产构建产物
```

## 本地运行网页版

先进入网页版目录：

```bash
cd web
npm install
npm run dev
```

Vite 默认会输出本地地址，通常是：

```text
http://127.0.0.1:5173/
```

如果端口被占用，Vite 会自动换到下一个端口，例如 `5174`。打开终端里显示的地址即可。

## 网页版功能

开始界面提供 4 个入口：

1. 指定词和位置：先创建词或成语，再拖入网格中组成谜题。
2. 输入词表生成：粘贴词表后自动生成游戏，并保存到“我的词库”。
3. 输入布局自动填词：先设计黑白格布局，再选择词库自动填入可用词。
4. 开始游戏：直接进入原本的游戏界面。

词表输入格式为每行一个词条：

```text
画龙点睛 关键一笔让整体顿时生动
龙马精神 形容人健旺有活力
虎头蛇尾 开场声势大，后来草率
```

提示文本可选，只写词也可以：

```text
画龙点睛
龙马精神
```

## 输入布局自动填词

入口 3 的流程：

1. 在网格上点击格子，切换开放格和黑格。
2. 选择一个内置词库或“我的词库”中的自定义词库。
3. 查看右侧的长度需求和布局检查。
4. 点击“自动填词”。
5. 如果成功，点击“开始游戏”进入可游玩的填字界面。

当前填词规则：

- 只填长度至少为 2 的横向或纵向连续开放格。
- 所有可填位置必须通过交叉格形成一个连通区域。
- 同一个词不会被重复使用。
- 交叉位置的字符必须一致。
- 中文按单个汉字计格，英文会统一转成大写。

## 测试与构建

在 `web/` 目录运行：

```bash
npm test
npm run build
```

常用验证：

```bash
npm test -- src/ui/layoutFill/layoutAnalysis.test.ts src/ui/layoutFill/layoutSolver.test.ts
```

## Android 构建

在仓库根目录运行：

```bash
cd android
./gradlew assembleDebug
```

Windows PowerShell 可使用：

```powershell
cd android
.\gradlew.bat assembleDebug
```

## 词库文件

内置网页版词库位于：

```text
web/public/wordlists/
```

每行一个词条，第一段是词，后面是可选提示。新增或修改词库后，运行 `npm run build` 会把词库复制到 `web/dist/wordlists/`。

## 常见问题

如果“新游戏”没有使用刚输入的词表，请确认是通过“输入词表生成”成功进入游戏的。成功后该词表会保存到“我的词库”，新游戏会继续基于当前词源生成。

如果“输入布局自动填词”失败，通常是因为布局需要的词长在词库中不足、布局不连通，或交叉字符没有可行组合。可以先用“四格示例”或“五格示例”验证词库是否可用，再逐步增加布局复杂度。

## 来源

本项目受 [genxword](https://github.com/riverrun/genxword) 启发，并扩展了 Android 与 Web 两套实现。
