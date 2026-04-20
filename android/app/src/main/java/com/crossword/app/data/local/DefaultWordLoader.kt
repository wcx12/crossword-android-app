// 包声明
package com.crossword.app.data.local

// Context：Android上下文，用于访问assets
import android.content.Context

// 词条模型
import com.crossword.app.data.model.WordEntry

/**
 * DefaultWordLoader - 从Assets加载默认词库
 *
 * 使用单例object声明
 * 无需实例化，直接调用方法
 */
object DefaultWordLoader {

    /**
     * DEFAULT_WORDS_FILE - 默认词库文件名
     *
     * 从assets/wordlists/目录加载
     */
    private const val DEFAULT_WORDS_FILE = "wordlists/python_xword.txt"

    /**
     * load - 从assets加载词库
     *
     * @param context：Application上下文
     * @param filename：可选，自定义文件名
     * @return：词条列表，失败返回空列表
     */
    fun load(context: Context, filename: String = DEFAULT_WORDS_FILE): List<WordEntry> {
        return try {
            // context.assets.open()：打开assets文件
            // bufferedReader().readLines()：读取所有行
            val lines = context.assets.open(filename).bufferedReader().readLines()
            // 解析为词条列表
            WordFileParser.parse(lines)
        } catch (e: Exception) {
            // 打印异常
            e.printStackTrace()
            // 返回空列表
            emptyList()
        }
    }
}
