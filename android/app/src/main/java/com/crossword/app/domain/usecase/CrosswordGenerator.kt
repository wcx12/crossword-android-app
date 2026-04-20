// 包声明
package com.crossword.app.domain.usecase

// 数据模型
import com.crossword.app.data.model.WordEntry
import com.crossword.app.domain.model.*

// Kotlin随机数
import kotlin.random.Random

/**
 * CrosswordGenerator - Crossword谜题生成器
 *
 * 使用贪心算法在有限时间内生成纵横字谜
 * 从Python版本的genxword移植
 *
 * 算法核心思想：
 * 1. 在时间限制内多次尝试
 * 2. 每次从第一个词开始，贪心地放置剩余词
 * 3. 记录放置词数最多的方案作为最终结果
 *
 * @property rows：网格行数，默认15
 * @property cols：网格列数，默认15
 * @property emptyChar：空格子填充字符，默认'-'
 */
class CrosswordGenerator(
    private val rows: Int = 15,      // 网格行数
    private val cols: Int = 15,      // 网格列数
    private val emptyChar: Char = '-' // 空字符标记
) {
    // 可用词库（MutableList可修改）
    private lateinit var availableWords: MutableList<WordEntry>

    // 当前成功放置的词列表
    private var currentWordlist: MutableList<WordEntry> = mutableListOf()

    // 当前网格状态（MutableList可修改每个元素）
    private lateinit var grid: MutableList<MutableList<Char>>

    /**
     * letCoords - 字母坐标映射
     *
     * key：字母字符
     * value：该字母在网格中的所有位置列表
     *   每个位置是Triple(row, col, isVertical)
     *   - row/col：坐标
     *   - isVertical：该位置处词的放置方向
     *
     * 用途：O(1)时间复杂度查找某个字母的所有交叉点
     *
     * 示例：
     * letCoords['A'] = [(0,0,true), (0,0,false), (3,5,true)]
     * 表示字母A出现在位置(0,0)作为垂直词、(0,0)作为水平词（同一个格子不同方向）、(3,5)作为垂直词
     */
    private var letCoords: MutableMap<Char, MutableList<Triple<Int, Int, Boolean>>> = mutableMapOf()

    // 历史最佳词列表
    private var bestWordlist: List<WordEntry> = emptyList()

    // 历史最佳网格
    private lateinit var bestGrid: List<List<Char>>

    /**
     * generate - 生成纵横字谜
     *
     * @param words：可用词库列表
     * @param timeLimit：计算时间限制（秒）
     * @return：生成的Crossword谜题，如果词库不足2个词则返回null
     *
     * 算法流程：
     * 1. 词库至少需要2个词才能形成交叉
     * 2. 在时间限制内循环尝试
     * 3. 每次重置网格，放置第一个词
     * 4. 贪心添加剩余词（两轮遍历）
     * 5. 记录最佳方案
     */
    fun generate(words: List<WordEntry>, timeLimit: Float = 1f): Crossword? {
        // 至少需要2个词才能形成交叉
        if (words.size < 2) return null

        // 复制词库（深拷贝）
        availableWords = words.map { it.copyOf() }.toMutableList()

        // 重置最佳解
        bestWordlist = emptyList()

        // 记录时间
        val startTime = System.currentTimeMillis()
        val endTime = startTime + (timeLimit * 1000).toLong()

        /**
         * 时间循环
         *
         * 每次循环尝试生成一个完整的谜题
         * 由于第一个词的随机性，每次结果可能不同
         */
        while (System.currentTimeMillis() < endTime) {
            // 重置并放置第一个词
            prepGridWords()

            /**
             * 贪心添加
             *
             * repeat(2)：执行2次遍历
             * 第一次按原始顺序，第二次给后排词更多机会
             */
            repeat(2) {
                // 遍历所有词
                for (word in availableWords) {
                    // 只尝试未放置的词
                    if (word !in currentWordlist) {
                        addWord(word)
                    }
                }
            }

            /**
             * 更新最佳解
             *
             * 如果当前方案比历史最佳更好（放置更多词）
             */
            if (currentWordlist.size > bestWordlist.size) {
                // 深拷贝当前方案
                bestWordlist = currentWordlist.toList()
                bestGrid = grid.map { it.toList() }
            }

            /**
             * 提前终止
             *
             * 已放置所有词，说明找到完美解
             */
            if (bestWordlist.size == availableWords.size) {
                break
            }
        }

        // 构建并返回谜题对象
        return buildCrossword()
    }

    /**
     * prepGridWords - 准备网格和初始词
     *
     * 重置所有状态并放置第一个词
     * 第一个词通常是词库中最长的词
     */
    private fun prepGridWords() {
        // 清空当前词列表
        currentWordlist.clear()

        // 清空交叉点索引
        letCoords.clear()

        // 初始化rows x cols的空网格
        grid = MutableList(rows) { MutableList(cols) { emptyChar } }

        // 如果词库不为空，放置第一个词
        if (availableWords.isNotEmpty()) {
            // availableWords已按长度降序排序
            placeFirstWord(availableWords[0])
        }
    }

    /**
     * WordEntry.copyOf - 复制WordEntry
     *
     * 用于在列表中添加位置信息后保留原数据
     * 由于WordEntry是不可变data class，copy()返回等价的实例
     */
    private fun WordEntry.copyOf(): WordEntry = this

    /**
     * findPossiblePositions - 查找可能的放置位置
     *
     * @param word：要放置的词
     * @return：最佳位置信息（含得分），无位置返回null
     *
     * 算法流程：
     * 1. 收集所有交叉点
     * 2. 对每个交叉点评估放置可行性
     * 3. 返回得分最高的位置
     */
    private fun findPossiblePositions(word: WordEntry): WordPlacementInfo? {
        val wordLength = word.length
        val coordList = mutableListOf<WordPlacementInfo>()

        /**
         * 阶段1：收集所有交叉点
         *
         * 遍历词的每个字母
         * 查找该字母在网格中的所有现有位置
         */
        val tempList = mutableListOf<Pair<Int, List<Triple<Int, Int, Boolean>>>>()
        for ((index, letter) in word.word.withIndex()) {
            // 获取该字母的所有位置
            val coords = letCoords[letter] ?: continue
            for (coord in coords) {
                // (字母索引, 该字母的坐标列表)
                tempList.add(Pair(index, listOf(coord)))
            }
        }

        /**
         * 阶段2：评估每个交叉点
         */
        for ((letterIndex, coords) in tempList) {
            for ((row, col, vert) in coords) {
                if (vert) {
                    // 交叉点是垂直词 → 尝试水平放置
                    // 检查水平位置是否有效
                    if (col - letterIndex >= 0 && col - letterIndex + wordLength <= cols) {
                        // 计算得分
                        val score = scoreHorizontal(word, row, col - letterIndex, wordLength)
                        if (score > 0) {
                            coordList.add(WordPlacementInfo(row, col - letterIndex, Direction.HORIZONTAL, score))
                        }
                    }
                } else {
                    // 交叉点是水平词 → 尝试垂直放置
                    if (row - letterIndex >= 0 && row - letterIndex + wordLength <= rows) {
                        val score = scoreVertical(word, row - letterIndex, col, wordLength)
                        if (score > 0) {
                            coordList.add(WordPlacementInfo(row - letterIndex, col, Direction.VERTICAL, score))
                        }
                    }
                }
            }
        }

        // 返回得分最高的位置
        return coordList.maxByOrNull { it.score }
    }

    /**
     * WordPlacementInfo - 位置信息数据类
     *
     * 包含放置所需的所有信息
     */
    private data class WordPlacementInfo(
        val row: Int,             // 起始行
        val col: Int,             // 起始列
        val direction: Direction, // 放置方向
        val score: Int            // 得分
    )

    /**
     * placeFirstWord - 放置第一个词
     *
     * 随机选择位置和方向
     * 这是贪心算法的起点
     *
     * @param word：要放置的词（通常是词库中最长的词）
     */
    private fun placeFirstWord(word: WordEntry) {
        // 随机选择方向
        val vertical = Random.nextBoolean()

        // 计算最大起始位置
        val maxPos = if (vertical) rows - word.length else cols - word.length

        // 随机选择起始坐标
        // nextInt(bound)：返回[0, bound)的随机整数
        val row = if (vertical) Random.nextInt(rows - word.length + 1) else Random.nextInt(rows)
        val col = if (vertical) Random.nextInt(cols) else Random.nextInt(cols - word.length + 1)

        // 执行放置
        placeWord(word, row, col, vertical)
    }

    /**
     * addWord - 添加词语到网格
     *
     * 贪心选择最佳位置
     *
     * @param word：要添加的词
     * @return：true=成功添加，false=无法添加
     */
    private fun addWord(word: WordEntry): Boolean {
        // 查找最佳位置
        val position = findPossiblePositions(word) ?: return false

        // 放置到最佳位置
        placeWord(word, position.row, position.col, position.direction == Direction.VERTICAL)
        return true
    }

    /**
     * scoreHorizontal - 计算水平方向得分
     *
     * 评估将词水平放置在指定位置的有效性和交叉程度
     *
     * @param word：要放置的词
     * @param row, col：起始位置
     * @param wordLength：词长度
     * @param baseScore：基础得分，默认1
     * @return：得分，0表示不能放置
     *
     * 评分规则：
     * - 基础分1分
     * - 每个与现有字母的交叉点+1分
     * - 触边（边界外无边格要求）不扣分
     * - 上下有非法邻居返回0
     */
    private fun scoreHorizontal(word: WordEntry, row: Int, col: Int, wordLength: Int, baseScore: Int = 1): Int {
        // 检查左边是否有邻居
        if (col > 0 && grid[row][col - 1] != emptyChar) return 0
        // 检查右边是否有邻居
        if (col + wordLength < cols && grid[row][col + wordLength] != emptyChar) return 0

        var score = baseScore

        // 遍历每个字母
        for ((i, letter) in word.word.withIndex()) {
            val cell = grid[row][col + i]

            if (cell == emptyChar) {
                // 空格：检查上下是否有邻居
                if (row > 0 && grid[row - 1][col + i] != emptyChar) return 0
                if (row + 1 < rows && grid[row + 1][col + i] != emptyChar) return 0
            } else if (cell == letter) {
                // 交叉点：得分+1
                score += 1
            } else {
                // 冲突：不能放置
                return 0
            }
        }
        return score
    }

    /**
     * scoreVertical - 计算垂直方向得分
     *
     * 同水平方向，但检查左右邻居
     */
    private fun scoreVertical(word: WordEntry, row: Int, col: Int, wordLength: Int, baseScore: Int = 1): Int {
        // 检查上方是否有邻居
        if (row > 0 && grid[row - 1][col] != emptyChar) return 0
        // 检查下方是否有邻居
        if (row + wordLength < rows && grid[row + wordLength][col] != emptyChar) return 0

        var score = baseScore
        for ((i, letter) in word.word.withIndex()) {
            val cell = grid[row + i][col]

            if (cell == emptyChar) {
                // 检查左右
                if (col > 0 && grid[row + i][col - 1] != emptyChar) return 0
                if (col + 1 < cols && grid[row + i][col + 1] != emptyChar) return 0
            } else if (cell == letter) {
                score += 1
            } else {
                return 0
            }
        }
        return score
    }

    /**
     * placeWord - 将词语放置到网格中
     *
     * @param word：要放置的词
     * @param row, col：起始位置
     * @param vertical：true=垂直，false=水平
     *
     * 副作用：
     * - 修改grid矩阵
     * - 添加到currentWordlist
     * - 更新letCoords交叉点索引
     */
    private fun placeWord(word: WordEntry, row: Int, col: Int, vertical: Boolean) {
        // 添加到已放置列表
        currentWordlist.add(word)

        val horizontal = !vertical

        // 逐字符放置
        for ((i, letter) in word.word.withIndex()) {
            // 计算当前字母的实际位置
            val r = if (vertical) row + i else row
            val c = if (vertical) col else col + i

            // 写入网格
            grid[r][c] = letter

            // 更新交叉点索引
            val coord = Triple(r, c, vertical)
            val existing = Triple(r, c, horizontal)
            letCoords.getOrPut(letter) { mutableListOf() }.apply {
                // 移除旧的反方向记录
                if (existing in this) {
                    remove(existing)
                }
                // 添加新记录
                if (coord !in this) {
                    add(coord)
                }
            }
        }
    }

    /**
     * buildCrossword - 构建Crossword对象
     *
     * 将生成的数据转换为游戏可用的数据模型
     *
     * @return：Crossword谜题对象，失败返回null
     */
    private fun buildCrossword(): Crossword? {
        // 无解
        if (bestWordlist.isEmpty()) return null

        /**
         * 构建Cell网格
         */
        val cellGrid = List(rows) { r ->
            List(cols) { c ->
                Cell(
                    row = r,
                    col = c,
                    char = null,  // 用户输入初始为空
                    solutionChar = if (bestGrid[r][c] != emptyChar) bestGrid[r][c] else null,
                    isBlocked = bestGrid[r][c] == emptyChar  // 空字符=墙
                )
            }
        }

        // 找出所有词语位置并编号
        val placements = findPlacements(bestGrid)
        val clues = placements.map { Clue(it.number, it.word, it.clue, it.direction) }

        return Crossword(rows, cols, cellGrid, placements, clues)
    }

    /**
     * findPlacements - 找出所有词语位置
     *
     * 扫描网格找出所有成功放置的词语
     * 并重新编号
     *
     * @return：词语位置列表（带编号）
     */
    private data class PlacementKey(
        val word: String,
        val row: Int,
        val col: Int,
        val direction: Direction
    )

    private fun findPlacements(sourceGrid: List<List<Char>>): List<WordPlacement> {
        val placements = mutableListOf<WordPlacement>()
        val seenPlacements = mutableSetOf<PlacementKey>()

        // 按长度排序（先处理长词）
        // 这样可以避免短词切断长词
        val words = bestWordlist.sortedWith(compareBy({ it.length }, { bestWordlist.indexOf(it) }))
        var number = 1

        // 扫描网格
        for (word in words) {
            for (r in 0 until rows) {
                for (c in 0 until cols) {
                    // 找到词的第一个字母
                    if (sourceGrid[r][c] != word.word[0]) continue

                    // 尝试水平匹配
                    if (c + word.length <= cols) {
                        var match = true
                        for (i in word.word.indices) {
                            if (sourceGrid[r][c + i] != word.word[i]) {
                                match = false
                                break
                            }
                        }
                        if (match) {
                            val key = PlacementKey(word.word, r, c, Direction.HORIZONTAL)
                            if (seenPlacements.add(key)) {
                                placements.add(
                                    WordPlacement(
                                        id = placements.size,
                                        word = word.word,
                                        clue = word.clue,
                                        row = r,
                                        col = c,
                                        direction = Direction.HORIZONTAL,
                                        number = number++,
                                        displayLabel = ""
                                    )
                                )
                            }
                        }
                    }

                    // 尝试垂直匹配
                    if (r + word.length <= rows) {
                        var match = true
                        for (i in word.word.indices) {
                            if (sourceGrid[r + i][c] != word.word[i]) {
                                match = false
                                break
                            }
                        }
                        if (match) {
                            val key = PlacementKey(word.word, r, c, Direction.VERTICAL)
                            if (seenPlacements.add(key)) {
                                placements.add(
                                    WordPlacement(
                                        id = placements.size,
                                        word = word.word,
                                        clue = word.clue,
                                        row = r,
                                        col = c,
                                        direction = Direction.VERTICAL,
                                        number = number++,
                                        displayLabel = ""
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }

        // 重新编号
        val horizontalPlacements = placements.filter { it.direction == Direction.HORIZONTAL }
            .sortedWith(compareBy({ it.row }, { it.col }))
        val verticalPlacements = placements.filter { it.direction == Direction.VERTICAL }
            .sortedWith(compareBy({ it.col }, { it.row }))

        val numberedPlacements = mutableListOf<WordPlacement>()

        // 水平词编号：1,2,3...
        var num = 1
        for (placement in horizontalPlacements) {
            numberedPlacements.add(placement.copy(number = num, displayLabel = num.toString()))
            num++
        }

        // 垂直词编号：A,B,C...
        var letterNum = 0
        for (placement in verticalPlacements) {
            val letter = ('A' + letterNum).toString()
            numberedPlacements.add(placement.copy(number = letterNum + 1, displayLabel = letter))
            letterNum++
        }

        return numberedPlacements
    }
}
