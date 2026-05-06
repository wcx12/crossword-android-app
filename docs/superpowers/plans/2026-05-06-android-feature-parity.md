# Android 功能追齐实施计划

> **给执行型 agent/工程师的要求：** 实施本计划时必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，并按任务逐项执行。每个步骤使用 checkbox（`- [ ]`）跟踪进度。

**目标：** 将原生 Android 版填字游戏补齐到接近 Web 版的功能集：词表管理、自定义词库、网格设置、中文成语支持、词表搜索、手动创建谜题。

**架构：** 继续走原生 Kotlin + Jetpack Compose，不用 WebView 套壳。保留当前 `data / domain / ui` 分层，在此基础上增加应用路由、词表存储、搜索/中文候选词等纯逻辑 use case，以及复杂界面的独立状态 reducer。Web 版只作为行为参考和词表资产来源，不作为运行时依赖。

**技术栈：** Kotlin、Jetpack Compose、Material3、AndroidViewModel、StateFlow、SharedPreferences、App 内部文件存储、JUnit 4、Gradle Android Plugin。

---

## 一、范围

本计划只改 Android 原生项目：

`C:\Users\10627\Desktop\HLPP_GAME_CROSSWORD\android-app\android`

会从 Web 目录复制词表资产：

`C:\Users\10627\Desktop\HLPP_GAME_CROSSWORD\android-app\web\public\wordlists`

不要动当前已经存在但不属于本轮 Android 任务的 Web 未跟踪文件：

- `web/src/domain/usecase/wordSearch.ts`
- `web/src/domain/usecase/wordSearch.test.ts`

最终 Android 原生版应具备这些能力：

- 可以从任意系统词库或自定义词库开始游戏。
- 系统词库包含 `Monty Python 主题`、`常识词汇`、`中文成语`。
- 可以添加、重命名、删除、查看、游玩自定义词库。
- 持久保存当前词库、自定义词库、网格尺寸偏好。
- 游戏页可设置网格尺寸。
- 英文谜题使用 A-Z 屏幕键盘。
- 中文成语谜题使用“本局候选汉字”键盘。
- 可以按词表搜索：已知位置模式、长度、首字、尾字。
- 可以手动创建谜题网格并直接进入游戏。

本计划不做：

- 云同步。
- 用户账号。
- 多人玩法。
- WebView 打包网页版。
- Kotlin Multiplatform 抽共享核心。
- 完整 Compose UI 自动化截图测试。

## 二、当前 Android 状态

现有原生 Android 版已经有：

- 启动时加载 `assets/wordlists/python_xword.txt`。
- 固定生成 `13 x 13` 谜题。
- 点击格子、横/竖方向切换、A-Z 键盘输入、删除、显示/隐藏答案、完成弹窗。
- `WordImportDialog`、`WordBankManager`、`ClueList` 等未完整接入的预留代码。

现有缺口：

- 没有 Android 单元测试目录。
- 没有词表选择页。
- 没有自定义词库持久化。
- 没有中文成语候选字输入。
- 没有搜索页。
- 没有手动创建谜题页。
- `GameViewModel` 目前只围绕默认词库和固定尺寸工作。

## 三、文件规划

### 新增文件

- `android/app/src/main/java/com/crossword/app/data/model/Language.kt`
- `android/app/src/main/java/com/crossword/app/data/model/WordListInfo.kt`
- `android/app/src/main/java/com/crossword/app/data/local/WordListCatalog.kt`
- `android/app/src/main/java/com/crossword/app/data/local/CustomWordListCodec.kt`
- `android/app/src/main/java/com/crossword/app/data/local/WordListStorage.kt`
- `android/app/src/main/java/com/crossword/app/domain/usecase/ChineseCandidateSelector.kt`
- `android/app/src/main/java/com/crossword/app/domain/usecase/WordSearch.kt`
- `android/app/src/main/java/com/crossword/app/ui/AppScreen.kt`
- `android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt`
- `android/app/src/main/java/com/crossword/app/ui/game/SettingsDialog.kt`
- `android/app/src/main/java/com/crossword/app/ui/game/CandidateKeyboard.kt`
- `android/app/src/main/java/com/crossword/app/ui/wordlist/WordListScreen.kt`
- `android/app/src/main/java/com/crossword/app/ui/wordlist/WordListDetailScreen.kt`
- `android/app/src/main/java/com/crossword/app/ui/wordlist/AddWordListScreen.kt`
- `android/app/src/main/java/com/crossword/app/ui/search/WordSearchScreen.kt`
- `android/app/src/main/java/com/crossword/app/ui/editor/GridEditorModels.kt`
- `android/app/src/main/java/com/crossword/app/ui/editor/GridEditorStateReducer.kt`
- `android/app/src/main/java/com/crossword/app/ui/editor/GridEditorScreen.kt`

### 新增测试文件

- `android/app/src/test/java/com/crossword/app/data/model/WordEntryTest.kt`
- `android/app/src/test/java/com/crossword/app/data/local/WordFileParserTest.kt`
- `android/app/src/test/java/com/crossword/app/data/local/CustomWordListCodecTest.kt`
- `android/app/src/test/java/com/crossword/app/domain/usecase/ChineseCandidateSelectorTest.kt`
- `android/app/src/test/java/com/crossword/app/domain/usecase/WordSearchTest.kt`
- `android/app/src/test/java/com/crossword/app/ui/editor/GridEditorStateReducerTest.kt`

### 修改文件

- `android/app/build.gradle.kts`
- `android/app/src/main/AndroidManifest.xml`，原则上不改，除非构建要求。
- `android/app/src/main/assets/wordlists/general_knowledge.txt`
- `android/app/src/main/assets/wordlists/chinese_idioms_core.txt`
- `android/app/src/main/java/com/crossword/app/MainActivity.kt`
- `android/app/src/main/java/com/crossword/app/data/local/DefaultWordLoader.kt`
- `android/app/src/main/java/com/crossword/app/data/local/WordFileParser.kt`
- `android/app/src/main/java/com/crossword/app/data/model/WordEntry.kt`
- `android/app/src/main/java/com/crossword/app/domain/model/Crossword.kt`
- `android/app/src/main/java/com/crossword/app/domain/repository/WordRepository.kt`
- `android/app/src/main/java/com/crossword/app/domain/usecase/CrosswordGenerator.kt`
- `android/app/src/main/java/com/crossword/app/ui/game/CrosswordGrid.kt`
- `android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt`
- `android/app/src/main/java/com/crossword/app/ui/game/GameState.kt`
- `android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt`
- `android/app/src/main/java/com/crossword/app/ui/wordbank/WordImportDialog.kt`
- `android/app/src/main/java/com/crossword/app/ui/wordbank/WordBankManager.kt`
- `android/app/src/main/res/values/strings.xml`
- `README.md`

### 尽量不动

- `android/app/src/main/java/com/crossword/app/ui/theme/Color.kt`
- `android/app/src/main/java/com/crossword/app/ui/theme/Theme.kt`

除非 UI 编译或颜色引用需要，否则保持主题文件稳定。

## 四、全局验证命令

以下命令都在这个目录运行：

`C:\Users\10627\Desktop\HLPP_GAME_CROSSWORD\android-app\android`

```powershell
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleDebug
```

最终期望：

- `testDebugUnitTest` 全部通过。
- `assembleDebug` 成功生成：

`android/app/build/outputs/apk/debug/app-debug.apk`

手动安装调试包：

