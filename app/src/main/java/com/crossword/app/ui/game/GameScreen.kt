// 包声明，声明当前文件所属的包
package com.crossword.app.ui.game

// background：设置组件背景色
import androidx.compose.foundation.background

// border：设置组件边框
import androidx.compose.foundation.border

// clickable：添加点击事件处理
import androidx.compose.foundation.clickable

// layout相关：Column垂直布局、Row水平布局、Box层叠布局等
import androidx.compose.foundation.layout.*

// LazyColumn：高性能列表，用于显示大量数据（如线索列表）
import androidx.compose.foundation.lazy.LazyColumn

// items：LazyColumn的items扩展函数
import androidx.compose.foundation.lazy.items

// RoundedCornerShape：圆角矩形形状
import androidx.compose.foundation.shape.RoundedCornerShape

// Material3组件库：提供现代化的UI组件
import androidx.compose.material3.*

// compose运行时：remember存储局部状态，mutableStateOf创建可观察状态
import androidx.compose.runtime.*

// Alignment：对齐方式（TopStart左上、Center居中等）
import androidx.compose.ui.Alignment

// Modifier：修改器，用于修改组件属性（大小、padding等）
import androidx.compose.ui.Modifier

// Color：颜色类
import androidx.compose.ui.graphics.Color

// FontWeight：字体粗细（Bold粗体、Normal正常）
import androidx.compose.ui.text.font.FontWeight

// TextAlign：文本对齐方式
import androidx.compose.ui.text.style.TextAlign

// dp：密度无关像素，用于尺寸定义
import androidx.compose.ui.unit.dp

// sp：缩放无关像素，用于字体大小
import androidx.compose.ui.unit.sp

// viewmodel：创建或获取ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel

// 导入领域模型的Direction枚举
import com.crossword.app.domain.model.Direction

// 导入主题颜色
import com.crossword.app.ui.theme.*

// OptIn：启用实验性Material3 API（如TopAppBar）
@OptIn(ExperimentalMaterial3Api::class)

