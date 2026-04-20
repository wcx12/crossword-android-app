// 包声明
package com.crossword.app.domain.model

/**
 * Direction - 方向枚举
 *
 * 表示词语在网格中的放置/输入方向
 */
enum class Direction {
    // 水平方向（横排词语）
    HORIZONTAL,

    // 垂直方向（竖排词语）
    VERTICAL
}

/**
 * Cell - 单个格子数据类
 *
 * 代表纵横字谜网格中的一个单元格
 *
 * @property row：所在行索引（从0开始）
 * @property col：所在列索引（从0开始）
 * @property char：用户输入的字母，null表示尚未填写
 * @property solutionChar：正确答案，null表示墙或未设置
 * @property isBlocked：是否是墙格子
 *
 * 特点：
 * - 使用var声明的属性可以修改（char）
 * - 使用val声明的属性不可修改（row, col, solutionChar, isBlocked）
 */
data class Cell(
    // 行索引
    val row: Int,
    // 列索引
    val col: Int,
    // 用户输入的字母，var表示可变
    var char: Char? = null,
    // 正确答案
    val solutionChar: Char? = null,
    // 是否是墙，true=黑色不可填，false=白色可填
    val isBlocked: Boolean = false
) {
    /**
     * isEmpty - 是否为空
     *
     * 快捷属性，检查char是否为null
     * 用于判断格子是否尚未输入
     */
    val isEmpty: Boolean get() = char == null

    /**
     * isCorrect - 用户输入是否正确
     *
     * 比较用户输入和答案
     * 仅当两者都不为null且相等时返回true
     */
    val isCorrect: Boolean get() = char == solutionChar
}

/**
 * WordPlacement - 词语位置数据类
 *
 * 表示一个词语在网格中的位置和方向信息
 *
 * @property id：唯一标识符，用于区分不同词语
 * @property word：单词字符串，如"HELLO"
 * @property clue：线索/提示文本
 * @property row：起始格子行索引
 * @property col：起始格子列索引
 * @property direction：词语方向（横/竖）
 * @property number：编号（用于显示和线索引用）
 * @property displayLabel：显示用标签
 *   - 横排用数字，如"1", "2", "3"
 *   - 竖排用字母，如"A", "B", "C"
 */
data class WordPlacement(
    val id: Int,           // 唯一标识
    val word: String,      // 单词
    val clue: String,      // 线索
    val row: Int,          // 起始行
    val col: Int,          // 起始列
    val direction: Direction,  // 方向
    val number: Int,       // 编号
    val displayLabel: String  // 显示标签
) {
    /**
     * length - 词语长度
     *
     * 快捷属性，返回单词的字符数
     */
    val length: Int get() = word.length

    /**
     * getCells - 获取词语占据的所有格子坐标
     *
     * @return List<Pair<Int, Int>> 坐标列表
     *   每项为Pair(row, col)
     *
     * 示例：
     * - 水平词"HELLO"在(2,3) → 返回[(2,3),(2,4),(2,5),(2,6),(2,7)]
     * - 垂直词"WORLD"在(1,4) → 返回[(1,4),(2,4),(3,4),(4,4),(5,4)]
     */
    fun getCells(): List<Pair<Int, Int>> {
        return when (direction) {
            // HORIZONTAL：水平词，逐列递增
            Direction.HORIZONTAL ->
                // 0 until length：范围[0, length)
                (0 until length).map { Pair(row, col + it) }

            // VERTICAL：垂直词，逐行递增
            Direction.VERTICAL ->
                (0 until length).map { Pair(row + it, col) }
        }
    }
}

/**
 * Clue - 线索数据类
 *
 * 用于显示给用户的提示信息
 *
 * @property number：编号（与WordPlacement.number对应）
 * @property word：单词（用于答案验证）
 * @property clue：提示文本
 * @property direction：词语方向
 */
data class Clue(
    val number: Int,       // 编号
    val word: String,      // 单词
    val clue: String,      // 线索
    val direction: Direction  // 方向
)

/**
 * Crossword - 纵横字谜数据类
 *
 * 代表一个完整的纵横字谜谜题
 * 包含网格数据、词语位置、线索列表
 *
 * @property rows：网格行数
 * @property cols：网格列数
 * @property grid：二维单元格矩阵，grid[row][col]访问
 * @property placements：所有词语位置列表
 * @property clues：所有线索列表
 */
data class Crossword(
    val rows: Int,                          // 行数
    val cols: Int,                          // 列数
    val grid: List<List<Cell>>,             // grid[row][col] = Cell
    val placements: List<WordPlacement>,     // 所有词语位置
    val clues: List<Clue>                   // 所有线索
) {
    /**
     * getWordAt - 获取指定位置的词语
     *
     * @param row：行索引
     * @param col：列索引
     * @param direction：可选，指定方向过滤
     * @return：该位置所属的词语，如果无词语则返回null
     *
     * 示例：
     * - 点击格子(3,5)，返回包含此格子的词语
     * - 如果指定direction，只会返回该方向的词语
     */
    fun getWordAt(row: Int, col: Int, direction: Direction? = null): WordPlacement? {
        return placements.find { placement ->
            // 检查词语是否包含此格子
            placement.getCells().contains(Pair(row, col)) &&
            // 检查方向是否匹配（如果指定了方向）
            (direction == null || placement.direction == direction)
        }
    }

    /**
     * isFilled - 检查是否全部填满
     *
     * @return true=所有非墙格子都有字母，false=存在空格子
     *
     * 算法：
     * 1. flatten()将二维网格转为一维列表
     * 2. filter {!it.isBlocked} 排除墙格子
     * 3. all {!it.isEmpty} 检查是否都不为空
     */
    fun isFilled(): Boolean {
        return grid.flatten()
            .filter { !it.isBlocked }  // 排除墙
            .all { !it.isEmpty }       // 全部不为空
    }

    /**
     * isSolved - 检查是否全部正确
     *
     * @return true=所有非墙格子的输入都正确，false=存在错误
     *
     * 注意：允许存在未填写的格子
     * 只需填写的格子都正确即可
     */
    fun isSolved(): Boolean {
        return grid.flatten()
            .filter { !it.isBlocked }  // 排除墙
            .all { it.isCorrect }      // 全部正确
    }

    /**
     * getCorrectRate - 统计正确率
     *
     * @return 正确率，范围0.0~1.0
     *         空网格返回1.0
     *
     * 算法：
     * 1. 获取所有非墙格子
     * 2. 统计正确的格子数
     * 3. 计算比例
     */
    fun getCorrectRate(): Float {
        // 获取所有非墙格子
        val cells = grid.flatten().filter { !it.isBlocked }

        // 空网格视为完全正确
        if (cells.isEmpty()) return 1f

        // 统计正确数
        val correct = cells.count { it.isCorrect }

        // 计算比例
        return correct.toFloat() / cells.size
    }
}
