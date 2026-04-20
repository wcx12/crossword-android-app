// 包声明
package com.crossword.app.data.local

// 导入词条模型
import com.crossword.app.data.model.WordEntry

/**
 * WordFileParser - 词库文件解析器
 *
 * 将文本文件解析为词条列表
 *
 * 支持格式：
 * 1. "word clue" - 空格分隔
 * 2. "word" - 只有单词
 */
object WordFileParser {

    /**
     * parse - 解析多行文本为词条列表
     *
     * @param lines：行列表
     * @return：词条列表
     *
     * mapNotNull：遍历并过滤掉null结果
     */
    fun parse(lines: List<String>): List<WordEntry> {
        return lines.mapNotNull { WordEntry.fromLine(it) }
    }

    /**
     * parse - 解析单个字符串
     *
     * @param text：包含多行的文本
     * @return：词条列表
     */
    fun parse(text: String): List<WordEntry> {
        return parse(text.lines())
    }

    /**
     * validate - 验证词库文件格式
     *
     * @param lines：行列表
     * @return：Pair(是否全部有效, 解析出的词条列表)
     */
    fun validate(lines: List<String>): Pair<Boolean, List<WordEntry>> {
        val entries = parse(lines)
        val validLines = entries.size
        val totalLines = lines.count { it.isNotBlank() }
        return Pair(validLines == totalLines, entries)
    }
}
