// 包声明
package com.crossword.app.ui.game

// background：设置背景色
import androidx.compose.foundation.background

// border：设置边框
import androidx.compose.foundation.border

// clickable：添加点击事件
import androidx.compose.foundation.clickable

// horizontalScroll：水平滚动容器
import androidx.compose.foundation.horizontalScroll

// layout相关组件
import androidx.compose.foundation.layout.*

// rememberScrollState：记住滚动状态
import androidx.compose.foundation.rememberScrollState

// verticalScroll：垂直滚动容器
import androidx.compose.foundation.verticalScroll

// Material3主题
import androidx.compose.material3.MaterialTheme

// Text文本组件
import androidx.compose.material3.Text

// compose运行时：@Composable注解标记Compose函数
import androidx.compose.runtime.Composable

// Alignment对齐方式
import androidx.compose.ui.Alignment

// Modifier修饰符
import androidx.compose.ui.Modifier

// Color颜色
import androidx.compose.ui.graphics.Color

// FontWeight字体粗细
import androidx.compose.ui.text.font.FontWeight

// TextAlign文本对齐
import androidx.compose.ui.text.style.TextAlign

// Dp密度无关像素
import androidx.compose.ui.unit.Dp

// dp单位
import androidx.compose.ui.unit.dp

// sp单位
import androidx.compose.ui.unit.sp

// 领域模型
import com.crossword.app.domain.model.Cell
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement

// 主题颜色
import com.crossword.app.ui.theme.*

/**
 * CrosswordGrid - 纵横字谜网格组件
 *
 * 功能：
 * 1. 显示完整的纵横字谜网格
 * 2. 根据屏幕尺寸动态计算格子大小
 * 3. 处理格子点击事件
 * 4. 高亮当前词语和选中格子
 *
 * @param crossword：谜题数据，包含网格、词语位置等
 * @param selectedCell：当前选中的格子坐标，Pair(row, col)
 * @param currentWord：当前选中的词语
 * @param currentDirection：当前输入方向
 * @param showSolution：是否显示答案
 * @param onCellClick：格子点击回调，参数为(row, col)
 * @param modifier：修饰符
 */
