// 包声明
package com.crossword.app.ui.game

// Application：Android应用上下文
import android.app.Application

// AndroidViewModel：需要Application上下文的ViewModel基类
import androidx.lifecycle.AndroidViewModel

// viewModelScope：ViewModel的协程作用域
import androidx.lifecycle.viewModelScope

// DefaultWordLoader：加载默认词库
import com.crossword.app.data.local.DefaultWordLoader

// Direction枚举
import com.crossword.app.domain.model.Direction

// DefaultWordRepository：默认词库实现
import com.crossword.app.domain.repository.DefaultWordRepository

// CrosswordGenerator：谜题生成器
import com.crossword.app.domain.usecase.CrosswordGenerator

// 协程相关
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * GameViewModel - 游戏视图模型
 *
 * 职责：
 * 1. 管理GameState状态
 * 2. 处理用户交互（输入、点击等）
 * 3. 调用CrosswordGenerator生成谜题
 * 4. 协调词库加载和UI更新
 *
 * 架构：
 * - 继承AndroidViewModel，获取Application上下文
 * - 使用StateFlow存储状态
 * - 使用viewModelScope执行协程
 *
 * 状态流向：
 * 用户操作 → ViewModel方法 → 更新State → Compose UI自动重组
 */
class GameViewModel(application: Application) : AndroidViewModel(application) {

    /**
     * _state - 私有可变状态流
     *
     * MutableStateFlow：可变的StateFlow
     * 内部可以修改，外部只读
     *
     * 初始值：GameState()空状态
     */
    private val _state = MutableStateFlow(GameState())

    /**
     * state - 对外暴露的状态流
     *
     * asStateFlow()：转为只读StateFlow
     * Compose通过collectAsState()观察此流
     */
    val state: StateFlow<GameState> = _state.asStateFlow()

    /**
     * wordRepository - 词库仓库
     *
     * 使用接口类型DefaultWordRepository
     * 便于后续扩展自定义词库
     */
    private var wordRepository = DefaultWordRepository(emptyList())

    /**
     * generator - 谜题生成器
     *
     * 配置13x13网格
     * 支持最多13行13列的谜题
     */
    private val generator = CrosswordGenerator(rows = 13, cols = 13)

    /**
     * init - 初始化块
     *
     * 构造函数执行后立即执行
     * 用于初始化操作
     */
    init {
        // 在init块中加载默认词库
        loadDefaultWords(application)
    }

    /**
     * loadDefaultWords - 加载默认词库
     *
     * 从assets文件加载词库
     * 在IO线程执行文件读取
     * 加载完成后切换到主线程开始新游戏
     *
     * @param context：Application上下文，用于访问assets
     */
    private fun loadDefaultWords(application: Application) {
        /**
         * viewModelScope.launch - 启动协程
         *
         * Dispatchers.IO：IO密集型任务的调度器
         * 用于文件读写、网络请求等
         */
        viewModelScope.launch(Dispatchers.IO) {
            // 从assets加载词库文件
            // DefaultWordLoader.load()是挂起函数
            val words = DefaultWordLoader.load(application)

            // 创建词库仓库
            wordRepository = DefaultWordRepository(words)

            /**
             * withContext - 切换调度器
             *
             * Dispatchers.Main：主线程调度器
             * UI更新必须在主线程执行
             */
            withContext(Dispatchers.Main) {
                // 加载完成后自动开始新游戏
                newGame()
            }
        }
    }

