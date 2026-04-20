// 包声明
package com.crossword.app.ui.game

// 导入领域模型
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement

/**
 * GameState - 游戏状态数据类
 *
 * 存储游戏的所有状态信息
 * 使用data class自动生成：
 * - equals()/hashCode()
 * - toString()
 * - copy()
 * - componentN()用于解构
 *
 * @property crossword：当前谜题，null表示未加载
 * @property isLoading：是否正在加载/生成谜题
 * @property errorMessage：错误信息，null表示无错误
 * @property selectedCell：当前选中的格子坐标，Pair(row, col)
 * @property currentDirection：当前输入方向（横/竖）
 * @property currentWord：当前选中的词语
 * @property showSolution：是否显示答案模式
 * @property isSolved：是否已解决（所有字母正确）
 */
data class GameState(
    // crossword：当前谜题数据
    // 默认值null，表示应用启动时无谜题
    val crossword: Crossword? = null,

    // isLoading：加载状态标志
    // true=正在生成谜题，显示加载界面
    val isLoading: Boolean = false,

    // errorMessage：错误信息
    // null=无错误
    // 非null=显示错误界面，值为错误描述
    val errorMessage: String? = null,

    // selectedCell：当前选中格子
    // Pair(row, col)，如Pair(3, 5)表示第3行第5列
    // null=无选中（刚启动或点击了墙）
    val selectedCell: Pair<Int, Int>? = null,

    // currentDirection：当前输入方向
    // HORIZONTAL=横排方向，输入字母向右移动
    // VERTICAL=竖排方向，输入字母向下移动
    // 默认横排
    val currentDirection: Direction = Direction.HORIZONTAL,

    // currentWord：当前选中的词语
    // null=当前未选中任何词语
    // 非null=显示该词语的线索
    val currentWord: WordPlacement? = null,

    val currentWords: List<WordPlacement> = emptyList(),

    // showSolution：答案显示模式
    // true=显示所有正确答案
    // false=只显示用户输入
    val showSolution: Boolean = false,

    // isSolved：完成标志
    // true=所有非墙格子都填入正确字母
    // 触发时显示恭喜弹窗
    val isSolved: Boolean = false
)

/**
 * GameAction - 游戏操作（用户动作） sealed类
 *
 * sealed类的特点：
 * - 所有子类必须在同一个文件中定义
 * - 编译器可以穷尽检查（exhaustive when）
 *
 * 这些是用户可以触发的所有操作
 * ViewModel负责处理这些操作并更新状态
 */
sealed class GameAction {

    /**
     * NewGame - 开始新游戏
     *
     * 触发时：
     * 1. 显示加载状态
     * 2. 重新加载词库
     * 3. 生成新谜题
     * 4. 更新crossword状态
     */
    object NewGame : GameAction()

    /**
     * SelectCell - 选择格子
     *
     * @property row：被选中格子的行索引（从0开始）
     * @property col：被选中格子的列索引（从0开始）
     *
     * 触发时：
     * 1. 更新selectedCell
     * 2. 确定currentWord和currentDirection
     * 3. 如果点击当前词的另一单元格，保持方向
     * 4. 如果点击不同方向的词，切换方向
     */
    data class SelectCell(
        val row: Int,  // 行索引
        val col: Int   // 列索引
    ) : GameAction()

    /**
     * ToggleDirection - 切换输入方向
     *
     * 横→竖 或 竖→横
     *
     * 触发时：
     * 1. 切换currentDirection
     * 2. 重新计算currentWord（尝试选中同格子不同方向的词）
     */
    object ToggleDirection : GameAction()

    /**
     * InputLetter - 输入字母
     *
     * @property letter：输入的字母字符
     *
     * 触发时：
     * 1. 将字母写入selectedCell
     * 2. 自动移动到下一个格子
     * 3. 检查是否完成
     */
    data class InputLetter(
        val letter: Char  // 字母字符
    ) : GameAction()

    /**
     * DeleteLetter - 删除字母
     *
     * 删除当前格子中的字母
     * 不自动移动光标
     *
     * 触发时：
     * 1. 清除selectedCell的内容
     */
    object DeleteLetter : GameAction()

    /**
     * ClearWord - 清除当前词
     *
     * 删除当前词语经过的所有格子
     * 包括当前词的所有字母
     *
     * 触发时：
     * 1. 获取currentWord
     * 2. 清除所有相关格子
     */
    object ClearWord : GameAction()

    /**
     * ShowSolution - 显示答案
     *
     * 在所有非墙格子显示正确答案
     * 用于提示或检查进度
     *
     * 触发时：
     * 1. 设置showSolution=true
     * 2. UI显示正确答案
     */
    object ShowSolution : GameAction()

    /**
     * HideSolution - 隐藏答案
     *
     * 隐藏所有正确答案
     * 只显示用户输入
     *
     * 触发时：
     * 1. 设置showSolution=false
     */
    object HideSolution : GameAction()

    /**
     * CheckAnswer - 检查答案
     *
     * 高亮显示填写错误的格子
     * （当前版本可能未实现）
     *
     * 触发时：
     * 1. 遍历所有格子
     * 2. 标记错误的格子
     */
    object CheckAnswer : GameAction()
}
