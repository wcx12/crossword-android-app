// 包声明
package com.crossword.app

// Bundle用于保存和传递Activity状态数据
import android.os.Bundle

// ComponentActivity是支持Jetpack Compose的Activity基类
import androidx.activity.ComponentActivity

// setContent用于设置Compose内容
import androidx.activity.compose.setContent

// fillMaxSize修饰符使组件填满整个父容器
import androidx.compose.foundation.layout.fillMaxSize

// MaterialTheme提供Material Design 3的颜色、字体等设计令牌
import androidx.compose.material3.MaterialTheme

// Surface是一个具有背景色的容器，提供elevation阴影效果
import androidx.compose.material3.Surface

// Modifier用于修改组件属性，如大小、padding、点击事件等
import androidx.compose.ui.Modifier

// 导入自定义的CrosswordTheme主题
import com.crossword.app.ui.theme.CrosswordTheme

// 导入游戏主屏幕组件
import com.crossword.app.ui.game.GameScreen

// MainActivity - 应用主入口Activity，继承ComponentActivity以支持Compose
class MainActivity : ComponentActivity() {
    // onCreate - Activity创建时调用的生命周期方法
    // savedInstanceState - 如果Activity是被重建的，包含之前保存的状态；首次创建时为null
    override fun onCreate(savedInstanceState: Bundle?) {
        // 调用父类的onCreate方法，必须首先调用
        super.onCreate(savedInstanceState)

        // setContent块内使用Compose DSL定义UI界面
        setContent {
            // CrosswordTheme - 应用自定义主题，包含颜色、字体等配置
            CrosswordTheme {
                // Surface - 提供背景色和elevation的基础容器
                // modifier - 修饰符配置
                Surface(
                    // fillMaxSize - 使Surface填满整个屏幕
                    modifier = Modifier.fillMaxSize(),
                    // color - 使用主题的background颜色作为背景
                    color = MaterialTheme.colorScheme.background
                ) {
                    // GameScreen - 游戏主界面组件
                    GameScreen()
                }
            }
        }
    }
}