    /**
     * newGame - 开始新游戏
     *
     * 流程：
     * 1. 设置加载状态
     * 2. 获取词库
     * 3. 生成新谜题
     * 4. 更新状态
     *
     * 使用viewModelScope在后台执行计算
     * 使用withContext切换到主线程更新UI
     */
    fun newGame() {
        /**
         * update - 更新状态
         *
         * _state.update { it.copy(...) }
         * 接收当前状态，返回新状态
         * copy()创建状态副本，只修改指定属性
         */
        _state.update {
            it.copy(
                isLoading = true,      // 显示加载
                errorMessage = null    // 清除错误
            )
        }

        /**
         * launch：启动新的协程
         * Dispatchers.Default：CPU密集型调度器
         * 用于谜题生成计算
         */
        viewModelScope.launch(Dispatchers.Default) {
            try {
                // 从仓库获取词库
                val words = wordRepository.getWords()

                // 调用生成器生成谜题
                // timeLimit=3f：最多3秒计算时间
                val crossword = generator.generate(words, timeLimit = 3f)

                /**
                 * 切换到主线程更新UI
                 */
                withContext(Dispatchers.Main) {
                    if (crossword != null) {
                        // 生成成功：更新谜题，重置状态
                        _state.update {
                            it.copy(
                                crossword = crossword,    // 新谜题
                                isLoading = false,       // 隐藏加载
                                isSolved = false,        // 重置完成状态
                                showSolution = false,    // 重置答案显示
                                selectedCell = null,     // 清除选中
                                currentWord = null      // 清除当前词
                            )
                        }
                    } else {
                        // 生成失败：词库不足或无法生成
                        _state.update {
                            it.copy(
                                isLoading = false,       // 隐藏加载
                                errorMessage = "无法生成谜题，请尝试更多单词"
                            )
                        }
                    }
                }
            } catch (e: Exception) {
                // 捕获异常，防止崩溃
                withContext(Dispatchers.Main) {
                    _state.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = "生成失败: ${e.message}"
                        )
                    }
                }
            }
        }
    }

    /**
     * selectCell - 选择格子
     *
     * 点击网格时的处理逻辑
     *
     * 规则：
     * 1. 不能选择墙格子
     * 2. 点击同一词语的其他格子，保持方向
     * 3. 点击不同方向的词，切换方向
     *
     * @param row：行索引
     * @param col：列索引
     */
    fun selectCell(row: Int, col: Int) {
        // 获取当前状态
        val crossword = _state.value.crossword ?: return  // ?: return = if null return

        // 安全获取格子
        val cell = crossword.grid.getOrNull(row)?.getOrNull(col) ?: return

        // 墙格子不能选择
        if (cell.isBlocked) return

        // 获取当前方向
        val currentDir = _state.value.currentDirection

        /**
         * 获取点击位置的词语
         *
         * getWordAt()返回包含此格子的词语
         * 可能返回null（格子在词的外围）
         */
        val word = crossword.getWordAt(row, col)

        /**
         * 确定新方向
         *
         * when表达式多条件判断
         */
        val newDirection = when {
            // 情况1：无词语（空白区域）
            // 保持当前方向
            word == null -> currentDir

            // 情况2：词语方向与当前方向不同
            // 切换到那个词的方向
            word.direction != currentDir -> word.direction

            // 情况3：词语方向与当前方向相同
            else -> {
                // 获取当前词
                val currentWord = _state.value.currentWord
                if (currentWord != null && word.id == currentWord.id) {
                    // 点击同一词语的其他位置，保持方向
                    currentDir
                } else {
                    // 点击不同词语，切换方向
                    word.direction
                }
            }
        }

        // 重新获取词语（方向可能改变了）
        val newWord = crossword.getWordAt(row, col)

        // 更新状态
        _state.update {
            it.copy(
                selectedCell = Pair(row, col),     // 新选中格子
                currentDirection = newDirection,   // 新方向
                currentWord = newWord              // 新词语
            )
        }
    }

    /**
     * toggleDirection - 切换方向
     *
     * 横→竖 或 竖→横
     */
    fun toggleDirection() {
        // 计算新方向
        val newDir = when (_state.value.currentDirection) {
            Direction.HORIZONTAL -> Direction.VERTICAL
            Direction.VERTICAL -> Direction.HORIZONTAL
        }

        // 获取当前状态
        val selected = _state.value.selectedCell
        val crossword = _state.value.crossword

        // 如果有选中格子
        if (selected != null && crossword != null) {
            // 尝试获取新方向的词语
            val word = crossword.getWordAt(selected.first, selected.second)
            _state.update {
                it.copy(
                    currentDirection = newDir,
                    // takeIf：如果词语方向匹配则返回，否则返回当前词
                    currentWord = word?.takeIf { w -> w.direction == newDir }
                        ?: _state.value.currentWord
                )
            }
        } else {
            // 无选中格子，只切换方向
            _state.update { it.copy(currentDirection = newDir) }
        }
    }

    /**
     * setDirection - 设置方向
     *
     * @param direction：要设置的方向
     */
    fun setDirection(direction: Direction) {
        val selected = _state.value.selectedCell
        val crossword = _state.value.crossword

        if (selected != null && crossword != null) {
            val word = crossword.getWordAt(selected.first, selected.second)
            _state.update {
                it.copy(
                    currentDirection = direction,
                    currentWord = word?.takeIf { w -> w.direction == direction }
                        ?: _state.value.currentWord
                )
            }
        } else {
            _state.update { it.copy(currentDirection = direction) }
        }
    }

    /**
     * inputLetter - 输入字母
     *
     * 键盘输入时的处理
     *
     * @param letter：输入的字母
     */
    fun inputLetter(letter: Char) {
        // 获取选中格子
        val selected = _state.value.selectedCell ?: return
        val crossword = _state.value.crossword ?: return

        // 安全获取格子
        val cell = crossword.grid.getOrNull(selected.first)?.getOrNull(selected.second) ?: return
        if (cell.isBlocked) return

        // 将字母写入格子
        // uppercaseChar()：转换为大写
        crossword.grid[selected.first][selected.second].char = letter.uppercaseChar()

        // 自动移到下一个格子
        moveToNextCell()

        // 检查是否解决
        checkSolved()
    }

    /**
     * deleteLetter - 删除字母
     *
     * 退格键处理
     */
    fun deleteLetter() {
        val selected = _state.value.selectedCell ?: return
        val crossword = _state.value.crossword ?: return

        // 墙格子不能删除
        if (crossword.grid[selected.first][selected.second].isBlocked) return

        // 由于Crossword.grid是val（不可变引用）
        // 需要创建新副本才能修改
        // deep copy：每行复制，每格复制
        val newGrid = crossword.grid.map { row ->
            row.map { cell -> cell.copy() }.toMutableList()  // 复制每行每格
        }.toMutableList()  // 复制行列表

        // 清除选中格子的字母
        newGrid[selected.first][selected.second] =
            newGrid[selected.first][selected.second].copy(char = null)

        // 创建新的Crossword对象
        val newCrossword = crossword.copy(grid = newGrid)

        // 更新状态
        _state.update { it.copy(crossword = newCrossword) }
    }

    /**
     * clearWord - 清除当前词
     *
     * 删除当前词语的所有字母
     */
    fun clearWord() {
        // 获取当前词
        val word = _state.value.currentWord ?: return
        val crossword = _state.value.crossword ?: return

        // 遍历词语占据的所有格子
        for ((r, c) in word.getCells()) {
            crossword.grid[r][c].char = null
        }

        // 触发UI更新（copy空操作）
        _state.update { it.copy() }
    }

    /**
     * moveToNextCell - 移动到下一个可输入的格子
     *
     * 沿当前方向自动跳转
     * 跳过墙格子
     */
    private fun moveToNextCell() {
        val selected = _state.value.selectedCell ?: return
        val crossword = _state.value.crossword ?: return
        val direction = _state.value.currentDirection

        val (row, col) = selected  // 解构Pair

        // 根据方向确定移动增量
        val (dr, dc) = when (direction) {
            // HORIZONTAL：行不变，列+1
            Direction.HORIZONTAL -> Pair(0, 1)
            // VERTICAL：行+1，列不变
            Direction.VERTICAL -> Pair(1, 0)
        }

        // 初始化新位置
        var newRow = row + dr
        var newCol = col + dc

        // 循环寻找下一个可输入的格子
        while (newRow in 0 until crossword.rows && newCol in 0 until crossword.cols) {
            val cell = crossword.grid[newRow][newCol]
            if (!cell.isBlocked) {
                // 找到非墙格子，更新选中
                _state.update { it.copy(selectedCell = Pair(newRow, newCol)) }
                return
            }
            // 继续移动
            newRow += dr
            newCol += dc
        }
    }

    /**
     * showSolution - 显示答案
     */
    fun showSolution() {
        _state.update { it.copy(showSolution = true) }
    }

    /**
     * hideSolution - 隐藏答案
     */
    fun hideSolution() {
        _state.update { it.copy(showSolution = false) }
    }

    /**
     * checkSolved - 检查是否解决
     *
     * 当所有非墙格子都填入正确字母时触发
     */
    private fun checkSolved() {
        val crossword = _state.value.crossword ?: return
        // Crossword.isSolved()检查是否全部正确
        if (crossword.isSolved()) {
            _state.update { it.copy(isSolved = true) }
        }
    }
}