// GameScreen：游戏主界面 Composable 函数
// @Composable：Jetpack Compose标记，表示这是可组合的UI函数
// @param viewModel：游戏ViewModel，默认自动创建，可传入自定义ViewModel用于测试
@Composable
fun GameScreen(
    // viewModel()：Jetpack Compose的viewModel扩展
    viewModel: GameViewModel = viewModel()
) {
    // 收集ViewModel的状态
    // state by viewModel.state.collectAsState()
    // - viewModel.state：StateFlow<GameState>，状态流
    // - collectAsState()：将Flow转为Compose的State对象
    // - by关键字：委托属性，直接使用state.xxx而非state.value.xxx
    val state by viewModel.state.collectAsState()

    // Scaffold：脚手架组件，提供标准的Material3页面结构
    // topBar：顶部应用栏
    // bottomBar：底部导航栏
    // floatingActionButton：悬浮按钮
    // content：主内容区域
    Scaffold(
        // topBar：顶部应用栏
        topBar = {
            // TopAppBar：Material3风格的顶部栏
            TopAppBar(
                // title：标题文本
                title = { Text("填字游戏") },

                // colors：配置颜色
                colors = TopAppBarDefaults.topAppBarColors(
                    // containerColor：背景色，使用主题primary色
                    containerColor = MaterialTheme.colorScheme.primary,
                    // titleContentColor：标题文字颜色，使用主题onPrimary色
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                ),

                // actions：标题栏右侧的操作按钮
                actions = {
                    // TextButton：文本按钮（无背景）
                    TextButton(
                        // onClick：点击事件处理，调用ViewModel的新游戏方法
                        onClick = { viewModel.newGame() },
                        // colors：按钮颜色配置
                        colors = ButtonDefaults.textButtonColors(
                            // contentColor：按钮文字颜色
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    ) {
                        // Text：文本组件，显示"新游戏"
                        Text("新游戏")
                    }
                }
            )
        }
    ) { padding ->
        // Column：垂直布局容器，所有子组件从上到下排列
        Column(
            // modifier：修饰符链
            modifier = Modifier
                // fillMaxSize：填满父组件提供的所有空间
                .fillMaxSize()
                // padding：添加内边距，padding值来自Scaffold的padding参数
                // 这确保内容不会被topBar遮挡
                .padding(padding)
        ) {
            // when表达式：类似于switch，根据条件显示不同UI
            when {
                // 条件1：正在加载
                state.isLoading -> {
                    // LoadingView：加载中提示组件
                    LoadingView()
                }

                // 条件2：存在错误消息
                state.errorMessage != null -> {
                    // ErrorView：错误显示和重试按钮
                    ErrorView(
                        // message：错误消息文本
                        message = state.errorMessage!!,
                        // !!操作符：强制解包，表示开发者确定此值不为null
                        onRetry = { viewModel.newGame() }
                    )
                }

                // 条件3：谜题已加载（非null）
                state.crossword != null -> {
                    // GameContent：游戏主要内容组件
                    GameContent(
                        // state：完整游戏状态
                        state = state,
                        // onCellClick：格子点击回调
                        // lambda语法：lambda表达式作为最后一个参数可放在括号外
                        onCellClick = { row, col -> viewModel.selectCell(row, col) },
                        // onToggleDirection：切换方向回调
                        onToggleDirection = { viewModel.toggleDirection() },
                        // onSetDirection：设置方向回调
                        onSetDirection = { viewModel.setDirection(it) },
                        // onLetterInput：字母输入回调
                        onLetterInput = { viewModel.inputLetter(it) },
                        // onDelete：删除字母回调
                        onDelete = { viewModel.deleteLetter() },
                        // onShowSolution：显示答案回调
                        onShowSolution = { viewModel.showSolution() },
                        // onHideSolution：隐藏答案回调
                        onHideSolution = { viewModel.hideSolution() }
                    )
                }

                // 条件4：以上都不满足（crossword为null且无错误）
                else -> {
                    // EmptyView：空状态提示组件
                    EmptyView(onStartGame = { viewModel.newGame() })
                }
            }
        }
    }

    // 解决弹窗：在when块外的Composable中检查状态
    // if表达式：根据条件决定是否显示组件
    // 区别：when用于分支选择，if用于单一条件判断

    // state.isSolved：游戏是否已解决（所有字母正确）
    if (state.isSolved) {
        // SolvedDialog：庆祝弹窗组件
        SolvedDialog()
    }
}

// LoadingView：加载中视图
// @Composable：Jetpack Compose函数标记
// private：私有函数，只能在同一文件内调用
@Composable
private fun LoadingView() {
    // Box：层叠布局容器，默认子组件按顺序绘制
    Box(
        // modifier：填满父组件
        modifier = Modifier.fillMaxSize(),
        // contentAlignment：子组件在Box内的对齐方式
        // Center：水平和垂直都居中
        contentAlignment = Alignment.Center
    ) {
        // Text：文本组件
        Text(
            // text：显示的文本内容
            text = "生成谜题中...",
            // style：文本样式，使用主题的bodyLarge样式
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

// ErrorView：错误视图
// @param message：错误消息文本
// @param onRetry：点击重试按钮的回调
@Composable
private fun ErrorView(
    // message：错误消息
    message: String,
    // onRetry：重试回调，() -> Unit表示无参数无返回值的函数类型
    onRetry: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        // Column：垂直布局，使文本和按钮垂直排列
        Column(
            // horizontalAlignment：子组件水平居中
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 错误消息文本
            Text(
                text = message,
                // color：文本颜色，使用主题的error颜色（通常是红色）
                color = MaterialTheme.colorScheme.error,
                // textAlign：文本对齐方式，Center居中对齐
                textAlign = TextAlign.Center,
                // modifier：添加padding防止文字贴边
                modifier = Modifier.padding(16.dp)
            )

            // Button：填充按钮
            Button(
                // onClick：按钮点击事件
                onClick = onRetry
            ) {
                Text("重试")
            }
        }
    }
}

// EmptyView：空状态视图
// @param onStartGame：点击开始游戏按钮的回调
@Composable
private fun EmptyView(
    onStartGame: () -> Unit  // 开始游戏回调
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 提示文本
            Text(
                text = "点击下方按钮开始新游戏",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(16.dp)
            )

            // 开始游戏按钮
            Button(
                onClick = onStartGame
            ) {
                Text("新游戏")
            }
        }
    }
}

// GameContent：游戏内容组件
// @param state：游戏状态
// @param onCellClick：格子点击回调
// @param onToggleDirection：切换方向回调
// @param onSetDirection：设置方向回调
// @param onLetterInput：字母输入回调
// @param onDelete：删除回调
// @param onShowSolution：显示答案回调
// @param onHideSolution：隐藏答案回调
@Composable
private fun GameContent(
    state: GameState,                                              // 游戏状态
    onCellClick: (Int, Int) -> Unit,                              // (row, col)点击回调
    onToggleDirection: () -> Unit,                                 // 切换方向回调
    onSetDirection: (Direction) -> Unit,                           // 设置方向回调
    onLetterInput: (Char) -> Unit,                                 // 字母输入回调
    onDelete: () -> Unit,                                          // 删除回调
    onShowSolution: () -> Unit,                                    // 显示答案回调
    onHideSolution: () -> Unit                                     // 隐藏答案回调
) {
    // !!操作符：强制解包crossword
    // 由于state.crossword在GameContent中非空，所以可以安全解包
    val crossword = state.crossword!!

    // Column：垂直布局容器
    Column(
        // fillMaxSize：填满可用空间
        modifier = Modifier.fillMaxSize()
    ) {
        // 顶部提示栏
        HintBar(
            // currentWord：当前选中的词语
            currentWord = state.currentWord,
            // direction：当前方向
            direction = state.currentDirection,
            // showSolution：是否显示答案
            showSolution = state.showSolution,
            // onToggleDirection：切换方向回调
            onToggleDirection = onToggleDirection,
            // onSetDirection：设置方向回调
            onSetDirection = onSetDirection,
            // onShowSolution：显示/隐藏答案回调（三元表达式）
            // 如果当前正在显示答案，则点击应隐藏；否则点击应显示
            onShowSolution = if (state.showSolution) onHideSolution else onShowSolution
        )

        // CrosswordGrid：纵横字谜网格组件
        // weight(1f)：Flexbox权重，使此组件占据剩余的所有空间
        CrosswordGrid(
            // crossword：谜题数据
            crossword = crossword,
            // selectedCell：当前选中的格子坐标
            selectedCell = state.selectedCell,
            // currentWord：当前词语
            currentWord = state.currentWord,
            // currentDirection：当前方向
            currentDirection = state.currentDirection,
            // showSolution：是否显示答案
            showSolution = state.showSolution,
            // onCellClick：格子点击回调
            onCellClick = onCellClick,
            // modifier：配置weight使网格占据剩余空间
            modifier = Modifier
                .weight(1f)    // 权重1，占据剩余空间
                .fillMaxWidth()  // 宽度填满
        )

        // Keyboard：字母键盘组件
        Keyboard(
            // onLetterClick：字母点击回调
            onLetterClick = onLetterInput,
            // onDeleteClick：删除按钮回调
            onDeleteClick = onDelete,
            // modifier：添加padding
            modifier = Modifier.padding(8.dp)
        )
    }
}

// HintBar：提示栏组件
// @param currentWord：当前选中的词语
// @param direction：当前方向
// @param showSolution：是否显示答案
// @param onToggleDirection：切换方向回调
// @param onSetDirection：设置方向回调
// @param onShowSolution：显示/隐藏答案回调
@Composable
private fun HintBar(
    // currentWord：当前词语，可为null
    currentWord: com.crossword.app.domain.model.WordPlacement?,
    direction: Direction,                                         // 当前方向
    showSolution: Boolean,                                       // 是否显示答案
    onToggleDirection: () -> Unit,                               // 切换方向回调
    onSetDirection: (Direction) -> Unit,                         // 设置方向回调
    onShowSolution: () -> Unit                                    // 显示/隐藏答案回调
) {
    // Row：水平布局容器，子组件从左到右排列
    Row(
        // fillMaxWidth：宽度填满
        modifier = Modifier
            .fillMaxWidth()
            // background：背景色，使用主题的surfaceVariant颜色
            .background(MaterialTheme.colorScheme.surfaceVariant)
            // padding：内边距，horizontal=左右16dp，vertical=上下8dp
            .padding(horizontal = 16.dp, vertical = 8.dp),
        // horizontalArrangement：子组件水平排列方式
        // SpaceBetween：子组件分散排列，第一个在左，最后一个在右
        horizontalArrangement = Arrangement.SpaceBetween,
        // verticalAlignment：子组件垂直对齐方式
        // CenterVertically：垂直居中对齐
        verticalAlignment = Alignment.CenterVertically
    ) {
        // 左侧：当前线索
        // Column：垂直布局，占据可用空间（weight(1f)）
        Column(
            // weight(1f)：占据左侧所有剩余空间，使右侧按钮被推到边缘
            modifier = Modifier.weight(1f)
        ) {
            // if表达式：检查currentWord是否有值
            if (currentWord != null) {
                // 词语编号和方向
                Text(
                    // displayLabel：显示标签（数字或字母）
                    // direction == Direction.HORIZONTAL ? "横" : "竖"：三元表达式
                    text = "${currentWord.displayLabel}. ${if (direction == Direction.HORIZONTAL) "横" else "竖"}",
                    // style：使用主题的labelMedium样式
                    style = MaterialTheme.typography.labelMedium,
                    // color：主色调
                    color = MaterialTheme.colorScheme.primary
                )

                // 线索文本
                Text(
                    // clue.ifEmpty { word }：如果clue为空，显示单词本身
                    text = currentWord.clue.ifEmpty { currentWord.word },
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                // 没有选中词语时的提示
                Text(
                    text = "点击格子开始",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 中间/右侧：方向切换按钮
        Row(
            // horizontalArrangement：水平间距
            // spacedBy(8.dp)：子组件之间8dp间距
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            // verticalAlignment：垂直居中
            verticalAlignment = Alignment.CenterVertically
        ) {
            // DirectionButton：自定义方向按钮组件
            // 横按钮
            DirectionButton(
                text = "横",                                              // 按钮文字
                isSelected = direction == Direction.HORIZONTAL,          // 是否选中
                onClick = { onSetDirection(Direction.HORIZONTAL) }       // 点击回调
            )
            // 竖按钮
            DirectionButton(
                text = "竖",
                isSelected = direction == Direction.VERTICAL,
                onClick = { onSetDirection(Direction.VERTICAL) }
            )
        }

        // 显示答案按钮
        // TextButton：文本按钮，无背景
        TextButton(
            onClick = onShowSolution
        ) {
            // if表达式决定按钮文字
            Text(if (showSolution) "隐藏答案" else "显示答案")
        }
    }
}

// DirectionButton：方向切换按钮
// @param text：按钮文字
// @param isSelected：是否选中状态
// @param onClick：点击回调
@Composable
private fun DirectionButton(
    text: String,            // 按钮文字
    isSelected: Boolean,      // 是否选中
    onClick: () -> Unit      // 点击回调
) {
    // 根据是否选中决定背景色
    val backgroundColor = if (isSelected) {
        // 选中时：使用主题的primaryContainer颜色
        MaterialTheme.colorScheme.primaryContainer
    } else {
        // 未选中时：使用主题的surface颜色
        MaterialTheme.colorScheme.surface
    }

    // 根据是否选中决定文字颜色
    val textColor = if (isSelected) {
        // 选中时：使用主题的onPrimaryContainer颜色
        MaterialTheme.colorScheme.onPrimaryContainer
    } else {
        // 未选中时：使用主题的onSurface颜色
        MaterialTheme.colorScheme.onSurface
    }

    // Surface：表面容器，提供背景和形状
    Surface(
        modifier = Modifier
            // border：边框
            // width：边框宽度2dp
            // color：边框颜色，选中用primary，未选中用outline
            // shape：圆角矩形，8dp圆角
            .border(
                width = 2.dp,
                color = if (isSelected) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.outline,
                shape = RoundedCornerShape(8.dp)
            )
            // clickable：添加点击效果
            .clickable { onClick() },
        // color：背景色
        color = backgroundColor,
        // shape：形状，圆角矩形
        shape = RoundedCornerShape(8.dp)
    ) {
        // Text：按钮文字
        Text(
            text = text,
            // modifier：padding
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            // color：文字颜色
            color = textColor,
            // fontWeight：字体粗细，选中时加粗
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

// Keyboard：字母键盘组件
// @param onLetterClick：字母点击回调
// @param onDeleteClick：删除按钮点击回调
// @param modifier：修饰符
@Composable
private fun Keyboard(
    onLetterClick: (Char) -> Unit,  // 字母点击回调，Char参数是点击的字母
    onDeleteClick: () -> Unit,      // 删除回调
    modifier: Modifier = Modifier   // 可选修饰符，有默认值
) {
    // toList()：将String转为List<Char>
    // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"是26个大写字母
    val letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toList()

    // Column：垂直布局
    Column(
        modifier = modifier
            // fillMaxWidth：宽度填满
            .fillMaxWidth()
            // padding：内边距4dp
            .padding(4.dp),
        // horizontalAlignment：水平居中
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // chunked(9)：将列表分块，每块9个元素
        // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"分成：
        // [A-I], [J-R], [S-Z](7个)
        letters.chunked(9).forEach { row ->
            // Row：每行9个字母
            Row(
                modifier = Modifier.fillMaxWidth(),
                // Arrangement.SpaceEvenly：子组件均匀分布，间距相等
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // forEach：遍历每一行的每个字母
                row.forEach { letter ->
                    // KeyButton：单个字母按钮
                    KeyButton(
                        letter = letter,                          // 当前字母
                        onClick = { onLetterClick(letter) }       // 点击回调
                    )
                }
            }
        }

        // Spacer：空白间距
        // height：高度8dp
        Spacer(modifier = Modifier.height(8.dp))

        // 删除按钮行
        Row(
            modifier = Modifier.fillMaxWidth(),
            // horizontalArrangement：水平居中
            horizontalArrangement = Arrangement.Center
        ) {
            // FunctionKey：功能键组件
            FunctionKey(
                text = "删除",                      // 按钮文字
                onClick = onDeleteClick,          // 点击回调
                // modifier：宽度120dp
                modifier = Modifier.width(120.dp)
            )
        }
    }
}

// KeyButton：字母按键组件
// @param letter：要显示的字母
// @param onClick：点击回调
@Composable
private fun KeyButton(
    letter: Char,            // 字母字符
    onClick: () -> Unit      // 点击回调
) {
    // Surface：按钮表面
    Surface(
        modifier = Modifier
            // size：固定尺寸36dp x 36dp
            .size(36.dp)
            // padding：内边距2dp
            .padding(2.dp)
            // clickable：点击事件处理
            .clickable { onClick() },
        // shape：形状，4dp圆角
        shape = RoundedCornerShape(4.dp),
        // color：背景色
        color = MaterialTheme.colorScheme.surface,
        // tonalElevation：音调高度，影响阴影颜色
        tonalElevation = 2.dp
    ) {
        // Box：层叠容器
        Box(
            // contentAlignment：内容居中
            contentAlignment = Alignment.Center
        ) {
            // Text：字母文本
            Text(
                // toString()：Char转String
                text = letter.toString(),
                // fontWeight：中等粗细
                fontWeight = FontWeight.Medium,
                // fontSize：字体大小16sp
                fontSize = 16.sp
            )
        }
    }
}

// FunctionKey：功能键组件
// @param text：按钮文字
// @param onClick：点击回调
// @param modifier：可选修饰符
@Composable
private fun FunctionKey(
    text: String,            // 按钮文字
    onClick: () -> Unit,     // 点击回调
    modifier: Modifier = Modifier  // 修饰符
) {
    // Surface：表面容器
    Surface(
        modifier = modifier
            // height：固定高度40dp
            .height(40.dp)
            // clickable：点击事件
            .clickable { onClick() },
        // shape：形状，4dp圆角
        shape = RoundedCornerShape(4.dp),
        // color：背景色，使用surfaceVariant
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        // Box：内容居中容器
        Box(
            // contentAlignment：居中对齐
            contentAlignment = Alignment.Center,
            // modifier：左右padding
            modifier = Modifier.padding(horizontal = 16.dp)
        ) {
            // Text：按钮文字
            Text(text = text)
        }
    }
}

// SolvedDialog：游戏完成弹窗
@Composable
private fun SolvedDialog() {
    // AlertDialog：Material3警告对话框
    AlertDialog(
        // onDismissRequest：点击对话框外部或返回键时的回调
        // 空实现表示不可通过这些方式关闭
        onDismissRequest = { },
        // title：对话框标题
        title = { Text("恭喜！") },
        // text：对话框内容
        text = { Text("你已完成所有填词！") },
        // confirmButton：确认按钮
        confirmButton = {
            // TextButton：文本按钮
            TextButton(
                onClick = { /* 关闭对话框 */ }  // 空实现，实际通过状态控制关闭
            ) {
                Text("确定")
            }
        }
    )
}