```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 任务 1：建立基线构建和测试框架

**目标：** 先确认 Android 项目能跑本地单元测试，并给词条解析补第一批测试。

**涉及文件：**

- 修改：`android/app/build.gradle.kts`
- 新增：`android/app/src/test/java/com/crossword/app/data/model/WordEntryTest.kt`

- [ ] **步骤 1：运行当前基线测试**

```powershell
cd C:\Users\10627\Desktop\HLPP_GAME_CROSSWORD\android-app\android
.\gradlew.bat testDebugUnitTest
```

期望：

- 如果当前没有测试，也应至少能完成 Gradle test task。
- 如果 Gradle 配置报错，记录完整错误，再做下一步。

- [ ] **步骤 2：检查 Gradle 依赖块位置**

当前 `android/app/build.gradle.kts` 里 `dependencies` 可能嵌在 `android {}` 内。标准结构应为：

```kotlin
plugins {
    id("com.android.application")
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.crossword.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.crossword.app"
        minSdk = 23
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    testImplementation(libs.junit)
}
```

- [ ] **步骤 3：添加词条模型测试**

创建 `WordEntryTest.kt`：

```kotlin
package com.crossword.app.data.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class WordEntryTest {
    @Test
    fun parsesEnglishWordAndUppercasesIt() {
        val entry = WordEntry.fromLine("python A programming language")

        assertEquals("PYTHON", entry?.word)
        assertEquals("A programming language", entry?.clue)
        assertEquals(6, entry?.length)
    }

    @Test
    fun parsesChineseIdiomWithoutChangingCharacters() {
        val entry = WordEntry.fromLine("画蛇添足 比喻多此一举，反而坏事。")

        assertEquals("画蛇添足", entry?.word)
        assertEquals("比喻多此一举，反而坏事。", entry?.clue)
        assertEquals(4, entry?.length)
    }

    @Test
    fun rejectsWordsWithDigitsOrPunctuation() {
        assertNull(WordEntry.fromLine("PYTHON3 Invalid"))
        assertNull(WordEntry.fromLine("HELLO-WORLD Invalid"))
    }
}
```

- [ ] **步骤 4：运行测试**

```powershell
.\gradlew.bat testDebugUnitTest --tests com.crossword.app.data.model.WordEntryTest
```

期望：测试通过。若中文测试失败，在任务 2 里修解析规则。

- [ ] **步骤 5：提交**

```powershell
git add android/app/build.gradle.kts android/app/src/test/java/com/crossword/app/data/model/WordEntryTest.kt
git commit -m "test: add Android word entry baseline tests"
```

---

## 任务 2：清理词条模型和词库解析器

**目标：** 让 Android 的词条解析规则明确支持英文和中文；英文统一大写，中文保持原样。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/data/model/Language.kt`
- 修改：`android/app/src/main/java/com/crossword/app/data/model/WordEntry.kt`
- 修改：`android/app/src/main/java/com/crossword/app/data/local/WordFileParser.kt`
- 新增：`android/app/src/test/java/com/crossword/app/data/local/WordFileParserTest.kt`

- [ ] **步骤 1：新增语言枚举**

创建 `Language.kt`：

```kotlin
package com.crossword.app.data.model

enum class Language {
    EN,
    ZH
}
```

- [ ] **步骤 2：添加解析器测试**

创建 `WordFileParserTest.kt`：

```kotlin
package com.crossword.app.data.local

import org.junit.Assert.assertEquals
import org.junit.Test

class WordFileParserTest {
    @Test
    fun parseKeepsEnglishUppercaseAndChineseOriginalCharacters() {
        val entries = WordFileParser.parse(
            listOf(
                "python A programming language",
                "画蛇添足 比喻多此一举，反而坏事。",
                "",
                "bad-word rejected"
            )
        )

        assertEquals(listOf("PYTHON", "画蛇添足"), entries.map { it.word })
        assertEquals(listOf(6, 4), entries.map { it.length })
    }

    @Test
    fun validateReportsWhetherEveryNonBlankLineWasParsed() {
        val result = WordFileParser.validate(
            listOf(
                "APPLE A fruit",
                "HELLO-WORLD Invalid"
            )
        )

        assertEquals(false, result.first)
        assertEquals(listOf("APPLE"), result.second.map { it.word })
    }
}
```

- [ ] **步骤 3：明确 `WordEntry.fromLine` 的规范化逻辑**

在 `WordEntry.kt` 中使用明确的辅助函数：

```kotlin
private fun hasHan(text: String): Boolean {
    return text.any { it in '\u4e00'..'\u9fff' }
}

private fun normalizeWord(raw: String): String {
    return if (hasHan(raw)) raw else raw.uppercase()
}
```

`fromLine` 规则：

- 空行返回 `null`。
- 使用空白分割，`limit = 2`，第一段是 word，第二段是 clue。
- 英文单词转大写。
- 中文词保持原字符。
- word 只允许 `Char.isLetter()` 为 true 的字符。
- 解析成功返回 `WordEntry(word, clue)`。

公开 API 保持：

```kotlin
data class WordEntry(
    val word: String,
    val clue: String
) {
    val length: Int get() = word.length

    companion object {
        fun fromLine(line: String): WordEntry?
    }
}
```

- [ ] **步骤 4：运行测试**

```powershell
.\gradlew.bat testDebugUnitTest --tests com.crossword.app.data.model.WordEntryTest --tests com.crossword.app.data.local.WordFileParserTest
```

期望：全部通过。

- [ ] **步骤 5：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/data/model/WordEntry.kt android/app/src/main/java/com/crossword/app/data/model/Language.kt android/app/src/main/java/com/crossword/app/data/local/WordFileParser.kt android/app/src/test/java/com/crossword/app/data/model/WordEntryTest.kt android/app/src/test/java/com/crossword/app/data/local/WordFileParserTest.kt
git commit -m "feat: support Chinese-aware word parsing on Android"
```

---

## 任务 3：补齐系统词库和词库目录

**目标：** Android assets 中加入 Web 版的全部系统词库，并建立统一的系统词库目录。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/data/model/WordListInfo.kt`
- 新增：`android/app/src/main/java/com/crossword/app/data/local/WordListCatalog.kt`
- 修改：`android/app/src/main/java/com/crossword/app/data/local/DefaultWordLoader.kt`
- 新增：`android/app/src/main/assets/wordlists/general_knowledge.txt`
- 新增：`android/app/src/main/assets/wordlists/chinese_idioms_core.txt`

- [ ] **步骤 1：复制词库文件**

在 `android-app` 目录执行：

```powershell
Copy-Item -LiteralPath web\public\wordlists\general_knowledge.txt -Destination android\app\src\main\assets\wordlists\general_knowledge.txt -Force
Copy-Item -LiteralPath web\public\wordlists\chinese_idioms_core.txt -Destination android\app\src\main\assets\wordlists\chinese_idioms_core.txt -Force
```

- [ ] **步骤 2：新增 `WordListInfo`**

创建 `WordListInfo.kt`：

```kotlin
package com.crossword.app.data.model

data class WordListInfo(
    val id: String,
    val name: String,
    val assetPath: String?,
    val wordCount: Int,
    val isSystem: Boolean,
    val language: Language
)
```

- [ ] **步骤 3：新增系统词库目录**

创建 `WordListCatalog.kt`：

```kotlin
package com.crossword.app.data.local

import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordListInfo

object WordListCatalog {
    const val DEFAULT_WORD_LIST_ID = "python_xword"

    val systemLists: List<WordListInfo> = listOf(
        WordListInfo(
            id = "python_xword",
            name = "Monty Python 主题",
            assetPath = "wordlists/python_xword.txt",
            wordCount = 31,
            isSystem = true,
            language = Language.EN
        ),
        WordListInfo(
            id = "general_knowledge",
            name = "常识词汇",
            assetPath = "wordlists/general_knowledge.txt",
            wordCount = 68,
            isSystem = true,
            language = Language.EN
        ),
        WordListInfo(
            id = "chinese_idioms",
            name = "中文成语",
            assetPath = "wordlists/chinese_idioms_core.txt",
            wordCount = 5000,
            isSystem = true,
            language = Language.ZH
        )
    )

    fun findSystemList(id: String): WordListInfo? {
        return systemLists.find { it.id == id }
    }
}
```

