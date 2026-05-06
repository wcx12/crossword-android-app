package com.crossword.app.ui.game

enum class GameDestination(
    val title: String,
    val isConfiguration: Boolean
) {
    Game(title = "填字游戏", isConfiguration = false),
    Settings(title = "配置", isConfiguration = true)
}