@Composable
fun CrosswordGrid(
    crossword: Crossword,                    // 谜题数据
    selectedCell: Pair<Int, Int>?,           // 当前选中格子，null表示无选中
    currentWord: WordPlacement?,             // 当前词语，null表示无选中
    currentDirection: Direction,             // 当前方向
    showSolution: Boolean,                   // 是否显示答案
    onCellClick: (Int, Int) -> Unit,        // 点击回调
    modifier: Modifier = Modifier            // 修饰符
) {
    /**
     * BoxWithConstraints - 带约束的Box
     *
     * 与Box类似，但可以在内容中访问父组件的尺寸约束
     * 用于动态计算格子大小
     */
    BoxWithConstraints(
        // modifier：添加padding
        modifier = modifier.padding(4.dp)
    ) {
        /**
         * 动态计算格子大小
         *
         * 目标：使网格适应屏幕，同时保持正方形格子
         */

        // scale：缩放系数，0.85使网格稍小以留出边距
        val scale = 0.85f

        // maxOf/minOf：取最大/最小值
        // maxWidth：BoxWithConstraints提供的父组件最大宽度
        // maxHeight：BoxWithConstraints提供的父组件最大高度
        // crossword.cols/rows：网格的列数/行数

        // 计算在水平/垂直方向每个格子能分到的最大尺寸
        // (maxWidth - 8.dp)：可用宽度减去边距
        // / crossword.cols：除以列数得到每列宽度
        // * scale：乘以缩放系数

        // minOf(水平最大尺寸, 垂直最大尺寸)：取较小值确保格子是正方形
        val maxCellSize = minOf(
            (maxWidth - 8.dp) / crossword.cols,
            (maxHeight - 8.dp) / crossword.rows
        ) * scale

        // maxOf(24.dp, minOf(...))：确保格子不小于24dp
        // minOf(..., 36.dp)：确保格子不大于36dp
        val cellSize = maxOf(24.dp, minOf(maxCellSize, 36.dp))

        // Column：垂直布局，显示所有行
        Column {
            // for循环：遍历每一行
            // 0 until crossword.rows：范围表达式，左闭右开
            // 等同于0..<crossword.rows 或 rangeTo(crossword.rows)
            for (row in 0 until crossword.rows) {
                // Row：水平布局，显示一行中的所有格子
                Row {
                    // for循环：遍历每一列
                    for (col in 0 until crossword.cols) {
                        // 获取当前格子数据
                        val cell = crossword.grid[row][col]

                        // 如果是墙格子，跳过不渲染（占位用 Spacer 保持网格对齐）
                        if (cell.isBlocked) {
                            Spacer(modifier = Modifier.size(cellSize))
                        } else {
                            // 判断当前格子是否被选中
                            // ==比较Pair的相等性（比较两个Int）
                            val isSelected = selectedCell == Pair(row, col)

                            // 判断当前格子是否在当前词语中
                            // getCells()：返回词语占据的所有格子坐标列表
                            // contains()：检查列表是否包含指定坐标
                            // ?: false：如果currentWord为null，返回false
                            val isInCurrentWord = currentWord?.getCells()?.contains(Pair(row, col)) == true

                            /**
                             * CellView - 单个格子组件
                             *
                             * 核心渲染单元
                             */
                            CellView(
                                // cell：格子数据（字母、是否墙等）
                                cell = cell,
                                // crossword：谜题引用（用于查找标号）
                                crossword = crossword,
                                // isSelected：是否选中
                                isSelected = isSelected,
                                // isInCurrentWord：是否在当前词语中
                                isInCurrentWord = isInCurrentWord,
                                // showSolution：是否显示答案
                                showSolution = showSolution,
                                // cellSize：格子尺寸
                                cellSize = cellSize,
                                // onClick：点击回调
                                onClick = { onCellClick(row, col) }
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * CellView - 单个格子视图
 *
 * 显示一个格子的所有元素：
 * 1. 背景色（墙、选中、高亮、空）
 * 2. 横排标号（左上角，数字）
 * 3. 竖排标号（右下角，字母）
 * 4. 字母
 *
 * @param cell：格子数据
 * @param crossword：谜题引用
 * @param isSelected：是否选中
 * @param isInCurrentWord：是否在当前词语中
 * @param showSolution：是否显示答案
 * @param cellSize：格子尺寸
 * @param onClick：点击回调
 */
@Composable
private fun CellView(
    cell: Cell,                    // 格子数据
    crossword: Crossword,           // 谜题引用
    isSelected: Boolean,           // 是否选中
    isInCurrentWord: Boolean,      // 是否在当前词语中
    showSolution: Boolean,         // 是否显示答案
    cellSize: Dp,                  // 格子尺寸
    onClick: () -> Unit            // 点击回调
) {
    /**
     * when表达式：确定背景色
     *
     * when类似switch，但更强大：
     * - 可以比较任意类型
     * - 支持范围匹配
     * - 支持条件表达式
     */
    val backgroundColor = when {
        // 条件1：是墙格子 → 使用墙颜色
        cell.isBlocked -> CellBlocked
        // 条件2：当前选中 → 使用选中颜色
        isSelected -> CellSelected
        // 条件3：在当前词语中 → 使用高亮颜色
        isInCurrentWord -> CellHighlight
        // 默认：空格子颜色
        else -> CellEmpty
    }

    /**
     * 确定文字颜色
     */
    val textColor = when {
        // 是墙格子 → 透明色（不显示文字）
        cell.isBlocked -> Color.Transparent
        // 有输入字母且显示答案模式
        cell.char != null && showSolution -> {
            // isCorrect：比较用户输入和正确答案
            if (cell.isCorrect) CellCorrect else CellIncorrect
        }
        // 默认：主要文字颜色
        else -> TextPrimary
    }

    /**
     * 查找格子左上角的横排标号
     *
     * 遍历所有横排词语，找到起始位置等于此格子位置的词语
     * 找到则返回该词语的displayLabel（数字标号）
     */
    val horizontalPlacement = crossword.placements.find {
        // it：当前遍历的WordPlacement
        // Direction.HORIZONTAL：筛选横排词语
        // it.row == cell.row：行相等
        // it.col == cell.col：列相等（起始位置）
        it.direction == Direction.HORIZONTAL &&
        it.row == cell.row &&
        it.col == cell.col
    }

    /**
     * 查找格子右下角的竖排标号
     *
     * 逻辑同上，但筛选竖排词语
     */
    val verticalPlacement = crossword.placements.find {
        it.direction == Direction.VERTICAL &&
        it.row == cell.row &&
        it.col == cell.col
    }

    // ?.安全调用：如果horizontalPlacement不为null，返回其displayLabel，否则null
    val horizontalLabel = horizontalPlacement?.displayLabel
    val verticalLabel = verticalPlacement?.displayLabel

    /**
     * 根据格子大小计算字体大小
     *
     * 标号字体：格子大小的22%
     * 字母字体：格子大小的55%
     */
    // cellSize.value：将Dp转为数值（Float）
    // *.sp：转为Sp单位用于字体大小
    val labelFontSize = (cellSize.value * 0.22).sp
    val letterFontSize = (cellSize.value * 0.55).sp

    /**
     * Box：层叠容器
     *
     * 用于叠加多个元素：
     * - 背景（通过modifier.background）
     * - 边框（通过modifier.border）
     * - 字母
     * - 标号
     */
    Box(
        modifier = Modifier
            // size：固定尺寸
            .size(cellSize)
            // background：背景色
            .background(backgroundColor)
            // border：边框，1dp灰色
            .border(1.dp, Color.Gray)
            // clickable：点击事件
            // enabled：是否启用点击，墙格子禁用
            .clickable(enabled = !cell.isBlocked) { onClick() },
        // contentAlignment：内容对齐方式，Center居中
        contentAlignment = Alignment.Center
    ) {
        /**
         * 横排标号 - 左上角
         *
         * 仅在存在标号且非墙格子时显示
         */
        if (horizontalLabel != null && !cell.isBlocked) {
            Text(
                // text：标号文本
                text = horizontalLabel,
                // fontSize：字体大小
                fontSize = labelFontSize,
                // color：文字颜色（灰色）
                color = TextSecondary,
                // modifier：对齐和边距
                modifier = Modifier
                    // align：内容对齐，TopStart左上角
                    .align(Alignment.TopStart)
                    // padding：内边距1dp
                    .padding(1.dp)
            )
        }

        /**
         * 竖排标号 - 右下角
         *
         * 仅在存在标号且非墙格子时显示
         */
        if (verticalLabel != null && !cell.isBlocked) {
            Text(
                text = verticalLabel,
                fontSize = labelFontSize,
                color = TextSecondary,
                modifier = Modifier
                    // align：BottomEnd右下角
                    .align(Alignment.BottomEnd)
                    .padding(1.dp)
            )
        }

        /**
         * 确定显示的字母
         */
        val displayChar = when {
            // 显示答案模式且非墙 → 显示正确答案（小写）
            showSolution && !cell.isBlocked -> cell.solutionChar?.lowercaseChar()
            // 非墙且有输入 → 显示用户输入
            !cell.isBlocked -> cell.char
            // 其他情况 → null（墙格子不显示）
            else -> null
        }

        /**
         * 字母文本
         */
        Text(
            // text：字母或空字符串
            text = displayChar?.toString() ?: "",
            fontSize = letterFontSize,
            // fontWeight：加粗
            fontWeight = FontWeight.Bold,
            color = textColor,
            // textAlign：居中对齐
            textAlign = TextAlign.Center
        )
    }
}

/**
 * ClueList - 线索列表组件
 *
 * 显示所有横排和竖排的线索
 * 使用LazyColumn实现高效滚动
 *
 * @param crossword：谜题数据
 * @param currentWord：当前选中的词语（用于高亮）
 * @param modifier：修饰符
 */
@Composable
fun ClueList(
    crossword: Crossword,
    currentWord: WordPlacement?,
    modifier: Modifier = Modifier
) {
    /**
     * 筛选横排线索并排序
     *
     * filter：过滤函数，返回满足条件的元素列表
     * sortedBy：排序函数，按指定属性排序
     */
    val horizontalClues = crossword.placements
        // filter：过滤出横排词语
        .filter { it.direction == Direction.HORIZONTAL }
        // sortedBy：按number排序
        .sortedBy { it.number }

    // 竖排线索，同上
    val verticalClues = crossword.placements
        .filter { it.direction == Direction.VERTICAL }
        .sortedBy { it.number }

    /**
     * Column with verticalScroll
     *
     * 垂直滚动容器
     * rememberScrollState()：记住滚动位置
     */
    Column(
        modifier = modifier
            // verticalScroll：添加垂直滚动
            .verticalScroll(rememberScrollState())
            // padding：内边距8dp
            .padding(8.dp)
    ) {
        /**
         * 横排线索标题
         */
        Text(
            text = "横排 (ACROSS)",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(vertical = 4.dp)
        )

        // forEach遍历每条线索
        horizontalClues.forEach { clue ->
            // 判断是否当前选中的词
            val isCurrent = currentWord?.id == clue.id
            ClueItem(
                clue = clue,
                isHighlighted = isCurrent,
                modifier = Modifier.padding(vertical = 2.dp)
            )
        }

        // 竖排线索前添加空白间距
        Spacer(modifier = Modifier.height(16.dp))

        /**
         * 竖排线索标题
         */
        Text(
            text = "竖排 (DOWN)",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(vertical = 4.dp)
        )

        verticalClues.forEach { clue ->
            val isCurrent = currentWord?.id == clue.id
            ClueItem(
                clue = clue,
                isHighlighted = isCurrent,
                modifier = Modifier.padding(vertical = 2.dp)
            )
        }
    }
}

/**
 * ClueItem - 单条线索组件
 *
 * 显示一条线索的编号和提示文本
 *
 * @param clue：词语位置数据（含编号和线索）
 * @param isHighlighted：是否高亮
 * @param modifier：修饰符
 */
@Composable
private fun ClueItem(
    clue: WordPlacement,          // 词语数据
    isHighlighted: Boolean,      // 是否高亮
    modifier: Modifier = Modifier
) {
    // 根据是否高亮决定背景色
    val backgroundColor = if (isHighlighted) CellHighlight else Color.Transparent

    // Row：水平布局
    Row(
        modifier = modifier
            // fillMaxWidth：宽度填满
            .fillMaxWidth()
            // background：背景色（高亮时）
            .background(backgroundColor)
            // padding：内边距4dp
            .padding(4.dp),
        // verticalAlignment：垂直居中
        verticalAlignment = Alignment.CenterVertically
    ) {
        /**
         * 编号
         */
        Text(
            // "${clue.displayLabel}."：如"1."、"A."
            text = "${clue.displayLabel}.",
            fontWeight = FontWeight.Bold,
            // width：固定宽度，确保对齐
            modifier = Modifier.width(32.dp)
        )

        /**
         * 线索文本
         *
         * clue.ifEmpty { clue.word }：
         * 如果clue为空字符串，显示单词本身作为提示
         */
        Text(
            text = clue.clue.ifEmpty { clue.word },
            color = TextSecondary
        )
    }
}