- [ ] **步骤 4：泛化 assets 加载**

`DefaultWordLoader.load` 保持默认参数，但允许传入任意 asset 路径：

```kotlin
fun load(context: Context, filename: String = DEFAULT_WORDS_FILE): List<WordEntry> {
    return try {
        val lines = context.assets.open(filename).bufferedReader().readLines()
        WordFileParser.parse(lines)
    } catch (e: Exception) {
        e.printStackTrace()
        emptyList()
    }
}
```

- [ ] **步骤 5：补一条中文资产格式测试**

在 `WordFileParserTest.kt` 加：

```kotlin
@Test
fun parsesChineseIdiomLinesFromSystemAssetFormat() {
    val entries = WordFileParser.parse(
        listOf(
            "画蛇添足 比喻多此一举，反而坏事。",
            "杯弓蛇影 比喻疑神疑鬼。"
        )
    )

    assertEquals(listOf("画蛇添足", "杯弓蛇影"), entries.map { it.word })
}
```

- [ ] **步骤 6：运行测试和构建**

```powershell
cd C:\Users\10627\Desktop\HLPP_GAME_CROSSWORD\android-app\android
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleDebug
```

期望：测试通过，APK 构建成功。

- [ ] **步骤 7：提交**

```powershell
git add android/app/src/main/assets/wordlists/general_knowledge.txt android/app/src/main/assets/wordlists/chinese_idioms_core.txt android/app/src/main/java/com/crossword/app/data/model/WordListInfo.kt android/app/src/main/java/com/crossword/app/data/local/WordListCatalog.kt android/app/src/main/java/com/crossword/app/data/local/DefaultWordLoader.kt android/app/src/test/java/com/crossword/app/data/local/WordFileParserTest.kt
git commit -m "feat: add Android system word list catalog"
```

---

## 任务 4：实现自定义词库持久化

**目标：** 支持本地保存自定义词库、当前词库、网格尺寸偏好。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/data/local/CustomWordListCodec.kt`
- 新增：`android/app/src/main/java/com/crossword/app/data/local/WordListStorage.kt`
- 新增：`android/app/src/test/java/com/crossword/app/data/local/CustomWordListCodecTest.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/wordbank/WordBankManager.kt`

- [ ] **步骤 1：添加 codec 测试**

创建 `CustomWordListCodecTest.kt`：

```kotlin
package com.crossword.app.data.local

import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo
import org.junit.Assert.assertEquals
import org.junit.Test

class CustomWordListCodecTest {
    @Test
    fun encodesAndDecodesMetadataLines() {
        val infos = listOf(
            WordListInfo(
                id = "custom_100",
                name = "编程术语",
                assetPath = null,
                wordCount = 2,
                isSystem = false,
                language = Language.EN
            )
        )

        val encoded = CustomWordListCodec.encodeMetadata(infos)
        val decoded = CustomWordListCodec.decodeMetadata(encoded)

        assertEquals(infos, decoded)
    }

    @Test
    fun encodesEntriesInTheSameTextFormatAsSystemLists() {
        val entries = listOf(
            WordEntry("PYTHON", "一种编程语言"),
            WordEntry("画蛇添足", "比喻多此一举。")
        )

        val encoded = CustomWordListCodec.encodeEntries(entries)
        val decoded = WordFileParser.parse(encoded)

        assertEquals(entries, decoded)
    }
}
```

- [ ] **步骤 2：实现 `CustomWordListCodec`**

创建 `CustomWordListCodec.kt`：

```kotlin
package com.crossword.app.data.local

import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo

object CustomWordListCodec {
    private const val FIELD_SEPARATOR = "\t"

    fun encodeMetadata(infos: List<WordListInfo>): String {
        return infos.joinToString("\n") { info ->
            listOf(
                escape(info.id),
                escape(info.name),
                info.wordCount.toString(),
                info.language.name
            ).joinToString(FIELD_SEPARATOR)
        }
    }

    fun decodeMetadata(text: String): List<WordListInfo> {
        return text.lines()
            .filter { it.isNotBlank() }
            .mapNotNull { line ->
                val parts = line.split(FIELD_SEPARATOR)
                if (parts.size != 4) return@mapNotNull null
                val wordCount = parts[2].toIntOrNull() ?: return@mapNotNull null
                val language = runCatching { Language.valueOf(parts[3]) }.getOrNull() ?: return@mapNotNull null
                WordListInfo(
                    id = unescape(parts[0]),
                    name = unescape(parts[1]),
                    assetPath = null,
                    wordCount = wordCount,
                    isSystem = false,
                    language = language
                )
            }
    }

    fun encodeEntries(entries: List<WordEntry>): String {
        return entries.joinToString("\n") { entry ->
            if (entry.clue.isBlank()) entry.word else "${entry.word} ${entry.clue}"
        }
    }

    private fun escape(value: String): String {
        return value
            .replace("\\", "\\\\")
            .replace("\t", "\\t")
            .replace("\n", "\\n")
    }

    private fun unescape(value: String): String {
        val builder = StringBuilder()
        var escaping = false
        for (char in value) {
            if (escaping) {
                builder.append(
                    when (char) {
                        't' -> '\t'
                        'n' -> '\n'
                        '\\' -> '\\'
                        else -> char
                    }
                )
                escaping = false
            } else if (char == '\\') {
                escaping = true
            } else {
                builder.append(char)
            }
        }
        if (escaping) builder.append('\\')
        return builder.toString()
    }
}
```

- [ ] **步骤 3：实现 `WordListStorage`**

创建 `WordListStorage.kt`。职责：

- 合并系统词库和自定义词库。
- 从 `SharedPreferences` 读取/保存自定义词库元数据。
- 从 App 内部文件读取/保存自定义词条内容。
- 保存当前词库 id。
- 保存网格行列数。
- 支持新增、删除、重命名自定义词库。

常量：

```kotlin
private const val PREFS_NAME = "crossword_word_lists"
private const val KEY_CUSTOM_METADATA = "custom_metadata"
private const val KEY_CURRENT_WORD_LIST_ID = "current_word_list_id"
private const val KEY_GRID_ROWS = "grid_rows"
private const val KEY_GRID_COLS = "grid_cols"
private const val CUSTOM_DIR = "custom_wordlists"
```

公开 API：

```kotlin
class WordListStorage(private val context: Context) {
    fun getWordLists(): List<WordListInfo>
    fun getCurrentWordListId(): String
    fun setCurrentWordListId(id: String)
    fun getGridSize(): Pair<Int, Int>
    fun setGridSize(rows: Int, cols: Int)
    fun loadWords(info: WordListInfo): List<WordEntry>
    fun addCustomList(name: String, entries: List<WordEntry>): WordListInfo
    fun deleteCustomList(id: String)
    fun renameCustomList(id: String, newName: String)
}
```

实现规则：

- 系统词库通过 `DefaultWordLoader.load(context, info.assetPath!!)` 读取。
- 自定义词库保存到 `context.filesDir/custom_wordlists/<id>.txt`。
- 自定义 id 使用 `custom_${System.currentTimeMillis()}`。
- 只要任意词条包含汉字，语言标为 `Language.ZH`，否则 `Language.EN`。
- 删除自定义词库时，同时删除 metadata 和内部文本文件。
- 重命名只改 metadata，不改词条文件。

- [ ] **步骤 4：收敛旧 `WordBankManager`**

`WordBankManager.kt` 暂时保留为兼容壳，避免重复定义一套词库模型：

```kotlin
package com.crossword.app.ui.wordbank

