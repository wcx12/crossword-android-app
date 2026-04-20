// 包声明
package com.crossword.app.data.model

/**
 * WordEntry - 词条数据类
 *
 * 表示一个单词及其对应的线索
 *
 * @property word：英文单词（会自动转大写）
 * @property clue：线索文本（中英文混合）
 *
 * 验证规则：
 * - word不能为空
 * - word必须只包含字母
 */
data class WordEntry(
    val word: String,  // 单词
    val clue: String  // 线索
) {
    /**
     * init块 - 初始化验证
     *
     * 在构造函数执行后立即执行
     * 用于验证参数合法性
     */
    init {
        // require：验证条件，不满足则抛出IllegalArgumentException
        require(word.isNotBlank()) { "Word cannot be blank" }
        require(word.all { it.isLetter() }) { "Word must contain only letters" }
    }

    /**
     * length - 单词长度
     *
     * 快捷属性
     */
    val length: Int get() = word.length

    /**
     * companion object - 伴生对象
     *
     * 类似于Java的静态方法
     * 可以通过WordEntry.fromLine()调用
     */
    companion object {
        /**
         * fromLine - 从行解析WordEntry
         *
         * 支持两种格式：
         * 1. "word clue" - 空格分隔
         * 2. "word" - 只有单词，clue为空
         *
         * @param line：原始行文本
         * @return：解析成功返回WordEntry，失败返回null
         */
        fun fromLine(line: String): WordEntry? {
            // trim()：去除首尾空白
            val trimmed = line.trim()

            // 空行返回null
            if (trimmed.isEmpty()) return null

            // split：按正则表达式分割，最多分割2部分
            // "\\s+"表示一个或多个空白字符
            val parts = trimmed.split("\\s+".toRegex(), limit = 2)

            // parts[0]转为大写
            val word = parts[0].uppercase()

            // getOrElse：获取第二个元素，如果不存在则返回空字符串
            val clue = parts.getOrElse(1) { "" }

            // 验证单词只包含字母
            return if (word.all { it.isLetter() }) {
                WordEntry(word, clue)
            } else {
                null
            }
        }
    }
}
