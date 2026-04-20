// 包声明
package com.crossword.app.domain.repository

// 导入词条模型
import com.crossword.app.data.model.WordEntry

/**
 * WordRepository - 词库仓储接口
 *
 * 定义词库的抽象
 * 支持自定义词库扩展
 */
interface WordRepository {
    /**
     * getWords - 获取词库中的所有词条
     */
    suspend fun getWords(): List<WordEntry>

    /**
     * getName - 获取词库名称
     */
    fun getName(): String
}

/**
 * DefaultWordRepository - 内置默认词库
 *
 * @param words：词条列表
 */
class DefaultWordRepository(private val words: List<WordEntry>) : WordRepository {
    // getWords：返回词条列表
    override suspend fun getWords(): List<WordEntry> = words
    // getName：返回词库名称
    override fun getName(): String = "默认词库"
}

/**
 * CustomWordRepository - 用户自定义词库
 *
 * @param words：词条列表
 */
class CustomWordRepository(private val words: List<WordEntry>) : WordRepository {
    // getName：返回词库名称
    override fun getName(): String = "自定义词库"
    // getWords：返回词条列表
    override suspend fun getWords(): List<WordEntry> = words
}