import com.crossword.app.data.model.WordEntry

data class WordBankState(
    val currentWordCount: Int = 0,
    val customWords: List<WordEntry> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
```

后续如果没有引用，可在清理阶段删除。

- [ ] **步骤 5：运行测试**

```powershell
.\gradlew.bat testDebugUnitTest --tests com.crossword.app.data.local.CustomWordListCodecTest
```

期望：通过。

- [ ] **步骤 6：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/data/local/CustomWordListCodec.kt android/app/src/main/java/com/crossword/app/data/local/WordListStorage.kt android/app/src/main/java/com/crossword/app/ui/wordbank/WordBankManager.kt android/app/src/test/java/com/crossword/app/data/local/CustomWordListCodecTest.kt
git commit -m "feat: persist custom word lists on Android"
```

---

## 任务 5：改造游戏状态、词库选择和网格尺寸

**目标：** 让 `GameViewModel` 从单一默认词库升级为支持当前词库、动态尺寸、自定义谜题载入。

**涉及文件：**

- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameState.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt`
- 修改：`android/app/src/main/java/com/crossword/app/domain/repository/WordRepository.kt`
- 修改：`android/app/src/main/java/com/crossword/app/domain/usecase/CrosswordGenerator.kt`

- [ ] **步骤 1：扩展 `GameState`**

新增状态字段：

```kotlin
val wordLists: List<WordListInfo> = emptyList(),
val currentWordListId: String = WordListCatalog.DEFAULT_WORD_LIST_ID,
val currentWordListName: String = "",
val gridRows: Int = 13,
val gridCols: Int = 13,
val inputMode: InputMode = InputMode.LETTERS,
val candidateChars: List<Char> = emptyList()
```

新增枚举：

```kotlin
enum class InputMode {
    LETTERS,
    CANDIDATE_CHARS
}
```

- [ ] **步骤 2：重写 `GameViewModel` 初始化流程**

增加：

```kotlin
private val wordListStorage = WordListStorage(application)
private var activeWords: List<WordEntry> = emptyList()
```

初始化时：

- 从 storage 读取词表列表。
- 从 storage 读取当前词表 id。
- 从 storage 读取网格尺寸。
- 加载当前词表词条。
- 自动生成新游戏。

初始化后 state 至少包含：

```kotlin
wordLists = wordLists,
currentWordListId = currentInfo.id,
currentWordListName = currentInfo.name,
gridRows = rows,
gridCols = cols
```

- [ ] **步骤 3：暴露游戏控制方法**

`GameViewModel` 对 UI 暴露：

```kotlin
fun newGame(rows: Int = _state.value.gridRows, cols: Int = _state.value.gridCols)
fun selectWordList(id: String)
fun addCustomWordList(name: String, entries: List<WordEntry>)
fun deleteCustomWordList(id: String)
fun renameCustomWordList(id: String, newName: String)
fun loadWordsForList(id: String): List<WordEntry>
fun loadCustomPuzzle(rows: Int, cols: Int, grid: List<List<Cell>>, placements: List<WordPlacement>)
```

行为规则：

- `selectWordList` 保存 id，并重新生成谜题。
- `addCustomWordList` 保存新词库、切换到新词库、重新生成。
- `deleteCustomWordList` 不允许删除系统词库。
- 删除当前使用的自定义词库后，自动切回 `python_xword`。
- `renameCustomWordList` 刷新 `wordLists` 和 `currentWordListName`。
- `newGame(rows, cols)` 将行列数限制在 `5..25`，保存尺寸，并用新尺寸生成。

- [ ] **步骤 4：生成器改为动态尺寸**

不要再长期持有固定的：

```kotlin
private val generator = CrosswordGenerator(rows = 13, cols = 13)
```

改为在生成时创建：

```kotlin
val generator = CrosswordGenerator(rows = rows, cols = cols)
val crossword = generator.generate(generatorWords, timeLimit = 3f)
```

- [ ] **步骤 5：输入字符规则**

`inputLetter` 中写入字符时：

```kotlin
crossword.grid[selected.first][selected.second].char =
    if (letter in '\u4e00'..'\u9fff') letter else letter.uppercaseChar()
```

- [ ] **步骤 6：构建验证**

```powershell
.\gradlew.bat assembleDebug
```

期望：编译通过。此时 UI 可能还没暴露所有入口，后续任务会接上。

- [ ] **步骤 7：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/ui/game/GameState.kt android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt android/app/src/main/java/com/crossword/app/domain/repository/WordRepository.kt android/app/src/main/java/com/crossword/app/domain/usecase/CrosswordGenerator.kt
git commit -m "feat: connect game state to Android word list storage"
```

---

## 任务 6：建立 App 壳和页面路由

**目标：** 给 Android app 加一个简单的 Compose 页面路由层，让游戏、词表、搜索、编辑器之间能切换。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/ui/AppScreen.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt`
- 修改：`android/app/src/main/java/com/crossword/app/MainActivity.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt`

- [ ] **步骤 1：定义页面枚举**

创建 `AppScreen.kt`：

```kotlin
package com.crossword.app.ui

sealed class AppScreen {
    data object Game : AppScreen()
    data object WordLists : AppScreen()
    data class WordListDetail(val id: String) : AppScreen()
    data object AddWordList : AppScreen()
    data object Search : AppScreen()
    data object Editor : AppScreen()
}
```

- [ ] **步骤 2：创建 App 壳**

创建 `CrosswordApp.kt`。核心结构：

```kotlin
package com.crossword.app.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.crossword.app.ui.game.GameScreen
import com.crossword.app.ui.game.GameViewModel

@Composable
fun CrosswordApp(
    gameViewModel: GameViewModel = viewModel()
) {
    var screen by remember { mutableStateOf<AppScreen>(AppScreen.Game) }

    when (val current = screen) {
        AppScreen.Game -> GameScreen(
            viewModel = gameViewModel,
            onShowWordLists = { screen = AppScreen.WordLists },
            onShowSearch = { screen = AppScreen.Search },
            onShowEditor = { screen = AppScreen.Editor }
        )
        AppScreen.WordLists -> WordListScreen(
            viewModel = gameViewModel,
            onBack = { screen = AppScreen.Game },
            onAdd = { screen = AppScreen.AddWordList },
            onOpenDetail = { id -> screen = AppScreen.WordListDetail(id) },
            onSelected = { screen = AppScreen.Game }
        )
        is AppScreen.WordListDetail -> WordListDetailScreen(
            viewModel = gameViewModel,
            wordListId = current.id,
            onBack = { screen = AppScreen.WordLists },
            onSelected = { screen = AppScreen.Game }
        )
        AppScreen.AddWordList -> AddWordListScreen(
            onBack = { screen = AppScreen.WordLists },
            onCreated = { entries, name ->
                gameViewModel.addCustomWordList(name, entries)
                screen = AppScreen.Game
            }
        )
        AppScreen.Search -> WordSearchScreen(
            viewModel = gameViewModel,
            onBack = { screen = AppScreen.Game }
        )
        AppScreen.Editor -> GridEditorScreen(
            onBack = { screen = AppScreen.Game },
            onPlay = { rows, cols, grid, placements ->
                gameViewModel.loadCustomPuzzle(rows, cols, grid, placements)
                screen = AppScreen.Game
            }
        )
    }
}
```

如果此任务先于真实页面落地，则临时创建最小占位 Composable，后续任务替换。占位 Composable 必须能返回上一页，避免路由不可用。

- [ ] **步骤 3：修改 `MainActivity`**

将：

```kotlin
GameScreen()
```

替换为：

```kotlin
CrosswordApp()
```

并导入：

```kotlin
import com.crossword.app.ui.CrosswordApp
```

- [ ] **步骤 4：给 `GameScreen` 增加导航回调**

签名改为：

```kotlin
fun GameScreen(
    viewModel: GameViewModel = viewModel(),
    onShowWordLists: () -> Unit = {},
    onShowSearch: () -> Unit = {},
    onShowEditor: () -> Unit = {}
)
```

顶部栏增加按钮：

```kotlin
TextButton(onClick = onShowEditor) { Text("创建") }
TextButton(onClick = onShowSearch) { Text("搜索") }
TextButton(onClick = onShowWordLists) { Text("词表") }
TextButton(onClick = { viewModel.newGame() }) { Text("新游戏") }
```

- [ ] **步骤 5：构建验证**

```powershell
.\gradlew.bat assembleDebug
```

- [ ] **步骤 6：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/MainActivity.kt android/app/src/main/java/com/crossword/app/ui/AppScreen.kt android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt
git commit -m "feat: add Android app screen routing"
```

---

## 任务 7：词表管理页面

**目标：** 补齐词表选择、详情、自定义词表新增/重命名/删除。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/ui/wordlist/WordListScreen.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/wordlist/WordListDetailScreen.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/wordlist/AddWordListScreen.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/wordbank/WordImportDialog.kt`
- 修改：`android/app/src/main/res/values/strings.xml`

- [ ] **步骤 1：实现 `WordListScreen`**

公开签名：

```kotlin
@Composable
fun WordListScreen(
    viewModel: GameViewModel,
    onBack: () -> Unit,
    onAdd: () -> Unit,
    onOpenDetail: (String) -> Unit,
    onSelected: () -> Unit
)
```

界面内容：

- 顶部栏：返回按钮，标题 `选择词表`。
- 右上或内容顶部按钮：`添加自定义词库`。
- 系统词库分组：`state.wordLists.filter { it.isSystem }`。
- 我的词库分组：`state.wordLists.filter { !it.isSystem }`。
- 每个词表项显示：
  - 名称。
  - 单词数量。
  - 当前使用标识。
  - 自定义词库显示删除按钮。
- 点击词表项进入详情页。
- 删除按钮调用 `viewModel.deleteCustomWordList(id)`。

- [ ] **步骤 2：实现 `WordListDetailScreen`**

公开签名：

```kotlin
@Composable
fun WordListDetailScreen(
    viewModel: GameViewModel,
    wordListId: String,
    onBack: () -> Unit,
    onSelected: () -> Unit
)
```

界面内容：

- 顶部栏：返回按钮、词表名。
- 自定义词库显示重命名按钮。
- 数量提示：`共 N 个单词`。
- 可滚动词条列表：左侧 word，右侧 clue，没有 clue 时显示 `无提示`。
- 底部主按钮：`使用此词表开始游戏`。

行为：

- 用 `viewModel.loadWordsForList(wordListId)` 加载词条。
- 点击开始游戏：`viewModel.selectWordList(wordListId)`，然后 `onSelected()`。
- 重命名弹窗使用 `AlertDialog + OutlinedTextField`。

- [ ] **步骤 3：实现 `AddWordListScreen`**

公开签名：

```kotlin
@Composable
fun AddWordListScreen(
    onBack: () -> Unit,
    onCreated: (List<WordEntry>, String) -> Unit
)
```

界面内容：

- 顶部栏：返回，标题 `添加自定义词库`。
- 词库名称输入框，默认 `自定义词库`。
- 大文本输入框。
- 格式说明：`每行一个词条：单词 线索文本`。
- 实时显示有效词条数量。
- 少于 2 个有效词条时显示错误。
- 按钮：`开始游戏`。

解析逻辑：

```kotlin
val entries = WordFileParser.parse(textInput)
```

创建逻辑：

```kotlin
onCreated(entries, listName.ifBlank { "自定义词库" })
```

- [ ] **步骤 4：让 `WordImportDialog` 保持可编译**

如果 `WordImportDialog` 仍被引用，更新 import 和解析调用。主流程以 `AddWordListScreen` 为准，不再依赖弹窗导入。

- [ ] **步骤 5：补 strings**

`strings.xml` 增加：

```xml
<string name="select_word_list">选择词表</string>
<string name="add_custom_word_list">添加自定义词库</string>
<string name="system_word_lists">系统词库</string>
<string name="my_word_lists">我的词库</string>
<string name="use_this_word_list">使用此词表开始游戏</string>
<string name="rename">重命名</string>
<string name="delete">删除</string>
```

- [ ] **步骤 6：构建验证**

```powershell
.\gradlew.bat assembleDebug
```

- [ ] **步骤 7：手动 QA**

- 打开 App。
- 点 `词表`。
- 打开 `常识词汇`，点 `使用此词表开始游戏`，确认游戏重新生成。
- 添加一个至少 2 个词的自定义词库。
- 确认它出现在 `我的词库`。
- 重命名它。
- 删除它。
- 如果删除的是当前词库，确认自动回到默认词库。

- [ ] **步骤 8：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/ui/wordlist android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt android/app/src/main/java/com/crossword/app/ui/wordbank/WordImportDialog.kt android/app/src/main/res/values/strings.xml
git commit -m "feat: add Android word list management screens"
```

---

## 任务 8：游戏设置弹窗和完成弹窗修复

**目标：** 游戏页支持修改网格尺寸，并修复完成弹窗确认按钮无行为的问题。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/ui/game/SettingsDialog.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameState.kt`

- [ ] **步骤 1：增加完成弹窗状态**

`GameState` 新增：

```kotlin
val showSolvedDialog: Boolean = false
```

`checkSolved()` 中：

```kotlin
isSolved = true,
showSolvedDialog = true
```

`GameViewModel` 新增：

```kotlin
fun dismissSolvedDialog() {
    _state.update { it.copy(showSolvedDialog = false) }
}
```

- [ ] **步骤 2：实现 `SettingsDialog`**

公开签名：

```kotlin
@Composable
fun SettingsDialog(
    rows: Int,
    cols: Int,
    onConfirm: (Int, Int) -> Unit,
    onDismiss: () -> Unit
)
```

内容：

- 两个数字输入框：行数、列数。
- 范围限制 `5..25`。
- `确定` 调用 `onConfirm(validRows, validCols)`。
- `取消` 调用 `onDismiss()`。

- [ ] **步骤 3：游戏顶部栏增加设置按钮**

在 `GameScreen` 中：

```kotlin
var showSettings by remember { mutableStateOf(false) }
```

按钮：

```kotlin
TextButton(onClick = { showSettings = true }) { Text("设置") }
```

弹窗：

```kotlin
if (showSettings) {
    SettingsDialog(
        rows = state.gridRows,
        cols = state.gridCols,
        onConfirm = { rows, cols ->
            showSettings = false
            viewModel.newGame(rows, cols)
        },
        onDismiss = { showSettings = false }
    )
}
```

- [ ] **步骤 4：展示当前词库和尺寸**

在游戏内容上方加紧凑状态条：

```kotlin
Text("${state.currentWordListName} · ${state.gridRows} × ${state.gridCols}")
```

- [ ] **步骤 5：修复完成弹窗**

完成弹窗确认按钮：

```kotlin
TextButton(onClick = onDismiss) {
    Text("确定")
}
```

调用时传：

```kotlin
onDismiss = { viewModel.dismissSolvedDialog() }
```

- [ ] **步骤 6：构建验证**

```powershell
.\gradlew.bat assembleDebug
```

- [ ] **步骤 7：手动 QA**

- 点 `设置`。
- 改成 `10 x 10`。
- 确认游戏重新生成。
- 状态条显示 `10 × 10`。
- 后续通过手动谜题测试完成弹窗可以关闭。

- [ ] **步骤 8：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/ui/game/SettingsDialog.kt android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt android/app/src/main/java/com/crossword/app/ui/game/GameState.kt
git commit -m "feat: add Android game settings dialog"
```

---

## 任务 9：中文候选词筛选和候选字键盘

**目标：** 让中文成语词库能生成更好的交叉谜题，并用本局候选汉字输入。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/domain/usecase/ChineseCandidateSelector.kt`
- 新增：`android/app/src/test/java/com/crossword/app/domain/usecase/ChineseCandidateSelectorTest.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/game/CandidateKeyboard.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt`

- [ ] **步骤 1：添加中文候选词测试**

创建 `ChineseCandidateSelectorTest.kt`：

```kotlin
package com.crossword.app.domain.usecase

import com.crossword.app.data.model.WordEntry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class ChineseCandidateSelectorTest {
    @Test
    fun selectsClusterAroundSharedHanCharacters() {
        val words = listOf(
            WordEntry("画蛇添足", "比喻多此一举。"),
            WordEntry("杯弓蛇影", "比喻疑神疑鬼。"),
            WordEntry("打草惊蛇", "比喻行动不慎惊动对方。"),
            WordEntry("虎头蛇尾", "比喻开始声势大后来劲头小。"),
            WordEntry("狐假虎威", "比喻仗势欺人。"),
            WordEntry("风花雪月", "泛指诗文里的景物。"),
            WordEntry("刻舟求剑", "比喻拘泥成法。")
        )

        val selected = ChineseCandidateSelector.selectChineseCandidateWords(words, 4)
        val selectedWords = selected.map { it.word }.toSet()

        assertEquals(setOf("画蛇添足", "杯弓蛇影", "打草惊蛇", "虎头蛇尾"), selectedWords)
        assertFalse(selectedWords.contains("风花雪月"))
        assertFalse(selectedWords.contains("刻舟求剑"))
    }

    @Test
    fun candidateCharsAreUniqueAndSorted() {
        val chars = ChineseCandidateSelector.getCandidateChars(listOf("画蛇添足", "杯弓蛇影"))

        assertEquals(chars.distinct(), chars)
        assertEquals(chars.sorted(), chars)
    }
}
```

- [ ] **步骤 2：实现 `ChineseCandidateSelector`**

创建 `ChineseCandidateSelector.kt`：

```kotlin
package com.crossword.app.domain.usecase

import com.crossword.app.data.model.WordEntry

object ChineseCandidateSelector {
    private val highFrequencyChars = setOf('不', '之', '一', '无', '有', '人', '如', '大', '天')

    fun selectChineseCandidateWords(words: List<WordEntry>, targetCount: Int = 60): List<WordEntry> {
        if (words.size <= targetCount) return words

        val charCounts = mutableMapOf<Char, Int>()
        words.forEach { entry ->
            entry.word.toSet().forEach { char ->
                charCounts[char] = (charCounts[char] ?: 0) + 1
            }
        }

        return words.mapIndexed { index, entry ->
            val chars = entry.word.toSet()
            var score = 0.0
            chars.forEach { char ->
                val count = charCounts[char] ?: 0
                score += if (char in highFrequencyChars) count * 0.25 else count.toDouble()
            }
            if (entry.clue.length in 6..45) score += 4.0
            if (entry.word.length == 4) score += 8.0
            ScoredEntry(entry, index, score)
        }
            .sortedWith(compareByDescending<ScoredEntry> { it.score }.thenBy { it.index })
            .take(targetCount)
            .map { it.entry }
    }

    fun getCandidateChars(words: List<String>): List<Char> {
        return words.flatMap { it.toList() }.distinct().sorted()
    }

    private data class ScoredEntry(
        val entry: WordEntry,
        val index: Int,
        val score: Double
    )
}
```

- [ ] **步骤 3：接入生成流程**

`GameViewModel.newGame` 生成前：

```kotlin
val isChinese = words.any { entry -> entry.word.any { it in '\u4e00'..'\u9fff' } }
val generatorWords = if (isChinese) {
    ChineseCandidateSelector.selectChineseCandidateWords(words, targetCount = 80)
} else {
    words
}
val crossword = generator.generate(generatorWords, timeLimit = 3f)
```

生成成功后：

```kotlin
inputMode = if (isChinese) InputMode.CANDIDATE_CHARS else InputMode.LETTERS,
candidateChars = if (isChinese) {
    ChineseCandidateSelector.getCandidateChars(crossword.placements.map { it.word })
} else {
    emptyList()
}
```

- [ ] **步骤 4：创建候选键盘**

创建 `CandidateKeyboard.kt`：

```kotlin
@Composable
fun CandidateKeyboard(
    inputMode: InputMode,
    candidateChars: List<Char>,
    onLetterClick: (Char) -> Unit,
    onDeleteClick: () -> Unit,
    modifier: Modifier = Modifier
)
```

行为：

- `LETTERS`：显示 A-Z，每行 9 个。
- `CANDIDATE_CHARS`：显示标题 `候选字`，每行 10 个汉字。
- 底部始终有 `删除`。
- 按键尺寸固定，避免重组时布局跳动。

- [ ] **步骤 5：替换旧私有键盘**

在 `GameScreen.kt` 中移除旧的私有 `Keyboard`、`KeyButton`、`FunctionKey`，改用：

```kotlin
CandidateKeyboard(
    inputMode = state.inputMode,
    candidateChars = state.candidateChars,
    onLetterClick = onLetterInput,
    onDeleteClick = onDelete,
    modifier = Modifier.padding(8.dp)
)
```

- [ ] **步骤 6：测试和构建**

```powershell
.\gradlew.bat testDebugUnitTest --tests com.crossword.app.domain.usecase.ChineseCandidateSelectorTest
.\gradlew.bat assembleDebug
```

- [ ] **步骤 7：手动 QA**

- 选择 `中文成语`。
- 开始游戏。
- 底部显示 `候选字`。
- 点击汉字能填入选中格。
- 显示答案时中文答案正确显示。

- [ ] **步骤 8：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/domain/usecase/ChineseCandidateSelector.kt android/app/src/test/java/com/crossword/app/domain/usecase/ChineseCandidateSelectorTest.kt android/app/src/main/java/com/crossword/app/ui/game/CandidateKeyboard.kt android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt android/app/src/main/java/com/crossword/app/ui/game/GameScreen.kt
git commit -m "feat: support Chinese crossword input on Android"
```

---

## 任务 10：词表搜索

**目标：** Android 支持按已知模式、长度、首字、尾字搜索英文单词或中文成语。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/domain/usecase/WordSearch.kt`
- 新增：`android/app/src/test/java/com/crossword/app/domain/usecase/WordSearchTest.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/search/WordSearchScreen.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt`

- [ ] **步骤 1：添加搜索测试**

创建 `WordSearchTest.kt`：

```kotlin
package com.crossword.app.domain.usecase

import com.crossword.app.data.model.WordEntry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WordSearchTest {
    private val idioms = listOf(
        WordEntry("画蛇添足", "比喻多此一举。"),
        WordEntry("杯弓蛇影", "比喻疑神疑鬼。"),
        WordEntry("打草惊蛇", "比喻行动不慎惊动对方。")
    )

    @Test
    fun acceptsLettersHanAndUnderscoreInPattern() {
        assertTrue(WordSearch.isValidPattern("画_添_"))
        assertTrue(WordSearch.isValidPattern("_O__E"))
        assertFalse(WordSearch.isValidPattern("A-__"))
    }

    @Test
    fun matchesChinesePattern() {
        val results = WordSearch.search(
            WordSearchParams(wordList = idioms, pattern = "_蛇__")
        )

        assertEquals(listOf("画蛇添足"), results.map { it.word })
    }

    @Test
    fun matchesFirstAndLastCharacter() {
        val results = WordSearch.search(
            WordSearchParams(wordList = idioms, startsWith = "杯", endsWith = "影")
        )

        assertEquals(listOf("杯弓蛇影"), results.map { it.word })
    }
}
```

- [ ] **步骤 2：实现搜索 use case**

创建 `WordSearch.kt`：

```kotlin
package com.crossword.app.domain.usecase

import com.crossword.app.data.model.WordEntry

data class WordSearchParams(
    val wordList: List<WordEntry>,
    val pattern: String? = null,
    val length: Int? = null,
    val startsWith: String? = null,
    val endsWith: String? = null
)

object WordSearch {
    fun search(params: WordSearchParams): List<WordEntry> {
        return params.wordList.filter { entry ->
            val word = entry.word
            if (params.length != null && word.length != params.length) return@filter false
            if (!params.startsWith.isNullOrBlank() && !word.startsWith(params.startsWith, ignoreCase = true)) return@filter false
            if (!params.endsWith.isNullOrBlank() && !word.endsWith(params.endsWith, ignoreCase = true)) return@filter false
            if (!params.pattern.isNullOrBlank() && !matchesPattern(word, params.pattern)) return@filter false
            true
        }
    }

    fun isValidPattern(pattern: String): Boolean {
        if (pattern.isBlank()) return true
        return pattern.all { char ->
            char == '_' || char.isLetter()
        }
    }

    private fun matchesPattern(word: String, pattern: String): Boolean {
        if (word.length != pattern.length) return false
        return word.indices.all { index ->
            val patternChar = pattern[index]
            patternChar == '_' || patternChar.equals(word[index], ignoreCase = true)
        }
    }
}
```

- [ ] **步骤 3：实现 `WordSearchScreen`**

公开签名：

```kotlin
@Composable
fun WordSearchScreen(
    viewModel: GameViewModel,
    onBack: () -> Unit
)
```

界面内容：

- 顶部栏：返回按钮，标题根据词表语言显示 `搜索单词` 或 `搜索成语`。
- 词表选择器：
  - 优先使用 `ExposedDropdownMenuBox`。
  - 如果 Material3 版本不支持，则用 `AlertDialog` 做选择器。
- 输入框：
  - 已知位置模式，例如 `_O__E` 或 `_蛇__`。
  - 长度。
  - 首字/首位字母。
  - 尾字/末位字母。
- 按钮：
  - `搜索`。
  - `清空`。
- 结果列表：
  - word。
  - clue。

行为：

- 默认选中 `state.currentWordListId`。
- 切换词表后使用 `viewModel.loadWordsForList(id)` 加载词条。
- 使用 `WordSearch.isValidPattern(pattern)` 校验输入。
- pattern 无效时禁用搜索按钮，并显示错误提示。

- [ ] **步骤 4：路由接入**

`CrosswordApp` 中 `AppScreen.Search` 调用真实 `WordSearchScreen`。

- [ ] **步骤 5：测试和构建**

```powershell
.\gradlew.bat testDebugUnitTest --tests com.crossword.app.domain.usecase.WordSearchTest
.\gradlew.bat assembleDebug
```

- [ ] **步骤 6：手动 QA**

- 打开 `搜索`。
- 选择 `中文成语`。
- 搜 `_蛇__`，确认包含 `画蛇添足`。
- 清空。
- 搜长度 `4`、首字 `杯`、尾字 `影`，确认包含 `杯弓蛇影`。
- 选择英文词表，搜 `_O__E`。

- [ ] **步骤 7：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/domain/usecase/WordSearch.kt android/app/src/test/java/com/crossword/app/domain/usecase/WordSearchTest.kt android/app/src/main/java/com/crossword/app/ui/search/WordSearchScreen.kt android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt
git commit -m "feat: add Android word search"
```

---

## 任务 11：手动创建谜题

**目标：** 支持用户手动创建网格、放置横/竖词、检测冲突、填写 clue，并直接进入游戏。

**涉及文件：**

- 新增：`android/app/src/main/java/com/crossword/app/ui/editor/GridEditorModels.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/editor/GridEditorStateReducer.kt`
- 新增：`android/app/src/test/java/com/crossword/app/ui/editor/GridEditorStateReducerTest.kt`
- 新增：`android/app/src/main/java/com/crossword/app/ui/editor/GridEditorScreen.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt`
- 修改：`android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt`

- [ ] **步骤 1：新增编辑器模型**

创建 `GridEditorModels.kt`：

```kotlin
package com.crossword.app.ui.editor

import com.crossword.app.domain.model.Direction

data class EditorCell(
    val isBlack: Boolean = true,
    val letter: Char? = null
)

data class EditorWord(
    val word: String,
    val clue: String,
    val row: Int,
    val col: Int,
    val direction: Direction
)

data class GridEditorState(
    val rows: Int = 10,
    val cols: Int = 10,
    val grid: List<List<EditorCell>> = List(10) { List(10) { EditorCell() } },
    val words: List<EditorWord> = emptyList(),
    val selectedRow: Int? = null,
    val selectedCol: Int? = null,
    val direction: Direction = Direction.HORIZONTAL,
    val inputWord: String = "",
    val inputClue: String = "",
    val errorMessage: String? = null
)
```

- [ ] **步骤 2：添加 reducer 测试**

创建 `GridEditorStateReducerTest.kt`：

```kotlin
package com.crossword.app.ui.editor

import com.crossword.app.domain.model.Direction
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class GridEditorStateReducerTest {
    @Test
    fun addsHorizontalWordToGrid() {
        val state = GridEditorStateReducer.confirmWord(
            GridEditorState(selectedRow = 0, selectedCol = 0, inputWord = "JAVA", inputClue = "Language")
        )

        assertEquals(1, state.words.size)
        assertEquals(listOf('J', 'A', 'V', 'A'), state.grid[0].take(4).map { it.letter })
        assertNull(state.errorMessage)
    }

    @Test
    fun rejectsWordThatExceedsGrid() {
        val state = GridEditorStateReducer.confirmWord(
            GridEditorState(rows = 5, cols = 5, selectedRow = 0, selectedCol = 3, inputWord = "JAVA")
        )

        assertTrue(state.errorMessage?.contains("超出网格范围") == true)
    }

    @Test
    fun rejectsConflictingCrossingWord() {
        val first = GridEditorStateReducer.confirmWord(
            GridEditorState(selectedRow = 0, selectedCol = 0, inputWord = "JAVA")
        )
        val withConflictInput = first.copy(
            selectedRow = 0,
            selectedCol = 1,
            direction = Direction.VERTICAL,
            inputWord = "DOG"
        )

        val result = GridEditorStateReducer.confirmWord(withConflictInput)

        assertTrue(result.errorMessage?.contains("冲突") == true)
    }
}
```

- [ ] **步骤 3：实现 reducer**

创建 `GridEditorStateReducer.kt`，公开纯函数：

```kotlin
object GridEditorStateReducer {
    fun resize(state: GridEditorState, rows: Int, cols: Int): GridEditorState
    fun selectCell(state: GridEditorState, row: Int, col: Int): GridEditorState
    fun setDirection(state: GridEditorState, direction: Direction): GridEditorState
    fun setInputWord(state: GridEditorState, value: String): GridEditorState
    fun setInputClue(state: GridEditorState, value: String): GridEditorState
    fun confirmWord(state: GridEditorState): GridEditorState
    fun deleteWord(state: GridEditorState, index: Int): GridEditorState
}
```

规则：

- `resize` 将行列限制在 `5..15`，并重置 grid/words。
- `setInputWord` 将英文转大写，中文保持原样。
- `confirmWord` 要求已选格子且 word 非空。
- 横向放置时列递增，纵向放置时行递增。
- 超出网格返回错误：`单词超出网格范围`。
- 交叉处已有相同字母允许。
- 交叉处已有不同字母返回错误：`冲突：位置 (row, col) 已有字母`。
- `deleteWord` 删除某个词时，只清除没有被其他词占用的格子。

- [ ] **步骤 4：实现 `GridEditorScreen`**

公开签名：

```kotlin
@Composable
fun GridEditorScreen(
    onBack: () -> Unit,
    onPlay: (Int, Int, List<List<Cell>>, List<WordPlacement>) -> Unit
)
```

界面内容：

- 顶部栏：返回按钮，标题 `创建谜题`。
- 工具栏：
  - 行数输入。
  - 列数输入。
  - 横向/纵向切换按钮。
  - `开始游戏` 按钮。
- 可滚动网格：
  - 未使用格为黑色。
  - 已放字母格为白色。
  - 当前选中格高亮。
- 底部编辑区：
  - 当前选中坐标。
  - 单词输入。
  - 提示输入。
  - `确认`。
  - `取消`。
- 已添加词列表：
  - word。
  - clue。
  - direction。
  - 删除按钮。

屏幕内部状态：

```kotlin
var editorState by remember { mutableStateOf(GridEditorState()) }
```

所有状态变更必须通过 `GridEditorStateReducer`。

- [ ] **步骤 5：编辑器数据转游戏数据**

点击 `开始游戏` 时：

- 要求 `editorState.words.isNotEmpty()`。
- 将 `EditorCell` 转为领域层 `Cell`。
- 将 `EditorWord` 转为 `WordPlacement`。
- 横向词使用数字 label。
- 纵向词使用字母 label。
- 调用：

```kotlin
onPlay(rows, cols, grid, placements)
```

- [ ] **步骤 6：更新 `GameViewModel.loadCustomPuzzle`**

根据 placements 构建 clues：

```kotlin
val clues = placements.map {
    Clue(number = it.number, word = it.word, clue = it.clue, direction = it.direction)
}
```

更新 state：

```kotlin
val hasHan = placements.any { placement ->
    placement.word.any { char -> char in '\u4e00'..'\u9fff' }
}

crossword = Crossword(rows, cols, grid, placements, clues),
gridRows = rows,
gridCols = cols,
inputMode = if (hasHan) InputMode.CANDIDATE_CHARS else InputMode.LETTERS,
candidateChars = if (hasHan) {
    ChineseCandidateSelector.getCandidateChars(placements.map { it.word })
} else {
    emptyList()
}
```

- [ ] **步骤 7：测试和构建**

```powershell
.\gradlew.bat testDebugUnitTest --tests com.crossword.app.ui.editor.GridEditorStateReducerTest
.\gradlew.bat assembleDebug
```

- [ ] **步骤 8：手动 QA**

- 打开 `创建`。
- 设置 `8 x 8`。
- 添加横向 `JAVA`。
- 添加一个在 `A` 上交叉的纵向词。
- 尝试一个冲突交叉，确认显示错误。
- 点击 `开始游戏`。
- 确认进入自定义谜题游戏页。
- 填完答案，确认完成弹窗出现且可关闭。

- [ ] **步骤 9：提交**

```powershell
git add android/app/src/main/java/com/crossword/app/ui/editor android/app/src/test/java/com/crossword/app/ui/editor/GridEditorStateReducerTest.kt android/app/src/main/java/com/crossword/app/ui/CrosswordApp.kt android/app/src/main/java/com/crossword/app/ui/game/GameViewModel.kt
git commit -m "feat: add Android manual puzzle editor"
```

---

## 任务 12：整体打磨、回归和文档

**目标：** 清理实现痕迹，跑完整测试和构建，更新 README。

**涉及文件：**

- 修改：`README.md`
- 修改：`android/app/src/main/res/values/strings.xml`
- 视回归结果小修相关 Android 文件。

- [ ] **步骤 1：跑完整单元测试**

```powershell
cd C:\Users\10627\Desktop\HLPP_GAME_CROSSWORD\android-app\android
.\gradlew.bat testDebugUnitTest
```

期望：全部通过。

- [ ] **步骤 2：跑 debug 构建**

```powershell
.\gradlew.bat assembleDebug
```

期望：APK 构建成功。

- [ ] **步骤 3：手动回归清单**

逐项验证：

- 首次启动进入默认 `Monty Python 主题`。
- `新游戏` 会重新生成谜题。
- `设置` 可以修改网格尺寸。
- 重启 App 后保留当前词库和网格尺寸。
- 三个系统词库都能选择并开始游戏。
- 中文成语词库使用候选字键盘。
- 添加自定义词库后能直接开始游戏。
- 自定义词库可以重命名。
- 自定义词库可以删除。
- 删除当前自定义词库后回到默认词库。
- 英文搜索可用。
- 中文成语搜索可用。
- 手动创建谜题可用。
- 显示/隐藏答案可用。
- 删除键可用。
- 完成弹窗能关闭。

- [ ] **步骤 4：更新 README**

Android 部分说明：

- 原生 Android 使用 Kotlin + Compose。
- 包含三个系统词库。
- 支持本地自定义词库。
- 支持中文成语。
- 支持词表搜索。
- 支持手动创建谜题。

- [ ] **步骤 5：扫描陈旧注释**

```powershell
Select-String -Path android\app\src\main\java\com\crossword\app\**\*.kt -Pattern "TODO|TBD|当前版本可能未实现|空实现"
```

期望：本轮 touched files 中没有误导性注释。发现后删除或改成准确说明。

- [ ] **步骤 6：检查 git 状态**

```powershell
git status --short
```

期望：

- Android 改动和 README 改动都已跟踪或提交。
- 之前已有的 Web 未跟踪文件仍未被本轮任务误改。

- [ ] **步骤 7：提交**

```powershell
git add README.md android/app/src/main/res/values/strings.xml android/app/src/main/java/com/crossword/app
git commit -m "docs: document Android feature parity work"
```

---

## 五、风险和注意事项

- `chinese_idioms_core.txt` 较大，但为了离线中文玩法需要保留在 assets。
- 当前生成器基于 Kotlin `Char`，对英文和常见汉字足够。不要在本轮扩展到完整 Unicode grapheme，除非真实数据测试失败。
- `GameViewModel` 可能变大。若实现中明显难维护，可在任务 7 附近拆出 `WordListController` 或单独 `WordListViewModel`，但 UI 对外回调保持稳定。
- `ExposedDropdownMenuBox` 取决于 Material3 版本；若编译不支持，搜索页用 `AlertDialog` 选择词表。
- 本轮 UI 自动化测试不做全量覆盖，复杂业务逻辑用纯单元测试覆盖，交互用手动 QA 验证。

## 六、完成标准

本计划完成时必须满足：

- `.\gradlew.bat testDebugUnitTest` 通过。
- `.\gradlew.bat assembleDebug` 通过。
- Android 可以使用系统词库和自定义词库。
- Android 可以游玩中文成语谜题，并用候选汉字输入。
- Android 可以搜索词表。
- Android 可以手动创建并游玩谜题。
- README 已更新 Android 功能说明。
